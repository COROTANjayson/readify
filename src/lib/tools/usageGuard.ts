import { db } from "@/db";

export type UsageField = "chatCount" | "summarizeCount" | "insightCount" | "presentationCount";

export type LimitField = "chatLimit" | "summarizeLimit" | "insightLimit" | "presentationLimit";

export class UsageLimitError extends Error {
  constructor(message = "Usage limit reached") {
    super(message);
    this.name = "UsageLimitError";
  }
}
export async function reserveUsage({
  fileId,
  countField,
  limitField,
}: {
  fileId: string;
  countField: UsageField;
  limitField: LimitField;
}) {
  let reserved = false;

  await db.$transaction(async (tx) => {
    const file = await tx.file.findUnique({
      where: { id: fileId },
      select: {
        id: true,
        [countField]: true,
        [limitField]: true,
      } as any,
    });

    if (!file) throw new Error("File not found");

    if (file[countField] >= file[limitField]) {
      throw new UsageLimitError();
    }

    await tx.file.update({
      where: { id: fileId },
      data: {
        [countField]: { increment: 1 },
      } as any,
    });

    reserved = true;
  });

  return {
    rollback: async () => {
      if (!reserved) return;

      await db.file.update({
        where: { id: fileId },
        data: {
          [countField]: { decrement: 1 },
        } as any,
      });
    },
  };
}
