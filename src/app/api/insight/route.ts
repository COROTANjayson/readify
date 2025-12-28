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

    const { fileId, regenerate = false } = body;
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

    const existingInsight = await db.documentInsight.findUnique({
      where: { fileId },
    });
    if (existingInsight && !regenerate) {
      return NextResponse.json({
        insight: existingInsight.insight,
        keyFindings: existingInsight.keyFindings,
        actionItems: existingInsight.actionItems,
        questions: existingInsight.questions,
        fileId: file.id,
        fileName: file.name,
        id: existingInsight.id,
        createdAt: existingInsight.createdAt,
        isNew: false,
      });
    }

    const reservation = await reserveUsage({
      fileId,
      countField: "insightCount",
      limitField: "insightLimit",
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
      "key insights analysis patterns trends implications recommendations",
      15
    );

    if (results.length === 0) {
      return NextResponse.json({ error: "No content found for this document" }, { status: 404 });
    }

    const { text } = await generateText({
      model: openai("gpt-4-turbo-preview"),
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content:
            "You are an expert document analyst specializing in extracting deep insights, patterns, and actionable intelligence from documents.",
        },
        {
          role: "user",
          content: `Analyze the following document content and provide comprehensive insights in JSON format. Respond ONLY with pure JSON.

DOCUMENT CONTENT:
${results.map((r) => r.pageContent).join("\n\n")}

Generate a JSON response with the following structure:
{
  "insight": "HTML-formatted analytical insight",
  "keyFindings": [],
  "actionItems": [],
  "questions": []
}

Respond ONLY with valid JSON.`,
        },
      ],
    });

    let parsedInsight;
    try {
      parsedInsight = JSON.parse(text);
    } catch {
      throw new Error("INVALID_INSIGHT_JSON");
    }
    const savedInsight = existingInsight
      ? await db.documentInsight.update({
          where: { fileId },
          data: {
            insight: parsedInsight.insight,
            keyFindings: parsedInsight.keyFindings || [],
            actionItems: parsedInsight.actionItems || [],
            questions: parsedInsight.questions || [],
            updatedAt: new Date(),
          },
        })
      : await db.documentInsight.create({
          data: {
            insight: parsedInsight.insight,
            keyFindings: parsedInsight.keyFindings || [],
            actionItems: parsedInsight.actionItems || [],
            questions: parsedInsight.questions || [],
            userId,
            fileId,
          },
        });

    return NextResponse.json({
      insight: savedInsight.insight,
      keyFindings: savedInsight.keyFindings,
      actionItems: savedInsight.actionItems,
      questions: savedInsight.questions,
      fileId: file.id,
      fileName: file.name,
      id: savedInsight.id,
      createdAt: savedInsight.createdAt,
      updatedAt: savedInsight.updatedAt,
      isNew: !existingInsight,
    });
  } catch (error) {
    if (rollback) {
      await rollback();
    }

    if (error instanceof UsageLimitError) {
      return NextResponse.json({ error: "Insight limit reached for this file" }, { status: 403 });
    }
    console.error("Error generating insight:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};
