import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Gift } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FFFBF8] via-[#F6E4EC]/30 to-[#FFFBF8] py-12 md:py-20 border-b border-[#E5DDE2]/50">
      {/* Decorative soft blurred background blurs */}
      <div className="absolute top-10 left-1/4 w-72 h-72 bg-[#F6E4EC] rounded-full blur-3xl opacity-50 -z-10" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-[#EEE9F7] rounded-full blur-3xl opacity-60 -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F6E4EC] text-[#A64D78] text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Jhansi&apos;s Boutique Handmade Studio</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#43243F] leading-[1.15] tracking-tight">
              Little things, <br />
              <span className="italic font-normal text-[#A64D78]">made with love.</span>
            </h1>

            <p className="text-[#6F6670] text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans">
              Handcrafted blooms, crochet treasures, and personalised keepsakes crafted one petal at a time to celebrate life&apos;s special moments.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/shop"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#704568] hover:bg-[#43243F] text-white font-medium rounded-full shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 group"
              >
                <span>Shop the collection</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/custom-order"
                className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-[#F6E4EC]/60 text-[#43243F] font-medium border border-[#E5DDE2] rounded-full shadow-xs hover:border-[#A64D78] transition flex items-center justify-center gap-2"
              >
                <Gift className="w-4 h-4 text-[#A64D78]" />
                <span>Create a custom gift</span>
              </Link>
            </div>

            {/* Quick credibility line */}
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-[#6F6670]">
              <span className="flex items-center gap-1.5">
                <span className="text-[#28734D]">✓</span> 100% Hand-knitted & crafted
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-[#28734D]">✓</span> Custom Color Themes
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-[#28734D]">✓</span> Pan-India Dispatched
              </span>
            </div>
          </div>

          {/* Hero Visual Card matching mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div
              className="relative w-full max-w-md aspect-4/5 rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-gradient-to-tr from-[#F8F0E9] to-[#F6E4EC]/40 group"
              style={{ position: "relative" }}
            >
              <Image
                src="https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=800&q=80"
                alt="Handcrafted crochet floral bouquet"
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#43243F]/60 via-transparent to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 text-white bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50 text-[#261F26]">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A64D78]">Signature Craft</span>
                    <h3 className="font-serif font-bold text-base text-[#43243F]">Eternal Lavender Bloom</h3>
                  </div>
                  <span className="font-serif font-bold text-lg text-[#704568]">₹799</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

