import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { CustomOrderRequest, Order, Customer, Payment } from "@/models";
import { getSessionFromRequest } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";

// POST /api/v1/admin/custom-requests/[id]/convert-to-order
export async function POST(
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
    const { shippingAddress, shippingPaise = 0 } = body;

    if (!shippingAddress || !shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.postalCode) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Shipping address is required to convert request to an order" } },
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

    if (request.status !== "ACCEPTED" && session.role !== "OWNER") {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_STATE",
            message: "Custom request must be in 'ACCEPTED' status before converting to an order",
          },
        },
        { status: 422 }
      );
    }

    if (!request.quotePaise || request.quotePaise <= 0) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Request must have a valid agreed quote price" } },
        { status: 400 }
      );
    }

    // Upsert customer
    let customer = await Customer.findOne({ phoneE164: request.phoneE164 });
    if (!customer) {
      customer = await Customer.create({
        fullName: request.customerName,
        phoneE164: request.phoneE164,
        email: request.email || undefined,
        addresses: [shippingAddress],
      });
    }

    const orderNumber = generateOrderNumber();
    const subtotalPaise = request.quotePaise;
    const totalPaise = subtotalPaise + (shippingPaise || 0);

    const order = await Order.create({
      orderNumber,
      customerId: customer._id,
      source: "MANUAL",
      orderStatus: "CONFIRMED",
      paymentStatus: "PENDING",
      subtotalPaise,
      shippingPaise,
      discountPaise: 0,
      totalPaise,
      currency: "INR",
      shippingAddressSnapshot: shippingAddress,
      customerNameSnapshot: request.customerName,
      customerPhoneSnapshot: request.phoneE164,
      customerEmailSnapshot: request.email || undefined,
      customerNote: `Converted from Custom Order Request #${request.requestNumber}. Occasion: ${request.occasion || 'N/A'}. Colours: ${request.preferredColours?.join(', ') || 'N/A'}`,
      items: [
        {
          productNameSnapshot: `Custom Gift: ${request.occasion || "Handmade Request"}`,
          unitPricePaise: subtotalPaise,
          quantity: 1,
          personalisation: {
            requestNumber: request.requestNumber,
            description: request.description,
            preferredColours: request.preferredColours,
            inspirationImageUrl: request.inspirationImageUrl,
          },
          lineTotalPaise: subtotalPaise,
        },
      ],
      statusHistory: [
        {
          toStatus: "CONFIRMED",
          note: `Converted from Custom Order Request ${request.requestNumber} by ${session.name}`,
          actorAdminId: session.id as any,
          createdAt: new Date(),
        },
      ],
    });

    // Link request to order and update status
    request.status = "CONVERTED";
    request.convertedOrderId = order._id;
    await request.save();

    await Payment.create({
      orderId: order._id,
      provider: "MANUAL",
      amountPaise: totalPaise,
      currency: "INR",
      status: "AUTHORIZED",
      method: "CUSTOM_QUOTE",
    });

    return NextResponse.json({
      success: true,
      data: {
        order,
        customRequest: request,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message || "Failed to convert custom request to order" } },
      { status: 500 }
    );
  }
}

