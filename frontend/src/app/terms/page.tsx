import React from "react";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFBF8]">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-8">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A64D78]">
            Legal
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#43243F]">
            Terms of Service
          </h1>
          <p className="text-xs text-[#6F6670]">Effective date: November 2026</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-[#E5DDE2] space-y-6 text-xs sm:text-sm text-[#261F26] leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-serif font-bold text-base text-[#43243F]">1. Agreement to Terms</h2>
            <p>
              By accessing and placing orders through BloomCraft Studio, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, please do not use our service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif font-bold text-base text-[#43243F]">2. Pricing & Accurate Descriptions</h2>
            <p>
              Prices are listed in Indian Rupees (INR) and are verified by our server at the time of checkout. In case of an unintentional typographical pricing error, we reserve the right to notify the customer and rectify or cancel the order before dispatch.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif font-bold text-base text-[#43243F]">3. Custom Request Approval</h2>
            <p>
              A custom order inquiry submitted via our website does not constitute a legally confirmed contract until both price and preparation schedule are agreed upon by the customer and BloomCraft Studio.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif font-bold text-base text-[#43243F]">4. Jurisdiction</h2>
            <p>
              Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the competent courts in Jhansi, Uttar Pradesh, India.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

