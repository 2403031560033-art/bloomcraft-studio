import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Product, Category } from "@/models";
import { getSessionFromRequest } from "@/lib/auth";
import { productSchema } from "@/lib/validations";

// GET /api/v1/products - public catalogue
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");
    const q = searchParams.get("q");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const availability = searchParams.get("availability"); // 'READY_STOCK' | 'MADE_TO_ORDER' | 'CUSTOM_ONLY'
    const sort = searchParams.get("sort") || "featured";
    const limit = Math.min(parseInt(searchParams.get("limit") || "24", 10), 100);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);

    const filter: Record<string, any> = {
      isPublished: true,
      archivedAt: null,
    };

    if (categorySlug) {
      const cat = await Category.findOne({ slug: categorySlug, isActive: true });
      if (cat) {
        filter.categoryId = cat._id;
      } else {
        return NextResponse.json({ success: true, data: [], pagination: { total: 0, page, pages: 0 } });
      }
    }

    if (availability) {
      filter.fulfilmentType = availability;
    }

    if (minPrice || maxPrice) {
      filter.basePricePaise = {};
      if (minPrice) filter.basePricePaise.$gte = parseInt(minPrice, 10) * 100;
      if (maxPrice) filter.basePricePaise.$lte = parseInt(maxPrice, 10) * 100;
    }

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { shortDescription: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ];
    }

    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === "price-asc") sortOption = { basePricePaise: 1 };
    if (sort === "price-desc") sortOption = { basePricePaise: -1 };
    if (sort === "name-asc") sortOption = { name: 1 };

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate("categoryId", "name slug")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message || "Failed to fetch products" } },
      { status: 500 }
    );
  }
}

// POST /api/v1/products - admin create product
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
      return NextResponse.json(
        { error: { code: "CONFLICT", message: "A product with this slug already exists" } },
        { status: 409 }
      );
    }

    const product = await Product.create(parsed.data);
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message || "Failed to create product" } },
      { status: 500 }
    );
  }
}

