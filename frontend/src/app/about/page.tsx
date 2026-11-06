import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, Sparkles, ArrowRight } from "lucide-react";
import { InstagramIcon } from "@/components/ui/Icons";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFBF8]">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-16">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F6E4EC] text-[#A64D78] text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Our Journey</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#43243F]">
            The BloomCraft Story
          </h1>
          <p className="text-sm sm:text-base text-[#6F6670] leading-relaxed">
            From handcrafted crochet petals knitted on quiet afternoons in Jhansi to heartfelt gifts cherished across India.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div
            className="relative aspect-4/5 rounded-3xl overflow-hidden border border-[#E5DDE2] shadow-md bg-[#F8F0E9]"
            style={{ position: "relative" }}
          >
            <Image
              src="https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=800&q=80"
              alt="Handmade crochet flowers in Jhansi"
              fill
              className="object-cover"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-xs p-3 rounded-2xl border border-white text-xs text-[#43243F]">
              <span className="font-bold block">BloomCraft Studio</span>
              <span className="text-[#6F6670]">Founded by Soni in Jhansi, Uttar Pradesh</span>
            </div>
          </div>

          <div className="space-y-6 text-[#261F26] text-sm sm:text-base leading-relaxed">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#43243F]">
              Flowers that never wither, moments that last forever.
            </h2>
            <p>
              Fresh bouquets are breathtaking, but their beauty fades within days. At BloomCraft Studio, each flower stem is patiently crafted with premium yarn, sturdy floral wire, and delicate hands so your sentiment remains evergreen.
            </p>
            <p>
              What started as bespoke commissions shared via Instagram DM (<strong>@bloomcraftstudio_</strong>) has now blossomed into a curated platform for handmade art lovers across the country.
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs font-semibold">
              <a
                href="https://www.instagram.com/bloomcraftstudio_"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#704568] text-white hover:bg-[#43243F] transition"
              >
                <InstagramIcon className="w-4 h-4" />
                <span>Follow on Instagram</span>
              </a>
              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 text-[#704568] hover:text-[#43243F] transition"
              >
                <span>Browse the gallery</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-[#E5DDE2]">
          <div className="p-6 rounded-2xl bg-white border border-[#E5DDE2] space-y-2">
            <span className="text-2xl">🌱</span>
            <h3 className="font-serif font-bold text-base text-[#43243F]">Pure Handcrafting</h3>
            <p className="text-xs text-[#6F6670]">
              Every petal, leaf, and accessory is meticulously crafted without bulk factory shortcuts.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-[#E5DDE2] space-y-2">
            <span className="text-2xl">🎨</span>
            <h3 className="font-serif font-bold text-base text-[#43243F]">Custom Palette Freedom</h3>
            <p className="text-xs text-[#6F6670]">
              Whether matching a wedding lehenga or bedroom aesthetic, we welcome custom color palettes.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-[#E5DDE2] space-y-2">
            <span className="text-2xl">📦</span>
            <h3 className="font-serif font-bold text-base text-[#43243F]">Gifting Packaging</h3>
            <p className="text-xs text-[#6F6670]">
              Delivered in protective, aesthetically wrapped boxes ready to be gifted right out of the parcel.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
