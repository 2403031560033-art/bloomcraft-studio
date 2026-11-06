import React from "react";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";

export default function ReturnsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFBF8]">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-8">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A64D78]">
            Policies & Protection
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#43243F]">
            Returns, Replacements & Cancellation Policy
          </h1>
          <p className="text-xs text-[#6F6670]">Effective date: November 2026</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-[#E5DDE2] space-y-6 text-xs sm:text-sm text-[#261F26] leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-serif font-bold text-base text-[#43243F]">1. Handmade & Bespoke Nature</h2>
            <p>
              Every BloomCraft Studio piece is hand-knitted and assembled by hand. Minor natural variations in stitch tightness, yarn dye lot, or flower orientation are intrinsic to artisanal craftsmanship and celebrate its authenticity.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif font-bold text-base text-[#43243F]">2. Damaged or Incorrect Item Guarantee</h2>
            <p>
              Your delight is our highest priority. If your order arrives physically damaged in transit or differs from the confirmed order specification:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#6F6670]">
              <li>Please capture an unboxing video upon receiving the package.</li>
              <li>Notify our Jhansi studio via Instagram DM or email within 48 hours of delivery.</li>
              <li>We will arrange a free replacement or complete refund promptly upon verification.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif font-bold text-base text-[#43243F]">3. Cancellations</h2>
            <p>
              Standard orders may be cancelled within 12 hours of placement before production commences. Custom personalized orders (with custom names, custom colors, or bespoke designs) cannot be cancelled once production has started.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

