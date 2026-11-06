import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Category } from "@/models";
import { getSessionFromRequest } from "@/lib/auth";
import { categorySchema } from "@/lib/validations";

// GET /api/v1/categories - public active categories
export async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message || "Failed to fetch categories" } },
      { status: 500 }
    );
  }
}

// POST /api/v1/categories - admin create category
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
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid category data", details: parsed.error.issues } },
        { status: 400 }
      );
    }

    await dbConnect();
    const existing = await Category.findOne({ slug: parsed.data.slug });
    if (existing) {
      return NextResponse.json(
        { error: { code: "CONFLICT", message: "Category with this slug already exists" } },
        { status: 409 }
      );
    }

    const category = await Category.create(parsed.data);
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message || "Failed to create category" } },
      { status: 500 }
    );
  }
}

