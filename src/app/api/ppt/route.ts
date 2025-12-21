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

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId } = user;
    const { fileId, slideCount = 5, regenerate = false } = body;

    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 });
    }

    // Verify file ownership
    const file = await db.file.findFirst({
      where: {
        id: fileId,
        userId,
      },
    });

    if (!file) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check for existing presentation
    const existingPresentation = await db.presentation.findFirst({
      where: {
        fileId,
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (existingPresentation && !regenerate) {
      return NextResponse.json({
        presentationId: existingPresentation.id,
        downloadUrl: existingPresentation.downloadUrl,
        fileName: existingPresentation.fileName,
        slideCount: existingPresentation.slideCount,
        isNew: false,
        exists: true,
      });
    }

    // If regenerating, delete the old presentation
    if (existingPresentation && regenerate) {
      await db.presentation.delete({
        where: {
          id: existingPresentation.id,
        },
      });
    }

    // Get document content from Pinecone
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const pinecone = await getPineconeClient();
    const pineconeIndex = pinecone.Index("summaraize");

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      namespace: file.id,
    });

    // Retrieve relevant content for presentation
    const results = await vectorStore.similaritySearch(
      "summary key points main topics important information highlights",
      15
    );

    if (results.length === 0) {
      return NextResponse.json({ error: "No content found for this document" }, { status: 404 });
    }

    const documentContent = results.map((r) => r.pageContent).join("\n\n");

    // Generate presentation content using OpenAI
    const { text } = await generateText({
      model: openai("gpt-4-turbo-preview"),
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: `You are an expert presentation designer who creates well-structured, engaging slide decks. You excel at distilling complex information into clear, concise slides with compelling narratives.`,
        },
        {
          role: "user",
          content: `Create a ${slideCount}-slide presentation outline based on the document content below. Respond ONLY with pure JSON. Do NOT include code fences, markdown, or backticks.

DOCUMENT CONTENT:
${documentContent}

Generate a JSON response with this EXACT structure:
{
  "title": "Compelling Presentation Title",
  "slides": [
    {
      "title": "Slide Title",
      "content": ["Bullet point 1", "Bullet point 2", "Bullet point 3"]
    }
  ]
}

Requirements:
- Create exactly ${slideCount} slides
- First slide should be a title slide with just the main topic
- Each content slide should have a clear, descriptive title
- Each slide should have 3-5 concise, impactful bullet points
- Bullet points should be actionable and specific
- Content should flow logically from slide to slide
- Last slide can be a summary, conclusion, or call-to-action
- Use professional language suitable for business presentations
- Ensure all content is derived from the provided document

Remember: Return ONLY the JSON object, no additional text or formatting.`,
        },
      ],
    });

    // Clean and parse the response
    const cleanedResponse = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    let presentationData;
    try {
      presentationData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Raw response:", text);
      return NextResponse.json({ error: "Failed to parse presentation data" }, { status: 500 });
    }

    // Validate the structure
    if (!presentationData.title || !Array.isArray(presentationData.slides)) {
      return NextResponse.json({ error: "Invalid presentation structure" }, { status: 500 });
    }

    // Generate PowerPoint using PptxGenJS
    const pptx = new PptxGenJS();

    // Set presentation properties
    pptx.author = user.given_name || "User";
    pptx.company = "Summaraize";
    pptx.title = presentationData.title;

    // Add title slide
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

    // Add content slides
    for (let i = 1; i < presentationData.slides.length; i++) {
      const slideData = presentationData.slides[i];
      const slide = pptx.addSlide();
      slide.background = { color: "FFFFFF" };

      // Add slide title
      slide.addText(slideData.title, {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 0.75,
        fontSize: 32,
        bold: true,
        color: "1E293B",
      });

      // Add bullet points
      const bulletPoints = slideData.content.map((point: string) => ({
        text: point,
        options: { bullet: true, fontSize: 18, color: "334155" },
      }));

      slide.addText(bulletPoints, {
        x: 1,
        y: 1.5,
        w: 8,
        h: 4,
      });

      // Add slide number
      slide.addText(`${i + 1}`, {
        x: 9,
        y: 5.2,
        w: 0.5,
        h: 0.3,
        fontSize: 12,
        color: "94A3B8",
        align: "right",
      });
    }

    // Generate PPTX file as base64
    const pptxData = await pptx.write({ outputType: "base64" });

    // Save presentation metadata to database
    const presentation = await db.presentation.create({
      data: {
        fileId,
        userId,
        fileName: `${file.name.replace(/\.[^/.]+$/, "")}_presentation.pptx`,
        slideCount,
        content: JSON.stringify(presentationData),
        pptxData: pptxData as string, // Store base64 data
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
    console.error("PPT generation error:", error);
    return NextResponse.json({ error: "Failed to generate presentation" }, { status: 500 });
  }
};
