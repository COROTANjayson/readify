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
    const { fileId, regenerate = false } = body;

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

    // Check if summary already exists
    const existingSummary = await db.documentSummary.findUnique({
      where: {
        fileId,
      },
    });

    // If summary exists and not regenerating, return existing
    if (existingSummary && !regenerate) {
      return NextResponse.json({
        summary: existingSummary.summary,
        fileId: file.id,
        fileName: file.name,
        id: existingSummary.id,
        createdAt: existingSummary.createdAt,
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

    // Retrieve more content for a comprehensive summary
    const results = await vectorStore.similaritySearch("summary overview main points key information", 10);

    if (results.length === 0) {
      return NextResponse.json({ error: "No content found for this document" }, { status: 404 });
    }

    // Generate summary using AI SDK
    const { text } = await generateText({
      model: openai("gpt-3.5-turbo"),
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You are a professional document summarizer. Create comprehensive, well-structured summaries in HTML format suitable for a rich text editor.",
        },
        {
          role: "user",
          content: `Create a comprehensive summary of the following document content in HTML format.

Requirements:
- Use semantic HTML tags (h1, h2, h3, p, ul, ol, strong, em)
- Start with an h1 title "Document Summary"
- Organize information with clear headings and subheadings
- Use bullet points or numbered lists for key points
- Highlight important terms with <strong> tags
- Make it well-structured and easy to read
- Do not include <html>, <head>, or <body> tags - only the content that goes inside a document body

DOCUMENT CONTENT:
${results.map((r) => r.pageContent).join("\n\n")}

Generate the HTML summary now:`,
        },
      ],
    });

    console.log(text);

    // Save or update summary in database
    let savedSummary;
    if (existingSummary) {
      // Update existing summary
      savedSummary = await db.documentSummary.update({
        where: {
          fileId,
        },
        data: {
          summary: text,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new summary
      savedSummary = await db.documentSummary.create({
        data: {
          summary: text,
          userId,
          fileId,
        },
      });
    }

    // Return the HTML summary
    return NextResponse.json({
      summary: savedSummary.summary,
      fileId: file.id,
      fileName: file.name,
      id: savedSummary.id,
      createdAt: savedSummary.createdAt,
      updatedAt: savedSummary.updatedAt,
      isNew: !existingSummary,
    });
  } catch (error) {
    console.error("Error generating summary:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};

// // Optional: GET endpoint to retrieve existing summary
// export const GET = async (req: NextRequest) => {
//   try {
//     const { getUser } = getKindeServerSession();
//     const user = await getUser();

//     if (!user || !user.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { searchParams } = new URL(req.url);
//     const fileId = searchParams.get("fileId");

//     if (!fileId) {
//       return NextResponse.json(
//         { error: "File ID is required" },
//         { status: 400 }
//       );
//     }

//     // Verify file ownership
//     const file = await db.file.findFirst({
//       where: {
//         id: fileId,
//         userId: user.id,
//       },
//     });

//     if (!file) {
//       return NextResponse.json({ error: "Not found" }, { status: 404 });
//     }

//     // Get existing summary
//     const summary = await db.documentSummary.findUnique({
//       where: {
//         fileId,
//       },
//     });

//     if (!summary) {
//       return NextResponse.json({ error: "Summary not found" }, { status: 404 });
//     }

//     return NextResponse.json({
//       summary: summary.summary,
//       fileId: file.id,
//       fileName: file.name,
//       id: summary.id,
//       createdAt: summary.createdAt,
//       updatedAt: summary.updatedAt,
//     });
//   } catch (error) {
//     console.error("Error retrieving summary:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// };
