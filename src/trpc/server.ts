// src/server/trpc/server.ts
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

import { appRouter } from "./routers";

export async function createCaller() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  return appRouter.createCaller({
    userId: user.id,
  });
}
