import React from "react";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFBF8]">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-8">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A64D78]">
            Legal & Data
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#43243F]">
            Privacy Policy
          </h1>
          <p className="text-xs text-[#6F6670]">Effective date: November 2026</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-[#E5DDE2] space-y-6 text-xs sm:text-sm text-[#261F26] leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-serif font-bold text-base text-[#43243F]">1. Information We Collect</h2>
            <p>
              We collect information you explicitly provide when ordering as a guest or submitting a custom order request: name, phone number, email address, delivery postal address, and custom gift specifications.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif font-bold text-base text-[#43243F]">2. How We Use Your Information</h2>
            <p>
              Your contact and address details are used solely to fulfil your orders, calculate delivery logistics, provide tracking status, and coordinate design requests on WhatsApp or phone. We never sell, rent, or trade your personal information.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif font-bold text-base text-[#43243F]">3. Payment Data Security</h2>
            <p>
              BloomCraft Studio does NOT store or process your credit card, debit card, or UPI PIN numbers. All payment processing is securely handled through authorized RBI-regulated payment gateways (such as Razorpay) with 256-bit encryption.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

