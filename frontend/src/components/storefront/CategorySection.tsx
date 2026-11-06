import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

const CATEGORIES = [
  {
    name: "Bouquets",
    slug: "bouquets",
    href: "/shop?category=bouquets",
    image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=400&q=80",
    bg: "bg-[#F6E4EC]/50",
  },
  {
    name: "Flower Pots",
    slug: "flower-pots",
    href: "/shop?category=flower-pots",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=400&q=80",
    bg: "bg-[#F8F0E9]",
  },
  {
    name: "Keychains",
    slug: "keychains",
    href: "/shop?category=keychains",
    image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=400&q=80",
    bg: "bg-[#EEE9F7]/60",
  },
  {
    name: "Toran & Wall Hangings",
    slug: "toran-wall-hangings",
    href: "/shop?category=toran-wall-hangings",
    image: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=400&q=80",
    bg: "bg-[#F6E4EC]/40",
  },
  {
    name: "Hair Accessories",
    slug: "hair-accessories",
    href: "/shop?category=hair-accessories",
    image: "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&w=400&q=80",
    bg: "bg-[#EEE9F7]/40",
  },
  {
    name: "Custom Gifts",
    slug: "custom-gifts",
    href: "/custom-order",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80",
    bg: "bg-[#F8F0E9]",
    badge: "Special",
  },
];

export default function CategorySection() {
  return (
    <section className="py-14 sm:py-20 bg-[#FFFBF8]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header with floral flourishes */}
        <div className="text-center mb-10 space-y-2">
          <div className="flex items-center justify-center gap-3">
            <span className="text-[#A64D78] text-sm tracking-widest font-serif">❧</span>
            <span className="text-xs uppercase tracking-widest text-[#704568] font-bold">Curated Handcrafts</span>
            <span className="text-[#A64D78] text-sm tracking-widest font-serif">☙</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#43243F]">
            Shop by Category
          </h2>
          <div className="w-16 h-0.5 bg-[#A64D78]/40 mx-auto rounded-full mt-2" />
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={cat.href}
              className="group flex flex-col items-center p-3 rounded-2xl bg-white border border-[#E5DDE2]/70 hover:border-[#A64D78] shadow-xs hover:shadow-md transition-all duration-300"
            >
              <div
                className={`relative w-full aspect-square rounded-xl overflow-hidden mb-3 ${cat.bg} flex items-center justify-center`}
                style={{ position: "relative" }}
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-108 transition-transform duration-500"
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 15vw"
                />
                {cat.badge && (
                  <span className="absolute top-2 right-2 bg-[#A64D78] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                    {cat.badge}
                  </span>
                )}
              </div>
              <h3 className="font-medium text-xs sm:text-sm text-[#43243F] group-hover:text-[#A64D78] text-center transition flex items-center justify-center gap-0.5">
                <span>{cat.name}</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

