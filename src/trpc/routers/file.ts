// src/server/trpc/routers/file.ts
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import { db } from "@/db";
import { privateProcedure, router } from "../trpc";

export const fileRouter = router({
  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    return await db.file.findMany({
      where: { userId: ctx.userId },
    });
  }),

  getFileUploadStatus: privateProcedure.input(z.object({ fileId: z.string() })).query(async ({ ctx, input }) => {
    const file = await db.file.findFirst({
      where: { id: input.fileId, userId: ctx.userId },
    });

    if (!file) return { status: "PENDING" as const };

    return { status: file.uploadStatus };
  }),

  getFile: privateProcedure.input(z.object({ key: z.string() })).mutation(async ({ ctx, input }) => {
    const file = await db.file.findFirst({
      where: { key: input.key, userId: ctx.userId },
    });

    if (!file) throw new TRPCError({ code: "NOT_FOUND" });

    return file;
  }),

  deleteFile: privateProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const file = await db.file.findFirst({
      where: { id: input.id, userId: ctx.userId },
    });

    if (!file) throw new TRPCError({ code: "NOT_FOUND" });

    await db.file.delete({ where: { id: input.id } });

    return file;
  }),
});
