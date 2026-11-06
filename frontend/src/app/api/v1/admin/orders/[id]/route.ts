import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Order } from "@/models";
import { getSessionFromRequest } from "@/lib/auth";
import { updateOrderStatusSchema } from "@/lib/validations";
import { VALID_ORDER_TRANSITIONS, isValidTransition } from "@/lib/utils";

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

    const order = await Order.findById(id).populate("statusHistory.actorAdminId", "name email role");
    if (!order) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Order not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message || "Failed to fetch order" } },
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
    const parsed = updateOrderStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid status update data",
            details: parsed.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const { status: targetStatus, note, trackingCarrier, trackingNumber } = parsed.data;

    await dbConnect();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Order not found" } },
        { status: 404 }
      );
    }

    // Validate state machine transition unless forced by OWNER
    const currentStatus = order.orderStatus;
    if (currentStatus !== targetStatus) {
      const allowed = isValidTransition(currentStatus, targetStatus, VALID_ORDER_TRANSITIONS);
      if (!allowed && session.role !== "OWNER") {
        return NextResponse.json(
          {
            error: {
              code: "INVALID_STATUS_TRANSITION",
              message: `Cannot transition order directly from ${currentStatus} to ${targetStatus}`,
            },
          },
          { status: 422 }
        );
      }
    }

    order.orderStatus = targetStatus as any;
    if (trackingCarrier) order.trackingCarrier = trackingCarrier;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    order.statusHistory.push({
      fromStatus: currentStatus,
      toStatus: targetStatus,
      note: note || `Order updated to ${targetStatus} by ${session.name}`,
      actorAdminId: session.id as any,
      createdAt: new Date(),
    });

    await order.save();

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message || "Failed to update order status" } },
      { status: 500 }
    );
  }
}

