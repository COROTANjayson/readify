// app/api/download-ppt/[fileId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

import { db } from "@/db";

export const GET = async (req: NextRequest, { params }: { params: { fileId: string } }) => {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId } = params;

    // Get the latest presentation for this file
    const presentation = await db.presentation.findFirst({
      where: {
        fileId,
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!presentation) {
      return NextResponse.json({ error: "Presentation not found" }, { status: 404 });
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(presentation.pptxData, "base64");

    // Return the file
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${presentation.fileName}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("PPT download error:", error);
    return NextResponse.json({ error: "Failed to download presentation" }, { status: 500 });
  }
};
