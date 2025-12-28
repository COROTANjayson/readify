// app/api/generate-ppt/route.ts
import { NextRequest, NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { generateText } from "ai";
import PptxGenJS from "pptxgenjs";

import { db } from "@/db";
import { getPineconeClient } from "@/lib/pinecone";
import { rateLimit } from "@/lib/rate-limit";
import { reserveUsage, UsageLimitError } from "@/lib/tools/usageGuard";

export const POST = async (req: NextRequest) => {
  let rollback: (() => Promise<void>) | null = null;

  try {
    const body = await req.json();
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success } = await rateLimit.limit(user.id);
    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { fileId, slideCount = 5 } = body;
    const userId = user.id;

    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 });
    }

    const file = await db.file.findFirst({
      where: { id: fileId, userId },
    });

    if (!file) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const reservation = await reserveUsage({
      fileId,
      countField: "presentationCount",
      limitField: "presentationLimit",
    });

    rollback = reservation.rollback;

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const pinecone = await getPineconeClient();
    const pineconeIndex = pinecone.Index("summaraize");

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      namespace: file.id,
    });

    const results = await vectorStore.similaritySearch(
      "summary key points main topics important information highlights",
      15
    );

    if (results.length === 0) {
      return NextResponse.json({ error: "No content found for this document" }, { status: 404 });
    }

    const documentContent = results.map((r) => r.pageContent).join("\n\n");

    const { text } = await generateText({
      model: openai("gpt-4-turbo-preview"),
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: "You are an expert presentation designer who creates well-structured, engaging slide decks.",
        },
        {
          role: "user",
          content: `Create a ${slideCount}-slide presentation outline based on the document content below. Respond ONLY with pure JSON.

DOCUMENT CONTENT:
${documentContent}

Generate JSON with structure:
{
  "title": "Compelling Presentation Title",
  "slides": [
    { "title": "Slide Title", "content": ["Bullet 1", "Bullet 2"] }
  ]
}

Requirements:
- ${slideCount} slides
- Title slide first
- 3-5 bullet points per slide
- Logical flow
- Professional tone

Return ONLY JSON.`,
        },
      ],
    });

    const cleanedResponse = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const presentationData = JSON.parse(cleanedResponse);

    if (!presentationData.title || !Array.isArray(presentationData.slides)) {
      throw new Error("INVALID_PRESENTATION_JSON");
    }

    const pptx = new PptxGenJS();
    pptx.author = user.given_name || "User";
    pptx.company = "Summaraize";
    pptx.title = presentationData.title;

    const titleSlide = pptx.addSlide();
    titleSlide.background = { color: "F1F5F9" };
    titleSlide.addText(presentationData.title, {
      x: 0.5,
      y: 2.5,
      w: 9,
      h: 1.5,
      fontSize: 44,
      bold: true,
      color: "1E293B",
      align: "center",
    });
    titleSlide.addText(`Generated from: ${file.name}`, {
      x: 0.5,
      y: 4.5,
      w: 9,
      h: 0.5,
      fontSize: 14,
      color: "64748B",
      align: "center",
    });

    for (let i = 1; i < presentationData.slides.length; i++) {
      const slideData = presentationData.slides[i];
      const slide = pptx.addSlide();

      slide.addText(slideData.title, {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 0.75,
        fontSize: 32,
        bold: true,
      });

      slide.addText(
        slideData.content.map((point: string) => ({
          text: point,
          options: { bullet: true, fontSize: 18 },
        })),
        { x: 1, y: 1.5, w: 8, h: 4 }
      );
    }

    const pptxData = (await pptx.write({ outputType: "base64" })) as string;

    /**
     * 💾 Save presentation record
     */
    const presentation = await db.presentation.create({
      data: {
        fileId,
        userId,
        fileName: `${file.name.replace(/\.[^/.]+$/, "")}_presentation.pptx`,
        slideCount,
        content: JSON.stringify(presentationData),
        pptxData,
        downloadUrl: `/api/download-ppt/${fileId}`,
      },
    });

    return NextResponse.json({
      presentationId: presentation.id,
      downloadUrl: presentation.downloadUrl,
      fileName: presentation.fileName,
      slideCount: presentation.slideCount,
      isNew: true,
    });
  } catch (error) {
    if (rollback) {
      await rollback();
    }
    if (error instanceof UsageLimitError) {
      return NextResponse.json({ error: "Presentation limit reached" }, { status: 403 });
    }
    console.error("PPT generation error:", error);
    return NextResponse.json({ error: "Failed to generate presentation" }, { status: 500 });
  }
};
