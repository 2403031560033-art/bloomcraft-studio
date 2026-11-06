"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPaise } from "@/lib/utils";

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeItem, subtotalPaise } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FFFBF8] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#E5DDE2] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#704568]" />
              <h2 className="font-serif text-lg font-bold text-[#43243F]">Your Gift Basket</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#F6E4EC] text-[#A64D78]">
                {items.reduce((s, i) => s + i.quantity, 0)} items
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-[#6F6670] hover:text-[#43243F] hover:bg-[#F6E4EC] rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#F6E4EC] flex items-center justify-center text-3xl">
                  🌸
                </div>
                <h3 className="font-serif text-lg text-[#43243F] font-semibold">Your basket is empty</h3>
                <p className="text-sm text-[#6F6670] max-w-xs mx-auto">
                  Handcrafted crochet bouquets, pots and personalized gifts are waiting for you!
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="inline-block mt-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#704568] rounded-full hover:bg-[#43243F] transition"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 bg-white border border-[#E5DDE2]/70 rounded-xl shadow-xs"
                >
                  <div
                    className="w-20 h-20 rounded-lg overflow-hidden bg-[#F8F0E9] relative shrink-0"
                    style={{ position: "relative" }}
                  >
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">🌸</div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="font-medium text-sm text-[#43243F] line-clamp-1">
                          {item.productName}
                        </h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-[#6F6670] hover:text-[#A33D4A] p-1 transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {item.variantName && (
                        <p className="text-xs text-[#6F6670] mt-0.5">Style: {item.variantName}</p>
                      )}

                      {item.personalisation && Object.keys(item.personalisation).length > 0 && (
                        <div className="text-[11px] text-[#A64D78] bg-[#F6E4EC]/60 px-2 py-0.5 rounded mt-1 line-clamp-1">
                          Custom: {Object.values(item.personalisation).join(", ")}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center border border-[#E5DDE2] rounded-full bg-[#FFFBF8]">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:text-[#A64D78] transition"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-[#261F26]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:text-[#A64D78] transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-[#43243F]">
                          {formatPaise(item.pricePaise * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-6 bg-white border-t border-[#E5DDE2] space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#6F6670]">Subtotal</span>
                <span className="font-bold text-[#43243F] text-base">{formatPaise(subtotalPaise)}</span>
              </div>
              <p className="text-[11px] text-[#6F6670] bg-[#FFFBF8] p-2 rounded-lg border border-[#E5DDE2]/60">
                🌱 Shipping & delivery calculated accurately at checkout based on Indian PIN code.
              </p>

              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full py-3.5 bg-[#704568] hover:bg-[#43243F] text-white font-medium rounded-full flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition group"
              >
                <span>Proceed to Guest Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

