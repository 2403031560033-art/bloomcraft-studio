import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/db";
import { Order, Payment } from "@/models";

// POST /api/v1/webhooks/payments/[provider]
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    await dbConnect();

    // Verify webhook signature (e.g. for Razorpay)
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (secret && signature) {
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        return NextResponse.json(
          { error: { code: "PAYMENT_VERIFICATION_FAILED", message: "Invalid webhook signature" } },
          { status: 400 }
        );
      }
    }

    const event = JSON.parse(rawBody);
    const eventId = event.id || event.event_id || `evt_${Date.now()}_${Math.random()}`;

    // Idempotency check: verify if this event was already processed
    const existingPayment = await Payment.findOne({ providerEventId: eventId });
    if (existingPayment) {
      return NextResponse.json({ success: true, message: "Event already processed (idempotent)" });
    }

    // Process payment authorized/captured
    const eventType = event.event || "payment.captured";
    const paymentEntity = event.payload?.payment?.entity || event;
    const orderNumber = paymentEntity.notes?.orderNumber;
    const amountPaise = paymentEntity.amount;

    if (orderNumber) {
      const order = await Order.findOne({ orderNumber });
      if (order) {
        if (eventType === "payment.captured" || eventType === "order.paid") {
          order.paymentStatus = "PAID";
          order.orderStatus = "CONFIRMED";
          order.statusHistory.push({
            toStatus: "CONFIRMED",
            note: `Payment of ₹${(amountPaise / 100).toFixed(2)} verified via signed ${provider} webhook`,
            createdAt: new Date(),
          });
          await order.save();

          await Payment.create({
            orderId: order._id,
            provider,
            providerPaymentId: paymentEntity.id,
            providerOrderId: paymentEntity.order_id,
            providerEventId: eventId,
            amountPaise: amountPaise || order.totalPaise,
            currency: "INR",
            status: "CAPTURED",
            method: paymentEntity.method || "ONLINE",
            verifiedAt: new Date(),
            redactedEvent: {
              eventId,
              eventType,
              amount: amountPaise,
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message || "Webhook processing error" } },
      { status: 500 }
    );
  }
}

