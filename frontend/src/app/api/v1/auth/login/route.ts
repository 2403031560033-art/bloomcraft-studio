import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import { Customer } from "@/models";
import { createCustomerSession, setCustomerSessionCookie } from "@/lib/auth";
import { z } from "zod";

const loginSchema = z.object({
  identifier: z.string().min(2, "Phone or email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid credentials format" } },
        { status: 400 }
      );
    }

    const { identifier, password } = parsed.data;
    await dbConnect();

    // Find customer by email or phone
    const cleanId = identifier.trim();
    const customer = await Customer.findOne({
      $or: [
        { email: cleanId.toLowerCase() },
        { phoneE164: cleanId },
        { phoneE164: cleanId.replace(/\D/g, "").slice(-10) },
      ],
    });

    if (!customer || !customer.passwordHash) {
      return NextResponse.json(
        { error: { code: "UNAUTHENTICATED", message: "No customer account found with this phone or email. Please register." } },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, customer.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: { code: "UNAUTHENTICATED", message: "Incorrect password. Please try again." } },
        { status: 401 }
      );
    }

    const token = await createCustomerSession({
      id: customer._id.toString(),
      email: customer.email,
      phone: customer.phoneE164,
      name: customer.fullName,
    });

    await setCustomerSessionCookie(token);

    return NextResponse.json({
      success: true,
      data: {
        id: customer._id,
        name: customer.fullName,
        email: customer.email,
        phone: customer.phoneE164,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message || "Login failed" } },
      { status: 500 }
    );
  }
}

