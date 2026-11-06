import { NextRequest, NextResponse } from "next/server";
import { getCustomerSessionFromRequest } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Order, Customer } from "@/models";

export async function GET(req: NextRequest) {
  try {
    const customerSession = await getCustomerSessionFromRequest(req);
    if (!customerSession) {
      return NextResponse.json(
        { error: { code: "UNAUTHENTICATED", message: "Customer login required" } },
        { status: 401 }
      );
    }

    await dbConnect();
    const cleanPhone = customerSession.phone.replace(/\D/g, "").slice(-10);

    const orders = await Order.find({
      $or: [
        { customerId: customerSession.id },
        { customerPhoneSnapshot: { $regex: new RegExp(`${cleanPhone}$`) } },
      ],
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}

