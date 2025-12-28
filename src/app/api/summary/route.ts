import { NextRequest, NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { generateText } from "ai";

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

    const { fileId } = body;
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

    // Update usage count and check limits
    const reservation = await reserveUsage({
      fileId,
      countField: "summarizeCount",
      limitField: "summarizeLimit",
    });
    rollback = reservation.rollback;

    // Generate summary
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

    const savedSummary = existingSummary
      ? await db.documentSummary.update({
          where: { fileId },
          data: { summary: text },
        })
      : await db.documentSummary.create({
          data: {
            summary: text,
            fileId,
            userId,
          },
        });

    const updatedFile = await db.file.findUnique({
      where: { id: fileId },
      select: {
        summarizeCount: true,
        summarizeLimit: true,
        name: true,
      },
    });

    return NextResponse.json({
      summary: savedSummary.summary,
      fileId,
      fileName: updatedFile?.name,
      id: savedSummary.id,
      createdAt: savedSummary.createdAt,
      updatedAt: savedSummary.updatedAt,
      isNew: !existingSummary,
      usage: {
        summarizeCount: updatedFile?.summarizeCount,
        summarizeLimit: updatedFile?.summarizeLimit,
      },
    });
  } catch (error) {
    // Roll back incase generate error happen
    if (rollback) {
      await rollback();
    }

    if (error instanceof UsageLimitError) {
      return NextResponse.json(
        {
          error: "Summarize limit reached",
          code: "SUMMARIZE_LIMIT_EXCEEDED",
        },
        { status: 403 }
      );
    }

    console.error("Error generating summary:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};
