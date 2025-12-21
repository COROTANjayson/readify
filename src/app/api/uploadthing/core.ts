import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { createUploadthing, type FileRouter } from "uploadthing/next";

import { PLANS } from "@/config/stripe";
import { db } from "@/db";
import { getPineconeClient } from "@/lib/pinecone";
import { getUserSubscriptionPlan } from "@/lib/stripe";

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-large",
});

await embeddings.embedQuery("Hello, world!");

const f = createUploadthing();

// Helper function to get default limits based on subscription
const getDefaultLimits = (isSubscribed: boolean) => {
  return isSubscribed
    ? {
        chatLimit: 999999, // unlimited for pro
        summarizeLimit: 5,
        insightLimit: 5,
        presentationLimit: 5,
      }
    : {
        chatLimit: 10,
        summarizeLimit: 2,
        insightLimit: 3,
        presentationLimit: 2,
      };
};

const middleware = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) throw new Error("Unauthorized");

  const subscriptionPlan = await getUserSubscriptionPlan();

  // Check upload file limit for free users
  if (!subscriptionPlan.isSubscribed) {
    const activeFileCount = await db.file.count({
      where: {
        userId: user.id,
        deletedAt: null, // only count non-deleted files
      },
    });

    if (activeFileCount >= 3) {
      throw new Error("Upload limit reached. Free users can upload up to 3 files.");
    }
  }

  return { subscriptionPlan, userId: user.id };
};

const onUploadComplete = async ({
  metadata,
  file,
}: {
  metadata: Awaited<ReturnType<typeof middleware>>;
  file: {
    key: string;
    name: string;
    ufsUrl: string;
  };
}) => {
  const isFileExist = await db.file.findFirst({
    where: {
      key: file.key,
    },
  });

  if (isFileExist) return;

  const { subscriptionPlan } = metadata;
  const { isSubscribed } = subscriptionPlan;

  // Get default limits based on subscription
  const limits = getDefaultLimits(isSubscribed);

  const createdFile = await db.file.create({
    data: {
      key: file.key,
      name: file.name,
      userId: metadata.userId,
      url: file.ufsUrl,
      uploadStatus: "PROCESSING",
      // Set per-file limits based on subscription
      ...limits,
    },
  });

  try {
    const response = await fetch(file.ufsUrl);

    const blob = await response.blob();

    const loader = new PDFLoader(blob);

    const pageLevelDocs = await loader.load();

    const pagesAmt = pageLevelDocs.length;

    const isProExceeded = pagesAmt > PLANS.find((plan) => plan.name === "Pro")!.pagesPerPdf;
    const isFreeExceeded = pagesAmt > PLANS.find((plan) => plan.name === "Free")!.pagesPerPdf;

    if ((isSubscribed && isProExceeded) || (!isSubscribed && isFreeExceeded)) {
      await db.file.update({
        data: {
          uploadStatus: "FAILED",
        },
        where: {
          id: createdFile.id,
        },
      });
      return;
    }

    // vectorize and index entire document
    const pinecone = await getPineconeClient();
    const pineconeIndex = pinecone.Index("summaraize");

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
      pineconeIndex,
      namespace: createdFile.id,
    });

    await db.file.update({
      data: {
        uploadStatus: "SUCCESS",
      },
      where: {
        id: createdFile.id,
      },
    });
  } catch (err) {
    console.log("erroorrr", err);
    await db.file.update({
      data: {
        uploadStatus: "FAILED",
      },
      where: {
        id: createdFile.id,
      },
    });
  }
};

export const ourFileRouter = {
  freePlanUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
  proPlanUploader: f({ pdf: { maxFileSize: "16MB" } })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
