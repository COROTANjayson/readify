// src/server/trpc/routers/docInsight.ts
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { db } from "@/db";
import { privateProcedure, router } from "../trpc";

export const docInsightRouter = router({
  getDocInsight: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const insight = await db.documentInsight.findUnique({
        where: {
          id: input.id,
        },
        include: {
          file: true,
        },
      });

      if (!insight) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document insight not found",
        });
      }

      if (insight.userId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to access this insight",
        });
      }

      return insight;
    }),

  getDocInsightByFileId: privateProcedure
    .input(
      z.object({
        fileId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const insight = await db.documentInsight.findUnique({
        where: {
          fileId: input.fileId,
        },
        include: {
          file: true,
        },
      });

      if (!insight) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document insight not found for this file",
        });
      }

      // Verify ownership
      if (insight.userId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to access this insight",
        });
      }

      return insight;
    }),

  getUserDocInsights: privateProcedure.query(async ({ ctx }) => {
    return await db.documentInsight.findMany({
      where: {
        userId: ctx.userId,
      },
      include: {
        file: {
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),

  updateDocInsight: privateProcedure
    .input(
      z.object({
        id: z.string(),
        insight: z.string().min(1, "Insight cannot be empty").optional(),
        keyFindings: z.array(z.string()).optional(),
        actionItems: z.array(z.string()).optional(),
        questions: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingInsight = await db.documentInsight.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!existingInsight) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document insight not found",
        });
      }

      if (existingInsight.userId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this insight",
        });
      }

      const updatedInsight = await db.documentInsight.update({
        where: {
          id: input.id,
        },
        data: {
          ...(input.insight && { insight: input.insight }),
          ...(input.keyFindings && { keyFindings: input.keyFindings }),
          ...(input.actionItems && { actionItems: input.actionItems }),
          ...(input.questions && { questions: input.questions }),
          updatedAt: new Date(),
        },
      });

      return updatedInsight;
    }),

  deleteDocInsight: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingInsight = await db.documentInsight.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!existingInsight) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document insight not found",
        });
      }

      if (existingInsight.userId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this insight",
        });
      }

      await db.documentInsight.delete({
        where: {
          id: input.id,
        },
      });

      return { success: true, id: input.id };
    }),

  deleteDocInsightByFileId: privateProcedure
    .input(
      z.object({
        fileId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // First, verify the insight exists and user owns it
      const existingInsight = await db.documentInsight.findUnique({
        where: {
          fileId: input.fileId,
        },
      });

      if (!existingInsight) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document insight not found for this file",
        });
      }

      if (existingInsight.userId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this insight",
        });
      }

      // Delete the insight
      await db.documentInsight.delete({
        where: {
          fileId: input.fileId,
        },
      });

      return { success: true, fileId: input.fileId };
    }),
});
