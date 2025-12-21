import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { db } from "@/db";
import { privateProcedure, router } from "../trpc";

export const fileRouter = router({
  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    return await db.file.findMany({
      where: {
        userId: ctx.userId,
        deletedAt: null,
      },
    });
  }),

  getFileUploadStatus: privateProcedure.input(z.object({ fileId: z.string() })).query(async ({ ctx, input }) => {
    const file = await db.file.findFirst({
      where: {
        id: input.fileId,
        userId: ctx.userId,
        deletedAt: null,
      },
    });

    if (!file) return { status: "PENDING" as const };

    return { status: file.uploadStatus };
  }),

  getFile: privateProcedure.input(z.object({ key: z.string() })).mutation(async ({ ctx, input }) => {
    const file = await db.file.findFirst({
      where: {
        key: input.key,
        userId: ctx.userId,
        deletedAt: null,
      },
    });

    if (!file) throw new TRPCError({ code: "NOT_FOUND" });

    return file;
  }),

  deleteFile: privateProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const file = await db.file.findFirst({
      where: {
        id: input.id,
        userId: ctx.userId,
        deletedAt: null, // Only allow deleting non-deleted files
      },
    });

    if (!file) throw new TRPCError({ code: "NOT_FOUND" });

    await db.file.update({
      where: { id: input.id },
      data: { deletedAt: new Date() },
    });

    return file;
  }),

  getFileById: privateProcedure.input(z.object({ fileId: z.string() })).query(async ({ ctx, input }) => {
    const file = await db.file.findFirst({
      where: {
        id: input.fileId,
        userId: ctx.userId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        uploadStatus: true,
        url: true,
        key: true,

        chatLimit: true,
        summarizeLimit: true,
        insightLimit: true,
        presentationLimit: true,

        chatCount: true,
        summarizeCount: true,
        insightCount: true,
        presentationCount: true,

        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        userId: true,
      },
    });

    if (!file) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return {
      ...file,
      createdAt: file.createdAt.toISOString(),
      updatedAt: file.updatedAt ? file.updatedAt.toISOString() : null,
      deletedAt: file.deletedAt ? file.deletedAt.toISOString() : null,
    };
  }),
});
