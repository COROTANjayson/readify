import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import { db } from "@/db";
import { privateProcedure, router } from "../trpc";

export const messageRouter = router({
  getFileMessages: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        fileId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? INFINITE_QUERY_LIMIT;

      const file = await db.file.findFirst({
        where: { id: input.fileId, userId: ctx.userId },
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      const messages = await db.message.findMany({
        take: limit + 1,
        where: { fileId: input.fileId },
        orderBy: { createdAt: "desc" },
        cursor: input.cursor ? { id: input.cursor } : undefined,
        select: {
          id: true,
          isUserMessage: true,
          createdAt: true,
          text: true,
        },
      });

      let nextCursor;
      if (messages.length > limit) {
        const nextItem = messages.pop();
        nextCursor = nextItem?.id;
      }

      return { messages, nextCursor };
    }),
});
