// src/server/trpc/routers/index.ts
import { router } from "../trpc";
import { authRouter } from "./auth";
import { billingRouter } from "./billing";
import { docInsightRouter } from "./docInsight";
import { docSummaryRouter } from "./docSummary";
import { fileRouter } from "./file";
import { messageRouter } from "./message";

export const appRouter = router({
  auth: authRouter,
  file: fileRouter,
  message: messageRouter,
  billing: billingRouter,
  docSummary: docSummaryRouter,
  docInsight: docInsightRouter,
});

export type AppRouter = typeof appRouter;
