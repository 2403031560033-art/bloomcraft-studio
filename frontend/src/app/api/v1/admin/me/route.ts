import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "Not logged in" } },
      { status: 401 }
    );
  }

  return NextResponse.json({ success: true, data: session });
}

