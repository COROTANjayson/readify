// src/server/trpc/routers/index.ts
import { router } from "../trpc";

import { authRouter } from "./auth";
import { fileRouter } from "./file";
import { messageRouter } from "./message";

export const appRouter = router({
  auth: authRouter,
  file: fileRouter,
  message: messageRouter,
});

export type AppRouter = typeof appRouter;
