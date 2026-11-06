import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Order } from "@/models";
import { getSessionFromRequest } from "@/lib/auth";

// GET /api/v1/admin/reports/orders.csv
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();
    const orders = await Order.find().sort({ createdAt: -1 });

    const headers = [
      "Order Number",
      "Date",
      "Source",
      "Customer Name",
      "Customer Phone",
      "Customer Email",
      "City",
      "State",
      "PIN Code",
      "Order Status",
      "Payment Status",
      "Item Count",
      "Subtotal (INR)",
      "Shipping (INR)",
      "Total (INR)",
      "Tracking Carrier",
      "Tracking Number",
    ];

    const rows = orders.map((o) => {
      const itemsCount = o.items.reduce((sum: number, i: any) => sum + i.quantity, 0);
      return [
        `"${o.orderNumber}"`,
        `"${new Date(o.createdAt).toISOString()}"`,
        `"${o.source}"`,
        `"${o.customerNameSnapshot.replace(/"/g, '""')}"`,
        `"${o.customerPhoneSnapshot}"`,
        `"${o.customerEmailSnapshot || ""}"`,
        `"${o.shippingAddressSnapshot?.city || ""}"`,
        `"${o.shippingAddressSnapshot?.state || ""}"`,
        `"${o.shippingAddressSnapshot?.postalCode || ""}"`,
        `"${o.orderStatus}"`,
        `"${o.paymentStatus}"`,
        itemsCount,
        (o.subtotalPaise / 100).toFixed(2),
        (o.shippingPaise / 100).toFixed(2),
        (o.totalPaise / 100).toFixed(2),
        `"${o.trackingCarrier || ""}"`,
        `"${o.trackingNumber || ""}"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="bloomcraft-orders-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error: any) {
    return new NextResponse(`Export failed: ${error.message}`, { status: 500 });
  }
}

