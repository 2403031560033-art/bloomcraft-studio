import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import { Customer } from "@/models";
import { createCustomerSession, setCustomerSessionCookie } from "@/lib/auth";
import { z } from "zod";
import { phoneRegex } from "@/lib/validations";

const registerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(phoneRegex, "Please enter a valid 10-digit Indian phone number"),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid registration details", details: parsed.error.issues } },
        { status: 400 }
      );
    }

    const { fullName, phone, email, password } = parsed.data;
    await dbConnect();

    // Check if phone or email already registered with password
    const existing = await Customer.findOne({
      $or: [
        { phoneE164: phone },
        ...(email ? [{ email: email.toLowerCase() }] : []),
      ],
    });

    if (existing && existing.passwordHash) {
      return NextResponse.json(
        { error: { code: "CONFLICT", message: "An account with this phone or email already exists. Please log in." } },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let customer;
    if (existing) {
      // Upgrade existing guest checkout record to account
      existing.fullName = fullName;
      if (email) existing.email = email.toLowerCase();
      existing.passwordHash = passwordHash;
      await existing.save();
      customer = existing;
    } else {
      customer = await Customer.create({
        fullName,
        phoneE164: phone,
        email: email ? email.toLowerCase() : undefined,
        passwordHash,
        addresses: [],
      });
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
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message || "Registration failed" } },
      { status: 500 }
    );
  }
}

