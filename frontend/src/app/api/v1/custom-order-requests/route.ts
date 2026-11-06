import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { CustomOrderRequest } from "@/models";
import { customOrderRequestSchema } from "@/lib/validations";
import { generateRequestNumber } from "@/lib/utils";

// POST /api/v1/custom-order-requests
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = customOrderRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Please fill out all required custom request fields",
            details: parsed.error.issues,
          },
        },
        { status: 400 }
      );
    }

    await dbConnect();

    const requestNumber = generateRequestNumber();

    const customRequest = await CustomOrderRequest.create({
      requestNumber,
      customerName: parsed.data.customerName,
      phoneE164: parsed.data.phoneE164,
      email: parsed.data.email || undefined,
      occasion: parsed.data.occasion,
      budgetMinPaise: parsed.data.budgetMinPaise,
      budgetMaxPaise: parsed.data.budgetMaxPaise,
      preferredColours: parsed.data.preferredColours,
      description: parsed.data.description,
      inspirationImageUrl: parsed.data.inspirationImageUrl || undefined,
      inspirationImagePublicId: parsed.data.inspirationImagePublicId || undefined,
      requiredBy: parsed.data.requiredBy ? new Date(parsed.data.requiredBy) : undefined,
      status: "SUBMITTED",
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          requestNumber: customRequest.requestNumber,
          status: customRequest.status,
          message:
            "Thank you! Your custom gift inquiry has been submitted. Soni will review your request and get back with a quote and lead time estimate.",
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: error.message || "Failed to submit custom order request",
        },
      },
      { status: 500 }
    );
  }
}

