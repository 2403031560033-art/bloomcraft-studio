import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Order } from "@/models";

// GET /api/v1/orders/track?orderNumber=BC...&phone=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get("orderNumber")?.trim();
    const phone = searchParams.get("phone")?.trim();

    if (!orderNumber || !phone) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Both Order Number and Phone Number are required to track an order",
          },
        },
        { status: 400 }
      );
    }

    await dbConnect();

    // Standardize phone check (last 10 digits to accommodate +91 vs direct)
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);

    const order = await Order.findOne({
      orderNumber: { $regex: new RegExp(`^${orderNumber}$`, "i") },
      customerPhoneSnapshot: { $regex: new RegExp(`${cleanPhone}$`) },
    });

    if (!order) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "No order found matching the provided order number and phone number",
          },
        },
        { status: 404 }
      );
    }

    // Publicly sanitized view - NO internal notes, NO actorAdminId, NO other customer data
    const safeTimeline = order.statusHistory.map((h: any) => ({
      status: h.toStatus,
      createdAt: h.createdAt,
      description: getPublicStatusDescription(h.toStatus),
    }));

    const safeResponse = {
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      estimatedDispatchDate: order.estimatedDispatchDate,
      trackingCarrier: order.trackingCarrier,
      trackingNumber: order.trackingNumber,
      items: order.items.map((item: any) => ({
        productName: item.productNameSnapshot,
        quantity: item.quantity,
        variantName: item.variantSnapshot?.name,
        personalisation: item.personalisation,
        unitPricePaise: item.unitPricePaise,
        lineTotalPaise: item.lineTotalPaise,
      })),
      pricing: {
        subtotalPaise: order.subtotalPaise,
        shippingPaise: order.shippingPaise,
        discountPaise: order.discountPaise,
        totalPaise: order.totalPaise,
      },
      deliveryCity: order.shippingAddressSnapshot.city,
      deliveryState: order.shippingAddressSnapshot.state,
      deliveryPostalCode: order.shippingAddressSnapshot.postalCode,
      timeline: safeTimeline,
    };

    return NextResponse.json({ success: true, data: safeResponse });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: error.message || "Failed to retrieve order tracking info",
        },
      },
      { status: 500 }
    );
  }
}

function getPublicStatusDescription(status: string): string {
  const map: Record<string, string> = {
    PENDING_PAYMENT: "Awaiting payment verification",
    PLACED: "Order received and placed into queue",
    CONFIRMED: "Order accepted by BloomCraft Studio",
    IN_PRODUCTION: "Your handmade gift is being carefully crafted",
    READY_TO_DISPATCH: "Packed with love, awaiting courier pickup",
    SHIPPED: "Dispatched and in transit",
    DELIVERED: "Safely delivered",
    CANCELLED: "Order was cancelled",
    ON_HOLD: "Order is temporarily on hold",
  };
  return map[status] || "Status update";
}

