import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Category } from "@/models";
import { getSessionFromRequest } from "@/lib/auth";

export async function PATCH(
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

    await dbConnect();
    const category = await Category.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!category) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Category not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message || "Failed to update category" } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || session.role !== "OWNER") {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Only Owner can delete categories" } },
        { status: 403 }
      );
    }

    const { id } = await params;
    await dbConnect();
    // Soft delete / deactivate
    const category = await Category.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!category) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Category not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Category deactivated" });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message || "Failed to delete category" } },
      { status: 500 }
    );
  }
}

