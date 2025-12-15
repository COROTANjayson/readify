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

    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId } = user;
    const { fileId, regenerate = false, insightType = "comprehensive" } = body;

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

    // Check if insight already exists
    const existingInsight = await db.documentInsight.findUnique({
      where: {
        fileId,
      },
    });

    // If insight exists and not regenerating, return existing
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

    // Get embeddings and vector store
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const pinecone = await getPineconeClient();
    const pineconeIndex = pinecone.Index("summaraize");

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      namespace: file.id,
    });

    // Retrieve comprehensive content for deep analysis
    const results = await vectorStore.similaritySearch(
      "key insights analysis patterns trends implications recommendations",
      15
    );

    if (results.length === 0) {
      return NextResponse.json({ error: "No content found for this document" }, { status: 404 });
    }

    // Generate insight using AI SDK with structured output
    const { text } = await generateText({
      model: openai("gpt-4-turbo-preview"),
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: `You are an expert document analyst specializing in extracting deep insights, patterns, and actionable intelligence from documents. You provide strategic analysis that goes beyond surface-level summaries.`,
        },
        {
          role: "user",
          content: `Analyze the following document content and provide comprehensive insights in JSON format. Respond ONLY with pure JSON. Do NOT include code fences, markdown, or backticks.

DOCUMENT CONTENT:
${results.map((r) => r.pageContent).join("\n\n")}

Generate a JSON response with the following structure:
{
  "insight": "A detailed HTML-formatted analytical insight (3-4 paragraphs) that identifies patterns, connections, implications, and deeper meaning. Use <p>, <strong>, <em>, <h3> tags.",
  "keyFindings": [
    "First major finding or pattern identified",
    "Second major finding or pattern identified",
    "Third major finding or pattern identified"
  ],
  "actionItems": [
    "Specific actionable recommendation based on the analysis",
    "Another practical action item",
    "Additional suggestion for next steps"
  ],
  "questions": [
    "Thought-provoking question raised by the content",
    "Another question for deeper exploration",
    "Question about implications or applications"
  ]
}

Focus on:
- Identifying underlying patterns and themes
- Drawing connections between different sections
- Highlighting implications and consequences
- Suggesting practical applications
- Raising thought-provoking questions
- Providing strategic recommendations

Respond ONLY with valid JSON, no additional text.`,
        },
      ],
    });

    console.log("erro", text);
    // Parse the JSON response
    let parsedInsight;
    try {
      parsedInsight = JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse insight JSON:", parseError);
      return NextResponse.json({ error: "Failed to generate structured insight" }, { status: 500 });
    }

    // Save or update insight in database
    let savedInsight;
    if (existingInsight) {
      savedInsight = await db.documentInsight.update({
        where: {
          fileId,
        },
        data: {
          insight: parsedInsight.insight,
          keyFindings: parsedInsight.keyFindings || [],
          actionItems: parsedInsight.actionItems || [],
          questions: parsedInsight.questions || [],
          updatedAt: new Date(),
        },
      });
    } else {
      savedInsight = await db.documentInsight.create({
        data: {
          insight: parsedInsight.insight,
          keyFindings: parsedInsight.keyFindings || [],
          actionItems: parsedInsight.actionItems || [],
          questions: parsedInsight.questions || [],
          userId,
          fileId,
        },
      });
    }

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
    console.error("Error generating insight:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};
