import { NextRequest } from "next/server";
import { openai as OpenAIStream } from "@ai-sdk/openai";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { streamText } from "ai";

import { db } from "@/db";
import { getPineconeClient } from "@/lib/pinecone";
import { rateLimit } from "@/lib/rate-limit";
import { reserveUsage, UsageLimitError } from "@/lib/tools/usageGuard";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";

export const POST = async (req: NextRequest) => {
  let rollback: (() => Promise<void>) | null = null;

  try {
    const body = await req.json();
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { success } = await rateLimit.limit(user.id);
    if (!success) {
      return new Response("Too many requests", { status: 429 });
    }

    const { id: userId } = user;
    const { fileId, message } = SendMessageValidator.parse(body);

    const file = await db.file.findFirst({
      where: { id: fileId, userId },
    });

    if (!file) {
      return new Response("Not found", { status: 404 });
    }

    const reservation = await reserveUsage({
      fileId,
      countField: "chatCount",
      limitField: "chatLimit",
    });

    rollback = reservation.rollback;

    await db.message.create({
      data: {
        text: message,
        isUserMessage: true,
        userId,
        fileId,
      },
    });

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const pinecone = await getPineconeClient();
    const pineconeIndex = pinecone.Index("summaraize");

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      namespace: file.id,
    });

    const results = await vectorStore.similaritySearch(message, 4);

    const prevMessages = await db.message.findMany({
      where: { fileId },
      orderBy: { createdAt: "asc" },
      take: 6,
    });

    const formattedPrevMessages = prevMessages.map((msg) => ({
      role: msg.isUserMessage ? ("user" as const) : ("assistant" as const),
      content: msg.text,
    }));

    const result = await streamText({
      model: OpenAIStream("gpt-3.5-turbo"),
      temperature: 0,
      system: "Use the provided context and conversation to answer the user's question in markdown format.",
      messages: [
        {
          role: "user",
          content: `
PREVIOUS CONVERSATION:
${formattedPrevMessages.map((m) => (m.role === "user" ? `User: ${m.content}` : `Assistant: ${m.content}`)).join("\n")}

----------------

CONTEXT:
${results.map((r) => r.pageContent).join("\n\n")}

USER INPUT:
${message}
          `,
        },
      ],

      onFinish: async (event) => {
        await db.message.create({
          data: {
            text: event.text,
            isUserMessage: false,
            fileId,
            userId,
          },
        });
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    if (rollback) {
      await rollback();
    }
    if (error instanceof UsageLimitError) {
      return new Response("Chat limit reached for this file", { status: 403 });
    }
    console.error("Chat error:", error);
    return new Response("Internal server error", { status: 500 });
  }
};
