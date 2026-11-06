import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { BusinessSettings } from "@/models";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Admin login required" } }, { status: 401 });
    }

    await dbConnect();
    let settings = await BusinessSettings.findOne();
    if (!settings) {
      settings = await BusinessSettings.create({});
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: error.message } }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || session.role !== "OWNER") {
      return NextResponse.json({ error: { code: "FORBIDDEN", message: "Only Owner can edit settings" } }, { status: 403 });
    }

    const body = await req.json();
    await dbConnect();

    let settings = await BusinessSettings.findOne();
    if (!settings) {
      settings = await BusinessSettings.create(body);
    } else {
      Object.assign(settings, body);
      await settings.save();
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: error.message } }, { status: 500 });
  }
}

