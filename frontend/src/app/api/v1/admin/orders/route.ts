import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Order, Customer, Payment } from "@/models";
import { getSessionFromRequest } from "@/lib/auth";
import { manualOrderSchema } from "@/lib/validations";
import { generateOrderNumber } from "@/lib/utils";

// GET /api/v1/admin/orders
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
    const source = searchParams.get("source");
    const q = searchParams.get("q");
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);

    await dbConnect();

    const filter: Record<string, any> = {};
    if (status) filter.orderStatus = status;
    if (source) filter.source = source;
    if (q) {
      filter.$or = [
        { orderNumber: { $regex: q, $options: "i" } },
        { customerNameSnapshot: { $regex: q, $options: "i" } },
        { customerPhoneSnapshot: { $regex: q, $options: "i" } },
      ];
    }

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message || "Failed to fetch orders" } },
      { status: 500 }
    );
  }
}

// POST /api/v1/admin/orders - manual order entry (Instagram / WhatsApp DMs)
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { error: { code: "UNAUTHENTICATED", message: "Admin login required" } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = manualOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid manual order data",
            details: parsed.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const {
      source,
      customerName,
      customerPhone,
      customerEmail,
      customerNote,
      shippingAddress,
      items,
      shippingPaise,
      discountPaise,
      paymentStatus,
    } = parsed.data;

    await dbConnect();

    let subtotalPaise = 0;
    const orderItems = items.map((i) => {
      const lineTotal = i.unitPricePaise * i.quantity;
      subtotalPaise += lineTotal;
      return {
        productNameSnapshot: i.productName,
        skuSnapshot: i.sku,
        unitPricePaise: i.unitPricePaise,
        quantity: i.quantity,
        personalisation: i.personalisation,
        lineTotalPaise: lineTotal,
      };
    });

    const totalPaise = subtotalPaise + shippingPaise - discountPaise;
    const orderNumber = generateOrderNumber();

    // Check or create customer
    let customer = await Customer.findOne({ phoneE164: customerPhone });
    if (!customer) {
      customer = await Customer.create({
        fullName: customerName,
        phoneE164: customerPhone,
        email: customerEmail || undefined,
        addresses: [shippingAddress],
      });
    }

    const initialOrderStatus = paymentStatus === "PAID" ? "CONFIRMED" : "PLACED";

    const order = await Order.create({
      orderNumber,
      customerId: customer._id,
      source,
      orderStatus: initialOrderStatus,
      paymentStatus,
      subtotalPaise,
      shippingPaise,
      discountPaise,
      totalPaise,
      currency: "INR",
      shippingAddressSnapshot: shippingAddress,
      customerNameSnapshot: customerName,
      customerPhoneSnapshot: customerPhone,
      customerEmailSnapshot: customerEmail || undefined,
      customerNote,
      items: orderItems,
      statusHistory: [
        {
          toStatus: initialOrderStatus,
          note: `Manual order created by ${session.name} (${session.role}) from ${source}`,
          actorAdminId: session.id,
          createdAt: new Date(),
        },
      ],
    });

    if (paymentStatus === "PAID") {
      await Payment.create({
        orderId: order._id,
        provider: "MANUAL",
        amountPaise: totalPaise,
        currency: "INR",
        status: "CAPTURED",
        method: source,
        verifiedAt: new Date(),
      });
    }

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message || "Failed to create manual order" } },
      { status: 500 }
    );
  }
}

