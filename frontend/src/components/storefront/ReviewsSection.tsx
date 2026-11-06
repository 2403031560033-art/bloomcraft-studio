import React from "react";
import Image from "next/image";
import { Star } from "lucide-react";

const REVIEWS = [
  {
    name: "Aditi S.",
    location: "Verified Patron (Placeholder)",
    text: "“Absolutely beautiful and so neatly handmade! The crochet bouquet was beyond my expectations. 🌸”",
    avatar: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=150&q=80",
    rating: 5,
  },
  {
    name: "Riya M.",
    location: "Verified Patron (Placeholder)",
    text: "“The quality and detailing are amazing. Perfect for anniversary gifting and never withers!”",
    avatar: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=150&q=80",
    rating: 5,
  },
  {
    name: "Neha K.",
    location: "Verified Patron (Placeholder)",
    text: "“Loved the custom order! Exactly how I imagined, with so much care, neat packaging, and creativity. ✨”",
    avatar: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=150&q=80",
    rating: 5,
  },
];

export default function ReviewsSection() {
  return (
    <section className="py-14 sm:py-20 bg-[#FFFBF8] border-t border-[#E5DDE2]/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-12 space-y-2">
          <div className="flex items-center justify-center gap-3">
            <span className="text-[#A64D78] text-sm font-serif">❧</span>
            <span className="text-xs uppercase tracking-widest text-[#704568] font-bold">Community Love</span>
            <span className="text-[#A64D78] text-sm font-serif">☙</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#43243F]">
            What Our Customers Say
          </h2>
          <div className="w-16 h-0.5 bg-[#A64D78]/40 mx-auto rounded-full mt-2" />
          <p className="text-[11px] text-[#6F6670]/70 italic mt-1">
            * Sample preview testimonials — genuine buyer feedback can be connected via Admin dashboard
          </p>
        </div>

        {/* Reviews Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((review, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white border border-[#E5DDE2]/70 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-[#94631D]">
                  {[...Array(review.rating)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-[#261F26] leading-relaxed italic font-serif">
                  {review.text}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 mt-4 border-t border-gray-100">
                <div
                  className="w-10 h-10 rounded-full overflow-hidden bg-[#F6E4EC] relative shrink-0"
                  style={{ position: "relative" }}
                >
                  <Image
                    src={review.avatar}
                    alt={review.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium text-xs text-[#43243F]">{review.name}</h4>
                  <p className="text-[10px] text-[#6F6670]">{review.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

