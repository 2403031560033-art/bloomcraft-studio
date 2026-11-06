"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

const BESTSELLERS = [
  {
    id: "prod-heart-rose",
    name: "Heart Rose Bouquet",
    slug: "heart-rose-bouquet",
    pricePaise: 79900,
    priceDisplay: "₹799",
    fulfilmentType: "MADE_TO_ORDER" as const,
    badge: "Handmade",
    imageUrl: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=600&q=80",
    prepDays: 3,
  },
  {
    id: "prod-sunflower-pot",
    name: "Sunflower Crochet Pot",
    slug: "sunflower-crochet-pot",
    pricePaise: 49900,
    priceDisplay: "₹499",
    fulfilmentType: "READY_STOCK" as const,
    badge: "Handmade",
    imageUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80",
    prepDays: 1,
  },
  {
    id: "prod-crochet-keychain",
    name: "Crochet Flower Keychain",
    slug: "crochet-flower-keychain",
    pricePaise: 24900,
    priceDisplay: "₹249",
    fulfilmentType: "READY_STOCK" as const,
    badge: "Handmade",
    imageUrl: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=600&q=80",
    prepDays: 1,
  },
  {
    id: "prod-shubh-laabh-toran",
    name: "Shubh-Laabh Floral Toran",
    slug: "shubh-laabh-floral-toran",
    pricePaise: 59900,
    priceDisplay: "₹599",
    fulfilmentType: "MADE_TO_ORDER" as const,
    badge: "Handmade",
    imageUrl: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=600&q=80",
    prepDays: 4,
  },
];

export default function BestsellersSection() {
  const { addItem } = useCart();

  return (
    <section className="py-14 sm:py-20 bg-gradient-to-b from-[#FFFBF8] to-[#F8F0E9]/50 border-t border-[#E5DDE2]/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-12 space-y-2">
          <div className="flex items-center justify-center gap-3">
            <span className="text-[#A64D78] text-sm font-serif">❧</span>
            <span className="text-xs uppercase tracking-widest text-[#704568] font-bold">Most Loved Creations</span>
            <span className="text-[#A64D78] text-sm font-serif">☙</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#43243F]">
            Our Bestsellers
          </h2>
          <div className="w-16 h-0.5 bg-[#A64D78]/40 mx-auto rounded-full mt-2" />
        </div>

        {/* Product Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          {BESTSELLERS.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-2xl border border-[#E5DDE2]/80 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div
                className="relative aspect-square overflow-hidden bg-[#F6E4EC]/20"
                style={{ position: "relative" }}
              >
                <Link href={`/products/${product.slug}`} className="block w-full h-full">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                </Link>

                {/* Handmade Badge */}
                <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-[#704568] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                  {product.badge}
                </span>

                {/* Wishlist Button */}
                <button
                  aria-label="Save to wishlist"
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 backdrop-blur-xs text-[#6F6670] hover:text-[#A64D78] hover:bg-white transition shadow-xs"
                >
                  <Heart className="w-4 h-4" />
                </button>
              </div>

              {/* Card Details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] text-[#A64D78] font-medium mb-1">
                    {product.fulfilmentType === "READY_STOCK" ? "Ready Stock" : "Made to order (~3 days)"}
                  </div>
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="font-serif font-bold text-sm sm:text-base text-[#43243F] group-hover:text-[#A64D78] transition line-clamp-1">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="font-serif font-bold text-base sm:text-lg text-[#704568] mt-1">
                    {product.priceDisplay}
                  </p>
                </div>

                <div className="pt-3 mt-2 border-t border-gray-100">
                  <button
                    onClick={() =>
                      addItem({
                        productId: product.id,
                        productName: product.name,
                        pricePaise: product.pricePaise,
                        quantity: 1,
                        imageUrl: product.imageUrl,
                        fulfilmentType: product.fulfilmentType,
                        preparationDays: product.prepDays,
                      })
                    }
                    className="w-full py-2 px-3 bg-[#F6E4EC] hover:bg-[#704568] text-[#704568] hover:text-white rounded-xl text-xs font-semibold tracking-wide flex items-center justify-center gap-1.5 transition duration-200"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Order Callout Card matching UI Mockup */}
        <div className="relative rounded-3xl bg-gradient-to-r from-[#F6E4EC] via-[#EEE9F7] to-[#F8F0E9] p-8 sm:p-12 border border-[#E5DDE2] overflow-hidden shadow-sm">
          {/* Subtle floral watermark */}
          <div className="absolute right-4 -bottom-10 text-9xl text-[#A64D78]/10 pointer-events-none select-none font-serif">
            🌸
          </div>

          <div className="max-w-xl relative z-10 space-y-4">
            <span className="text-xs uppercase tracking-widest text-[#A64D78] font-bold">
              Bespoke Gift Service
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#43243F] leading-tight">
              Want something unique?
            </h3>
            <p className="text-[#6F6670] text-sm sm:text-base leading-relaxed">
              Get a personalised bouquet or handmade gift, crafted specially for your anniversary, birthday, festival, or home decor. Choose your colours, flowers, and custom tag.
            </p>
            <div className="pt-2">
              <Link
                href="/custom-order"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#704568] hover:bg-[#43243F] text-white font-medium rounded-full shadow-md hover:shadow-lg transition group text-sm"
              >
                <span>Place a Custom Order</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

