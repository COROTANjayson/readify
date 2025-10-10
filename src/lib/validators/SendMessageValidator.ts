import { z } from "zod/v3";

export const SendMessageValidator = z.object({
  fileId: z.string(),
  message: z.string(),
});
