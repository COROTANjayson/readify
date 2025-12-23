// src/server/trpc/routers/docSummary.ts
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { db } from "@/db";
import { privateProcedure, router } from "../trpc";

export const docSummaryRouter = router({
  getDocSummary: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const summary = await db.documentSummary.findUnique({
        where: {
          id: input.id,
        },
        include: {
          File: true, // Include file information if needed
        },
      });
      console.log("summary", summary);

      if (!summary) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document summary not found",
        });
      }

      // Verify ownership
      if (summary.userId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to access this summary",
        });
      }

      return summary;
    }),

  getDocSummaryByFileId: privateProcedure
    .input(
      z.object({
        fileId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const summary = await db.documentSummary.findFirst({
        where: { fileId: input.fileId },
        include: { File: true },
        orderBy: {
          createdAt: "desc",
        },
      });

      // ✅ NOT FOUND = valid state
      if (!summary) {
        return null;
      }

      if (summary.userId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to access this summary",
        });
      }

      return summary;
    }),

  getUserDocSummaries: privateProcedure.query(async ({ ctx }) => {
    return await db.documentSummary.findMany({
      where: {
        userId: ctx.userId,
      },
      include: {
        File: {
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

  updateDocSummary: privateProcedure
    .input(
      z.object({
        id: z.string(),
        summary: z.string().min(1, "Summary cannot be empty"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // First, verify the summary exists and user owns it
      const existingSummary = await db.documentSummary.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!existingSummary) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document summary not found",
        });
      }

      if (existingSummary.userId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this summary",
        });
      }

      // Update the summary
      const updatedSummary = await db.documentSummary.update({
        where: {
          id: input.id,
        },
        data: {
          summary: input.summary,
          updatedAt: new Date(),
        },
      });

      return updatedSummary;
    }),

  deleteDocSummary: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // First, verify the summary exists and user owns it
      const existingSummary = await db.documentSummary.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!existingSummary) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document summary not found",
        });
      }

      if (existingSummary.userId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this summary",
        });
      }

      // Delete the summary
      await db.documentSummary.delete({
        where: {
          id: input.id,
        },
      });

      return { success: true, id: input.id };
    }),

  deleteDocSummaryByFileId: privateProcedure
    .input(
      z.object({
        fileId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // First, verify the summary exists and user owns it
      const existingSummary = await db.documentSummary.findUnique({
        where: {
          fileId: input.fileId,
        },
      });

      if (!existingSummary) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document summary not found for this file",
        });
      }

      if (existingSummary.userId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this summary",
        });
      }

      // Delete the summary
      await db.documentSummary.delete({
        where: {
          fileId: input.fileId,
        },
      });

      return { success: true, fileId: input.fileId };
    }),
});
