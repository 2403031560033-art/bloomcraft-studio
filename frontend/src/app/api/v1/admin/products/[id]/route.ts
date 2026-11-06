import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Product } from "@/models";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Admin login required" } }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();
    const product = await Product.findById(id).populate("categoryId");
    if (!product) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Product not found" } }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: error.message } }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Admin login required" } }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    await dbConnect();

    const product = await Product.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!product) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Product not found" } }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: error.message } }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || session.role !== "OWNER") {
      return NextResponse.json({ error: { code: "FORBIDDEN", message: "Only Owner can archive products" } }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();

    // Soft delete / archive
    const product = await Product.findByIdAndUpdate(
      id,
      { isPublished: false, archivedAt: new Date() },
      { new: true }
    );

    if (!product) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Product not found" } }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Product archived" });
  } catch (error: any) {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: error.message } }, { status: 500 });
  }
}

