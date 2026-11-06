import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { BusinessSettings } from "@/models";

// GET /api/v1/settings - public business info and policies
export async function GET() {
  try {
    await dbConnect();
    let settings = await BusinessSettings.findOne();
    if (!settings) {
      settings = await BusinessSettings.create({
        businessName: "BloomCraft Studio",
        instagramUrl: "https://www.instagram.com/bloomcraftstudio_",
        flatShippingRatePaise: 0,
        isCodEnabled: false,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        businessName: settings.businessName,
        supportEmail: settings.supportEmail,
        supportPhone: settings.supportPhone,
        instagramUrl: settings.instagramUrl,
        whatsappUrl: settings.whatsappUrl,
        currency: settings.currency,
        shippingPolicy: settings.shippingPolicy,
        returnPolicy: settings.returnPolicy,
        aboutContent: settings.aboutContent,
        faqContent: settings.faqContent,
        termsContent: settings.termsContent,
        privacyContent: settings.privacyContent,
        isCodEnabled: settings.isCodEnabled,
        flatShippingRatePaise: settings.flatShippingRatePaise,
        freeShippingAbovePaise: settings.freeShippingAbovePaise,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message || "Failed to load settings" } },
      { status: 500 }
    );
  }
}

