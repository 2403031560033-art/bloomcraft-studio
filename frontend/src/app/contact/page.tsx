import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, MessageCircle, Clock } from "lucide-react";
import { InstagramIcon } from "@/components/ui/Icons";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFBF8]">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#43243F]">
            Get in Touch
          </h1>
          <p className="text-sm text-[#6F6670]">
            Have a question about an order, urgent custom requirement, or collaboration? Soni and the BloomCraft team are here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Details Card */}
          <div className="bg-white p-8 rounded-3xl border border-[#E5DDE2] shadow-xs space-y-6">
            <h2 className="font-serif font-bold text-xl text-[#43243F]">Studio Information</h2>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#A64D78] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#43243F] block">Studio Location</span>
                  <span className="text-[#6F6670]">Jhansi, Uttar Pradesh, India</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <InstagramIcon className="w-5 h-5 text-[#A64D78] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#43243F] block">Instagram DM</span>
                  <a
                    href="https://www.instagram.com/bloomcraftstudio_"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#704568] hover:underline"
                  >
                    @bloomcraftstudio_
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#A64D78] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#43243F] block">Support Email</span>
                  <a href="mailto:bloomcraftstudio@gmail.com" className="text-[#704568] hover:underline">
                    bloomcraftstudio@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#A64D78] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#43243F] block">Working Hours</span>
                  <span className="text-[#6F6670]">Monday to Saturday: 10:00 AM – 7:00 PM IST</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick FAQ / Custom Request Direct Link */}
          <div className="bg-[#F6E4EC]/40 p-8 rounded-3xl border border-[#E5DDE2] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-xl text-[#43243F]">Looking to order a custom gift?</h3>
              <p className="text-xs sm:text-sm text-[#6F6670] leading-relaxed">
                Rather than waiting for manual DM replies, you can submit your budget, preferred colors, and inspiration picture directly through our custom commission portal.
              </p>
            </div>

            <Link
              href="/custom-order"
              className="w-full py-3.5 bg-[#704568] hover:bg-[#43243F] text-white text-xs font-semibold uppercase tracking-wider rounded-full shadow-md text-center transition"
            >
              Start Custom Gift Request →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
