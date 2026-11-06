import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { CustomOrderRequest } from "@/models";
import { getSessionFromRequest } from "@/lib/auth";
import { updateCustomRequestSchema } from "@/lib/validations";
import { VALID_CUSTOM_REQUEST_TRANSITIONS, isValidTransition } from "@/lib/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { error: { code: "UNAUTHENTICATED", message: "Admin login required" } },
        { status: 401 }
      );
    }

    const { id } = await params;
    await dbConnect();

    const request = await CustomOrderRequest.findById(id)
      .populate("assignedAdminId", "name email")
      .populate("convertedOrderId", "orderNumber totalPaise orderStatus");

    if (!request) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Custom request not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: request });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message || "Failed to fetch request" } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { error: { code: "UNAUTHENTICATED", message: "Admin login required" } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = updateCustomRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid update data",
            details: parsed.error.issues,
          },
        },
        { status: 400 }
      );
    }

    await dbConnect();
    const request = await CustomOrderRequest.findById(id);
    if (!request) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Custom request not found" } },
        { status: 404 }
      );
    }

    const { status: targetStatus, quotePaise, quoteValidUntil, adminNotes } = parsed.data;

    if (targetStatus && targetStatus !== request.status) {
      const allowed = isValidTransition(request.status, targetStatus, VALID_CUSTOM_REQUEST_TRANSITIONS);
      if (!allowed && session.role !== "OWNER") {
        return NextResponse.json(
          {
            error: {
              code: "INVALID_STATUS_TRANSITION",
              message: `Cannot transition request from ${request.status} to ${targetStatus}`,
            },
          },
          { status: 422 }
        );
      }
      request.status = targetStatus;
    }

    if (quotePaise !== undefined) request.quotePaise = quotePaise;
    if (quoteValidUntil !== undefined) request.quoteValidUntil = new Date(quoteValidUntil);
    if (adminNotes !== undefined) request.adminNotes = adminNotes;
    if (!request.assignedAdminId) request.assignedAdminId = session.id as any;

    await request.save();

    return NextResponse.json({ success: true, data: request });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message || "Failed to update custom request" } },
      { status: 500 }
    );
  }
}

