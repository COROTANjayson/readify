import { NextRequest, NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { generateText } from "ai";

import { db } from "@/db";
import { getPineconeClient } from "@/lib/pinecone";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId, regenerate = false } = body;
    const userId = user.id;

    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 });
    }

    const file = await db.file.findFirst({
      where: { id: fileId, userId, deletedAt: null },
    });

    if (!file) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const existingSummary = await db.documentSummary.findUnique({
      where: { fileId },
    });

    if (existingSummary && !regenerate) {
      return NextResponse.json({
        summary: existingSummary.summary,
        isNew: false,
        usage: {
          summarizeCount: file.summarizeCount,
          summarizeLimit: file.summarizeLimit,
        },
      });
    }

    if (file.summarizeCount >= file.summarizeLimit) {
      return NextResponse.json(
        {
          error: "Summarize limit reached",
          code: "SUMMARIZE_LIMIT_EXCEEDED",
        },
        { status: 403 }
      );
    }
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const pinecone = await getPineconeClient();
    const pineconeIndex = pinecone.Index("summaraize");

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      namespace: file.id,
    });

    const results = await vectorStore.similaritySearch("summary overview main points key information", 10);
    console.log("similaritySearch", results.map((r) => r.pageContent).join("\n\n"));
    if (results.length === 0) {
      return NextResponse.json({ error: "No content found for this document" }, { status: 404 });
    }

    const { text } = await generateText({
      model: openai("gpt-3.5-turbo"),
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: "You are a professional document summarizer. Create HTML summaries.",
        },
        {
          role: "user",
          content: results.map((r) => r.pageContent).join("\n\n"),
        },
      ],
    });

    /* ─────────────────────────────
       5️⃣ FAST TRANSACTION (SAVE + INCREMENT)
    ───────────────────────────── */
    const [updatedFile, savedSummary] = await db.$transaction([
      db.file.update({
        where: { id: fileId },
        data: {
          summarizeCount: { increment: 1 },
        },
      }),

      existingSummary
        ? db.documentSummary.update({
            where: { fileId },
            data: { summary: text },
          })
        : db.documentSummary.create({
            data: {
              summary: text,
              fileId,
              userId,
            },
          }),
    ]);

    /* ─────────────────────────────
       6️⃣ Return response
    ───────────────────────────── */
    return NextResponse.json({
      summary: savedSummary.summary,
      fileId: file.id,
      fileName: file.name,
      id: savedSummary.id,
      createdAt: savedSummary.createdAt,
      updatedAt: savedSummary.updatedAt,
      isNew: !existingSummary,
      usage: {
        summarizeCount: updatedFile.summarizeCount,
        summarizeLimit: updatedFile.summarizeLimit,
      },
    });
  } catch (error) {
    console.error("Error generating summary:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};
