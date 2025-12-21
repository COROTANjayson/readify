// server/routers/presentation.ts
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { db } from "@/db";
import { privateProcedure, router } from "../trpc";

export const presentationRouter = router({
  // Get presentation for a file (only one per file)
  getPresentation: privateProcedure
    .input(
      z.object({
        fileId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const presentation = await db.presentation.findFirst({
        where: {
          fileId: input.fileId,
          userId: ctx.userId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return presentation;
    }),

  // Get presentation history for user
  getUserPresentations: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const presentations = await db.presentation.findMany({
        where: {
          userId: ctx.userId,
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          file: {
            select: {
              name: true,
            },
          },
        },
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (presentations.length > input.limit) {
        const nextItem = presentations.pop();
        nextCursor = nextItem!.id;
      }

      return {
        presentations,
        nextCursor,
      };
    }),

  // Delete a presentation
  deletePresentation: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const presentation = await db.presentation.findFirst({
        where: {
          id: input.id,
          userId: ctx.userId,
        },
      });

      if (!presentation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Presentation not found",
        });
      }

      await db.presentation.delete({
        where: {
          id: input.id,
        },
      });

      return { success: true };
    }),
});
