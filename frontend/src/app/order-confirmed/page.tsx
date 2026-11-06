"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Truck, Phone } from "lucide-react";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";

function OrderConfirmedContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber") || "BC-ORDER";
  const phone = searchParams.get("phone") || "";

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-[#28734D]/10 text-[#28734D] mx-auto flex items-center justify-center animate-bounce">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#A64D78] font-bold">
          Order Successfully Placed
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#43243F]">
          Thank you for choosing BloomCraft!
        </h1>
        <p className="text-sm text-[#6F6670] max-w-md mx-auto">
          Your order has been recorded in our Jhansi studio queue. Each stitch and petal is being prepared with utmost care.
        </p>
      </div>

      {/* Order Badge */}
      <div className="p-6 bg-white rounded-2xl border border-[#E5DDE2] shadow-xs text-left space-y-3">
        <div className="flex justify-between items-center text-xs border-b border-gray-100 pb-2">
          <span className="text-[#6F6670]">Order Reference Number</span>
          <span className="font-mono font-bold text-sm text-[#704568]">{orderNumber}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-[#6F6670]">Fulfilment Studio</span>
          <span className="font-medium text-[#43243F]">Jhansi, Uttar Pradesh</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-[#6F6670]">Estimated Dispatch</span>
          <span className="font-medium text-[#28734D]">Within 2-3 Business Days</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          href={`/track?orderNumber=${orderNumber}&phone=${encodeURIComponent(phone)}`}
          className="w-full sm:w-auto px-8 py-3.5 bg-[#704568] hover:bg-[#43243F] text-white text-xs font-semibold uppercase tracking-wider rounded-full shadow-md flex items-center justify-center gap-2"
        >
          <Truck className="w-4 h-4" />
          <span>Track Order Status</span>
        </Link>

        <Link
          href="/shop"
          className="w-full sm:w-auto px-8 py-3.5 bg-white border border-[#E5DDE2] text-[#43243F] text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-[#F6E4EC] flex items-center justify-center gap-2"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="pt-6 text-xs text-[#6F6670] flex items-center justify-center gap-2">
        <Phone className="w-3.5 h-3.5 text-[#A64D78]" />
        <span>Questions about your order? Reach out on Instagram @bloomcraftstudio_</span>
      </div>
    </div>
  );
}

export default function OrderConfirmedPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFBF8]">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-sm">Processing order receipt...</div>}>
          <OrderConfirmedContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

