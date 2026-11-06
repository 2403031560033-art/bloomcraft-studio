import React from "react";
import Link from "next/link";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";

const FAQS = [
  {
    q: "How long does it take to receive my order?",
    a: "Ready-stock products ship within 24 hours and usually arrive within 3-5 business days across India. Made-to-order creations require 2 to 4 days of handcrafting before dispatch.",
  },
  {
    q: "How do I take care of crochet flower bouquets and pots?",
    a: "Crochet flowers are durable and last for years! Keep them away from high moisture and direct prolonged rain. If dust settles over time, gently brush them with a clean makeup brush or use a cool hairdryer setting.",
  },
  {
    q: "Can I customize the flower colors or bouquet size?",
    a: "Yes, absolutely! You can choose custom colors on the product page or submit a detailed bespoke inquiry via our 'Create a Custom Gift' form.",
  },
  {
    q: "How can I track my package after placing an order?",
    a: "Simply visit our 'Track Your Order' page and enter your Order Number (e.g. BC261105...) and the phone number provided at checkout. You will see real-time status from production to courier tracking.",
  },
  {
    q: "Do you offer Cash on Delivery (COD)?",
    a: "COD availability is configured based on delivery PIN code and item type. For bespoke personalized creations with custom names, online prepaid payment is required.",
  },
  {
    q: "What if my parcel arrives damaged?",
    a: "We wrap every order in multi-layered protective packaging. In the rare event of damage in transit, please share an unboxing video with us within 48 hours for immediate replacement.",
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFBF8]">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A64D78]">
            Help & Guidance
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#43243F]">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-[#6F6670]">
            Everything you need to know about our handcrafted process, shipping, and custom orders.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <div key={i} className="p-6 bg-white rounded-2xl border border-[#E5DDE2] shadow-xs space-y-2">
              <h3 className="font-serif font-bold text-base text-[#43243F]">{faq.q}</h3>
              <p className="text-xs sm:text-sm text-[#6F6670] leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="text-center pt-8 border-t border-[#E5DDE2]">
          <p className="text-xs text-[#6F6670]">
            Still have a question? Contact Soni via{" "}
            <Link href="/contact" className="text-[#704568] font-bold hover:underline">
              our Contact page
            </Link>{" "}
            or DM on Instagram.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

