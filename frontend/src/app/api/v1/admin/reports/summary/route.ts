import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Order, CustomOrderRequest, Product } from "@/models";
import { getSessionFromRequest } from "@/lib/auth";

// GET /api/v1/admin/reports/summary
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { error: { code: "UNAUTHENTICATED", message: "Admin login required" } },
        { status: 401 }
      );
    }

    await dbConnect();

    // Aggregations
    const totalOrders = await Order.countDocuments();
    const activeOrders = await Order.countDocuments({
      orderStatus: { $in: ["PLACED", "CONFIRMED", "IN_PRODUCTION", "READY_TO_DISPATCH"] },
    });

    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: { $in: ["PAID", "COD_DUE"] } } },
      { $group: { _id: null, totalRevenuePaise: { $sum: "$totalPaise" } } },
    ]);
    const totalRevenuePaise = revenueResult[0]?.totalRevenuePaise || 0;

    const pendingRequests = await CustomOrderRequest.countDocuments({
      status: { $in: ["SUBMITTED", "UNDER_REVIEW", "NEEDS_INFORMATION"] },
    });

    const lowStockProducts = await Product.find({
      fulfilmentType: "READY_STOCK",
      stockQuantity: { $lte: 3 },
      isPublished: true,
      archivedAt: null,
    }).select("name stockQuantity slug");

    // Orders by source
    const ordersBySource = await Order.aggregate([
      { $group: { _id: "$source", count: { $sum: 1 }, revenuePaise: { $sum: "$totalPaise" } } },
    ]);

    // Recent 5 orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("orderNumber customerNameSnapshot orderStatus paymentStatus totalPaise createdAt source");

    return NextResponse.json({
      success: true,
      data: {
        totalOrders,
        activeOrders,
        totalRevenuePaise,
        pendingRequests,
        lowStockProducts,
        ordersBySource,
        recentOrders,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message || "Failed to generate report" } },
      { status: 500 }
    );
  }
}

