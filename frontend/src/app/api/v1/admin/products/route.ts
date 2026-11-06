import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Product } from "@/models";
import { getSessionFromRequest } from "@/lib/auth";
import { productSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Admin login required" } }, { status: 401 });
    }

    await dbConnect();
    const products = await Product.find()
      .populate("categoryId", "name slug")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: error.message } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Admin login required" } }, { status: 401 });
    }

    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid product data", details: parsed.error.issues } },
        { status: 400 }
      );
    }

    await dbConnect();
    const existing = await Product.findOne({ slug: parsed.data.slug });
    if (existing) {
      return NextResponse.json({ error: { code: "CONFLICT", message: "Product slug already exists" } }, { status: 409 });
    }

    const product = await Product.create(parsed.data);
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: error.message } }, { status: 500 });
  }
}

