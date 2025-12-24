// src/server/trpc/types.ts
import type { inferRouterOutputs } from "@trpc/server";

import { AppRouter } from "@/trpc/routers";

// Get all router outputs
type RouterOutput = inferRouterOutputs<AppRouter>;

// Type for the output of getFileById
export type FileOutput = RouterOutput["file"]["getFileById"];


