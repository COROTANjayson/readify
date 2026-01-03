import { NextResponse } from "next/server";
import { db } from "@/db";
import { rateLimit } from "@/lib/rate-limit";

export async function GET() {
  try {
    const { success } = await rateLimit.limit("cron-keep-alive");

    if (!success) {
      return new NextResponse("Too Many Requests", { status: 429 });
    }

    // Perform a lightweight query to ensure the database connection is active
    await db.user.findFirst();

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Keep-alive cron failed:", error);
    return NextResponse.json(
      { status: "error", message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
