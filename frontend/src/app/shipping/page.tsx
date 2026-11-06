import React from "react";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";

export default function ShippingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFBF8]">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-8">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A64D78]">
            Policies & Dispatch
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#43243F]">
            Shipping & Delivery Policy
          </h1>
          <p className="text-xs text-[#6F6670]">Effective date: November 2026</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-[#E5DDE2] space-y-6 text-xs sm:text-sm text-[#261F26] leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-serif font-bold text-base text-[#43243F]">1. Origin & Coverage</h2>
            <p>
              All orders are hand-packaged and dispatched directly from our studio in Jhansi, Uttar Pradesh. We ship to over 26,000+ PIN codes across India using reputed courier partners (Delhivery, BlueDart, DTDC, and India Post Speed Post).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif font-bold text-base text-[#43243F]">2. Production & Preparation Time</h2>
            <p>
              Because our creations are handmade:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#6F6670]">
              <li><strong>Ready-Stock items:</strong> Dispatched within 24 to 48 hours.</li>
              <li><strong>Made-to-Order items:</strong> Require 2 to 4 working days of hand-knitting and floral assembly before dispatch.</li>
              <li><strong>Custom Bespoke Gifts:</strong> Timeline will be agreed upon mutually during quote approval.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif font-bold text-base text-[#43243F]">3. Transit Times</h2>
            <p>
              Once dispatched, standard courier delivery typically takes 3 to 6 business days depending on destination:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#6F6670]">
              <li>North India & Metros: 2 to 4 business days</li>
              <li>South / West / East India: 3 to 5 business days</li>
              <li>North-East / Remote areas: 5 to 7 business days</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif font-bold text-base text-[#43243F]">4. Tracking Your Order</h2>
            <p>
              As soon as your shipment is scanned by our courier partner, you can track it live using your Order Number and phone number on our website tracking page.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

