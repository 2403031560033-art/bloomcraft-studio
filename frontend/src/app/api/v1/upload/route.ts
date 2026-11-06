import { NextRequest, NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "bloomcraft_uploads";

    if (!file) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "No image file provided" } },
        { status: 400 }
      );
    }

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Image exceeds 5MB size limit" } },
        { status: 400 }
      );
    }

    // Check mime type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Only JPEG, PNG, WEBP, and GIF images are allowed" } },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // If Cloudinary keys are present, upload directly
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      const uploadResult = await uploadImage(buffer, folder);
      return NextResponse.json({
        success: true,
        data: {
          url: uploadResult.url,
          publicId: uploadResult.publicId,
        },
      });
    } else {
      // Graceful fallback for local development: return Data URL
      const base64Data = buffer.toString("base64");
      const dataUrl = `data:${file.type};base64,${base64Data}`;
      return NextResponse.json({
        success: true,
        data: {
          url: dataUrl,
          publicId: `dev_${Date.now()}`,
          isDevPlaceholder: true,
          note: "Configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in .env.local for production cloud CDN storage.",
        },
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message || "Image upload failed" } },
      { status: 500 }
    );
  }
}

