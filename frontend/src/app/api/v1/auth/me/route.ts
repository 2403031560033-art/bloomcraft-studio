import { NextRequest, NextResponse } from "next/server";
import { getCustomerSessionFromRequest, getSessionFromRequest } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Customer } from "@/models";

export async function GET(req: NextRequest) {
  try {
    // Check if customer is logged in
    const customerSession = await getCustomerSessionFromRequest(req);
    // Also check if admin is logged in
    const adminSession = await getSessionFromRequest(req);

    if (customerSession) {
      await dbConnect();
      const customer = await Customer.findById(customerSession.id).select("-passwordHash");
      return NextResponse.json({
        success: true,
        type: "CUSTOMER",
        data: {
          id: customer?._id || customerSession.id,
          name: customer?.fullName || customerSession.name,
          email: customer?.email || customerSession.email,
          phone: customer?.phoneE164 || customerSession.phone,
          addresses: customer?.addresses || [],
        },
        adminSession: adminSession || null,
      });
    }

    if (adminSession) {
      return NextResponse.json({
        success: true,
        type: "ADMIN",
        data: adminSession,
        adminSession,
      });
    }

    return NextResponse.json({
      success: false,
      data: null,
      adminSession: null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}

