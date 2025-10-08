import { db } from "@/db";
import { openai } from "@/lib/openai";
import { getPineconeClient } from "@/lib/pinecone";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
// import { openai } from "@/lib/openai";
// import { getPineconeClient } from "@/lib/pinecone";
// import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
// import { OpenAIEmbeddings } from "langchain/embeddings/openai";
// import { PineconeStore } from "langchain/vectorstores/pinecone";
import { NextRequest } from "next/server";

import { streamText } from "ai";
import { openai as OpenAIStream } from "@ai-sdk/openai"; // or your provider import

export const POST = async (req: NextRequest) => {
  // endpoint for asking a question to a pdf file

  const body = await req.json();

  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) return new Response("Unauthorized", { status: 401 });

  const { id: userId } = user;

  const { fileId, message } = SendMessageValidator.parse(body);

  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  });

  if (!file) return new Response("Not found", { status: 404 });

  await db.message.create({
    data: {
      text: message,
      isUserMessage: true,
      userId,
      fileId,
    },
  });

  //   // 1: vectorize message
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const pinecone = await getPineconeClient();
  const pineconeIndex = pinecone.Index("quill");

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace: file.id,
  });

  const results = await vectorStore.similaritySearch(message, 4);

  const prevMessages = await db.message.findMany({
    where: {
      fileId,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 6,
  });

  const formattedPrevMessages = prevMessages.map((msg) => ({
    role: msg.isUserMessage ? ("user" as const) : ("assistant" as const),
    content: msg.text,
  }));

  // Create the text stream using the new SDK
  const result = await streamText({
    model: OpenAIStream("gpt-3.5-turbo"),
    temperature: 0,
    system:
      "Use the following pieces of context (or previous conversation if needed) to answer the user's question in markdown format.",
    messages: [
      {
        role: "user",
        content: `Use the following pieces of context (or previous conversation if needed) to answer the user's question in markdown format.
If you don't know the answer, just say that you don't know.

----------------

PREVIOUS CONVERSATION:
${formattedPrevMessages
  .map((m: any) =>
    m.role === "user" ? `User: ${m.content}` : `Assistant: ${m.content}`
  )
  .join("\n")}

----------------

CONTEXT:
${results.map((r: any) => r.pageContent).join("\n\n")}

USER INPUT: ${message}
`,
      },
    ],

    // Runs when the stream completes
    onFinish: async (event) => {
      await db.message.create({
        data: {
          text: event.text, // final completion
          isUserMessage: false,
          fileId,
          userId,
        },
      });
    },
  });

  // Return the streaming response to the frontend
  return result.toTextStreamResponse();
};
