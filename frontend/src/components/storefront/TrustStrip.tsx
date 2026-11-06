import React from "react";
import { Sparkles, Gift, Truck, ShieldCheck, HeartHandshake } from "lucide-react";

const TRUST_ITEMS = [
  {
    icon: Sparkles,
    title: "100% Handmade",
    subtitle: "& Unique Art",
  },
  {
    icon: Gift,
    title: "Custom Orders",
    subtitle: "Tailored to Occasion",
  },
  {
    icon: Truck,
    title: "Pan-India Delivery",
    subtitle: "Safely Packed",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    subtitle: "Verified & Encrypted",
  },
  {
    icon: HeartHandshake,
    title: "Thoughtful Packaging",
    subtitle: "Ready for Gifting",
  },
];

export default function TrustStrip() {
  return (
    <section className="py-8 bg-[#F6E4EC]/40 border-y border-[#E5DDE2]/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
          {TRUST_ITEMS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex flex-col items-center space-y-1.5">
                <div className="w-10 h-10 rounded-full bg-white border border-[#E5DDE2] flex items-center justify-center text-[#704568] shadow-xs">
                  <Icon className="w-5 h-5 text-[#A64D78]" />
                </div>
                <h4 className="text-xs font-bold text-[#43243F]">{item.title}</h4>
                <p className="text-[11px] text-[#6F6670]">{item.subtitle}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

