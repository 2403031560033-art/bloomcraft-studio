import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import { AdminUser } from "@/models";
import { createSession, setSessionCookie } from "@/lib/auth";
import { adminLoginSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = adminLoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid credentials format" } },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    await dbConnect();

    const admin = await AdminUser.findOne({ email: email.toLowerCase() });
    if (!admin || !admin.isActive) {
      return NextResponse.json(
        { error: { code: "UNAUTHENTICATED", message: "Invalid email or password" } },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: { code: "UNAUTHENTICATED", message: "Invalid email or password" } },
        { status: 401 }
      );
    }

    admin.lastLoginAt = new Date();
    await admin.save();

    const token = await createSession({
      id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message || "Login failed" } },
      { status: 500 }
    );
  }
}

