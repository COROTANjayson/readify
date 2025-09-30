import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  freePlanUploader: f({
    pdf: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const { getUser } = getKindeServerSession();
      const user = await getUser();

      if (!user || !user.id) throw new UploadThingError("Unauthorized");

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const isFileExist = await db.file.findFirst({
        where: {
          key: file.key,
        },
      });

      if (isFileExist) return;

      const createdFile = await db.file.create({
        data: {
          key: file.key,
          name: file.name,
          userId: metadata.userId,
          url: file.ufsUrl,
          uploadStatus: "PROCESSING",
        },
      });

      try {
        const response = await fetch(file.ufsUrl);

        // const blob = await response.blob();

        // const loader = new PDFLoader(blob);

        // const pageLevelDocs = await loader.load();

        // const pagesAmt = pageLevelDocs.length;

        // const { subscriptionPlan } = metadata;
        // const { isSubscribed } = subscriptionPlan;

        // const isProExceeded =
        //   pagesAmt > PLANS.find((plan) => plan.name === "Pro")!.pagesPerPdf;
        // const isFreeExceeded =
        //   pagesAmt > PLANS.find((plan) => plan.name === "Free")!.pagesPerPdf;

        // if (
        //   (isSubscribed && isProExceeded) ||
        //   (!isSubscribed && isFreeExceeded)
        // ) {
        //   await db.file.update({
        //     data: {
        //       uploadStatus: "FAILED",
        //     },
        //     where: {
        //       id: createdFile.id,
        //     },
        //   });
        // }

        // // vectorize and index entire document
        // const pinecone = await getPineconeClient();
        // const pineconeIndex = pinecone.Index("quill");

        // const embeddings = new OpenAIEmbeddings({
        //   openAIApiKey: process.env.OPENAI_API_KEY,
        // });

        // await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
        //   pineconeIndex,
        //   namespace: createdFile.id,
        // });

        // await db.file.update({
        //   data: {
        //     uploadStatus: "SUCCESS",
        //   },
        //   where: {
        //     id: createdFile.id,
        //   },
        // });
      } catch (err) {
        // await db.file.update({
        //   data: {
        //     uploadStatus: "FAILED",
        //   },
        //   where: {
        //     id: createdFile.id,
        //   },
        // });
      }
    }),
} satisfies FileRouter;

//4:41:33
export type OurFileRouter = typeof ourFileRouter;
