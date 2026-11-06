import React from "react";
import Link from "next/link";
import { Mail, MapPin, Heart } from "lucide-react";
import { InstagramIcon } from "@/components/ui/Icons";

export default function Footer() {
  return (
    <footer className="bg-[#43243F] text-[#FFFBF8] pt-14 pb-8 border-t border-[#704568]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#704568]/60">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌸</span>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                BloomCraft Studio
              </span>
            </div>
            <p className="text-xs text-[#F6E4EC]/80 leading-relaxed font-sans">
              Handcrafted crochet bouquets, vibrant festive torans, and personalised gifts crafted with patience and love in Jhansi, Uttar Pradesh.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#F6E4EC]/70">
              <MapPin className="w-3.5 h-3.5 text-[#A64D78]" />
              <span>Jhansi, India</span>
            </div>
          </div>

          {/* Shop Links */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm tracking-wide text-white uppercase">
              Shop Collections
            </h4>
            <ul className="space-y-2 text-xs text-[#F6E4EC]/80">
              <li>
                <Link href="/shop" className="hover:text-white transition">
                  All Handmade Items
                </Link>
              </li>
              <li>
                <Link href="/shop?category=bouquets" className="hover:text-white transition">
                  Crochet Bouquets
                </Link>
              </li>
              <li>
                <Link href="/shop?category=flower-pots" className="hover:text-white transition">
                  Mini Flower Pots
                </Link>
              </li>
              <li>
                <Link href="/shop?category=keychains" className="hover:text-white transition">
                  Floral Keychains
                </Link>
              </li>
              <li>
                <Link href="/shop?category=toran-wall-hangings" className="hover:text-white transition">
                  Torans & Wall Hangings
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Policies */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm tracking-wide text-white uppercase">
              Help & Support
            </h4>
            <ul className="space-y-2 text-xs text-[#F6E4EC]/80">
              <li>
                <Link href="/track" className="hover:text-white font-medium text-[#F6E4EC] transition">
                  🔍 Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/custom-order" className="hover:text-white transition">
                  Request Custom Order
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white transition">
                  Shipping & Pan-India Dispatch
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white transition">
                  Returns & Replacements
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect & Instagram */}
          <div className="space-y-4">
            <h4 className="font-serif font-bold text-sm tracking-wide text-white uppercase">
              Stay Connected
            </h4>
            <p className="text-xs text-[#F6E4EC]/80">
              Follow our daily craft journey, behind-the-scenes, and newest flower drop on Instagram.
            </p>
            <div className="space-y-2">
              <a
                href="https://www.instagram.com/bloomcraftstudio_"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-[#F6E4EC] hover:text-white transition group"
              >
                <div className="p-1.5 rounded-full bg-[#704568] group-hover:bg-[#A64D78] transition">
                  <InstagramIcon className="w-4 h-4 text-white" />
                </div>
                <span>@bloomcraftstudio_</span>
              </a>

              <a
                href="mailto:bloomcraftstudio@gmail.com"
                className="flex items-center gap-2 text-xs text-[#F6E4EC] hover:text-white transition group"
              >
                <div className="p-1.5 rounded-full bg-[#704568] group-hover:bg-[#A64D78] transition">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <span>bloomcraftstudio@gmail.com</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright & Admin portal link */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F6E4EC]/60">
          <p className="flex items-center gap-1">
            © {new Date().getFullYear()} BloomCraft Studio. Crafted with{" "}
            <Heart className="w-3 h-3 text-[#A64D78] fill-[#A64D78]" /> in Jhansi, India.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-white transition">
              Our Story
            </Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-white transition">
              Contact
            </Link>
            <span>•</span>
            <Link href="/admin/login" className="text-[#A64D78] hover:text-white transition font-medium">
              Owner Dashboard →
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
