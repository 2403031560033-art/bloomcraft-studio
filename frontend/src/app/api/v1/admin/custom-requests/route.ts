import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { CustomOrderRequest } from "@/models";
import { getSessionFromRequest } from "@/lib/auth";

// GET /api/v1/admin/custom-requests
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { error: { code: "UNAUTHENTICATED", message: "Admin login required" } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const q = searchParams.get("q");
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);

    await dbConnect();

    const filter: Record<string, any> = {};
    if (status) filter.status = status;
    if (q) {
      filter.$or = [
        { requestNumber: { $regex: q, $options: "i" } },
        { customerName: { $regex: q, $options: "i" } },
        { phoneE164: { $regex: q, $options: "i" } },
        { occasion: { $regex: q, $options: "i" } },
      ];
    }

    const total = await CustomOrderRequest.countDocuments(filter);
    const requests = await CustomOrderRequest.find(filter)
      .populate("assignedAdminId", "name email")
      .populate("convertedOrderId", "orderNumber totalPaise orderStatus")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: requests,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message || "Failed to fetch custom requests" } },
      { status: 500 }
    );
  }
}

