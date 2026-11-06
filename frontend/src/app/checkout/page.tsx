"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, Truck, CreditCard, Banknote, AlertCircle } from "lucide-react";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import { useCart } from "@/context/CartContext";
import { formatPaise, INDIAN_STATES } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotalPaise, clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loggedInCustomer, setLoggedInCustomer] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerNote: "",
    recipientName: "",
    phoneE164: "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "",
    state: "Uttar Pradesh",
    postalCode: "",
    paymentMethod: "ONLINE",
  });

  // Auto-populate customer info if logged in
  React.useEffect(() => {
    fetch("/api/v1/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.type === "CUSTOMER" && data.data) {
          const c = data.data;
          setLoggedInCustomer(c);
          const defaultAddr = c.addresses?.find((a: any) => a.isDefault) || c.addresses?.[0];
          setFormData((prev) => ({
            ...prev,
            customerName: c.name || prev.customerName,
            customerPhone: c.phone || prev.customerPhone,
            customerEmail: c.email || prev.customerEmail,
            recipientName: defaultAddr?.recipientName || c.name || prev.recipientName,
            phoneE164: defaultAddr?.phoneE164 || c.phone || prev.phoneE164,
            addressLine1: defaultAddr?.addressLine1 || prev.addressLine1,
            addressLine2: defaultAddr?.addressLine2 || prev.addressLine2,
            landmark: defaultAddr?.landmark || prev.landmark,
            city: defaultAddr?.city || prev.city,
            state: defaultAddr?.state || prev.state,
            postalCode: defaultAddr?.postalCode || prev.postalCode,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // sync recipient details if empty
      ...(name === "customerName" && !prev.recipientName ? { recipientName: value } : {}),
      ...(name === "customerPhone" && !prev.phoneE164 ? { phoneE164: value } : {}),
    }));
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError("Your cart is empty. Please add handcrafted gifts before checkout.");
      return;
    }

    if (!formData.customerPhone.match(/^(\+91)?[6-9]\d{9}$/)) {
      setError("Please provide a valid 10-digit Indian mobile number.");
      return;
    }

    if (!formData.postalCode.match(/^[1-9][0-9]{5}$/)) {
      setError("Please enter a valid 6-digit Indian PIN code.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail || undefined,
        customerNote: formData.customerNote || undefined,
        shippingAddress: {
          recipientName: formData.recipientName || formData.customerName,
          phoneE164: formData.phoneE164 || formData.customerPhone,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2 || undefined,
          landmark: formData.landmark || undefined,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          countryCode: "IN",
        },
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          personalisation: item.personalisation,
        })),
        paymentMethod: formData.paymentMethod,
      };

      const res = await fetch("/api/v1/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error?.message || "Checkout failed. Please review your details.");
      }

      clearCart();
      router.push(`/order-confirmed?orderNumber=${result.data.orderNumber}&phone=${formData.customerPhone}`);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during checkout.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFFBF8]">
        <Header />
        <main className="flex-1 max-w-xl mx-auto px-4 py-20 text-center space-y-4">
          <span className="text-5xl">🛍️</span>
          <h1 className="font-serif text-2xl font-bold text-[#43243F]">Your Basket is Empty</h1>
          <p className="text-sm text-[#6F6670]">Add some thoughtful handmade creations before checkout.</p>
          <Link
            href="/shop"
            className="inline-block px-8 py-3 bg-[#704568] text-white text-xs font-semibold rounded-full hover:bg-[#43243F]"
          >
            Browse Products
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFBF8]">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-6">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs text-[#6F6670] hover:text-[#43243F] transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </Link>
          <h1 className="font-serif text-3xl font-bold text-[#43243F] mt-2">
            Guest Checkout
          </h1>
          <p className="text-xs text-[#6F6670]">No account required. Fast and safe direct ordering.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#A33D4A]/10 border border-[#A33D4A]/30 rounded-2xl flex items-center gap-3 text-xs text-[#A33D4A]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleCheckoutSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Customer & Delivery Address Form */}
            <div className="lg:col-span-7 space-y-8">
              {/* 1. Contact Information */}
              <div className="bg-white p-6 rounded-2xl border border-[#E5DDE2]/80 shadow-xs space-y-4">
                <h2 className="font-serif font-bold text-lg text-[#43243F] border-b border-gray-100 pb-2">
                  1. Contact Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#43243F] mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      required
                      placeholder="e.g. Soni Verma"
                      value={formData.customerName}
                      onChange={handleChange}
                      className="w-full text-xs p-2.5 bg-white border border-[#E5DDE2] rounded-xl focus:outline-none focus:border-[#A64D78]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#43243F] mb-1">
                      Phone Number (WhatsApp preferred) *
                    </label>
                    <input
                      type="tel"
                      name="customerPhone"
                      required
                      placeholder="e.g. 9876543210"
                      value={formData.customerPhone}
                      onChange={handleChange}
                      className="w-full text-xs p-2.5 bg-white border border-[#E5DDE2] rounded-xl focus:outline-none focus:border-[#A64D78]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#43243F] mb-1">
                      Email Address (Optional, for tracking receipts)
                    </label>
                    <input
                      type="email"
                      name="customerEmail"
                      placeholder="e.g. name@example.com"
                      value={formData.customerEmail}
                      onChange={handleChange}
                      className="w-full text-xs p-2.5 bg-white border border-[#E5DDE2] rounded-xl focus:outline-none focus:border-[#A64D78]"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Indian Delivery Address */}
              <div className="bg-white p-6 rounded-2xl border border-[#E5DDE2]/80 shadow-xs space-y-4">
                <h2 className="font-serif font-bold text-lg text-[#43243F] border-b border-gray-100 pb-2">
                  2. Indian Delivery Address
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#43243F] mb-1">
                      Flat, House no., Building, Street Address *
                    </label>
                    <input
                      type="text"
                      name="addressLine1"
                      required
                      placeholder="e.g. 142/B, Civil Lines, Near Sadar Bazaar"
                      value={formData.addressLine1}
                      onChange={handleChange}
                      className="w-full text-xs p-2.5 bg-white border border-[#E5DDE2] rounded-xl focus:outline-none focus:border-[#A64D78]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#43243F] mb-1">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      name="landmark"
                      placeholder="e.g. Opposite Rani Mahal"
                      value={formData.landmark}
                      onChange={handleChange}
                      className="w-full text-xs p-2.5 bg-white border border-[#E5DDE2] rounded-xl focus:outline-none focus:border-[#A64D78]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#43243F] mb-1">
                      PIN Code (6 Digits) *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      required
                      maxLength={6}
                      placeholder="e.g. 284001"
                      value={formData.postalCode}
                      onChange={handleChange}
                      className="w-full text-xs p-2.5 bg-white border border-[#E5DDE2] rounded-xl focus:outline-none focus:border-[#A64D78]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#43243F] mb-1">
                      City / District *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      placeholder="e.g. Jhansi"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full text-xs p-2.5 bg-white border border-[#E5DDE2] rounded-xl focus:outline-none focus:border-[#A64D78]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#43243F] mb-1">
                      State *
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full text-xs p-2.5 bg-white border border-[#E5DDE2] rounded-xl focus:outline-none focus:border-[#A64D78]"
                    >
                      {INDIAN_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#43243F] mb-1">
                      Gift Note / Special Delivery Instructions (Optional)
                    </label>
                    <textarea
                      name="customerNote"
                      rows={2}
                      placeholder="e.g. Please add a birthday note card saying 'Happy 25th Birthday Priya!'"
                      value={formData.customerNote}
                      onChange={handleChange}
                      className="w-full text-xs p-2.5 bg-white border border-[#E5DDE2] rounded-xl focus:outline-none focus:border-[#A64D78]"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Payment Method */}
              <div className="bg-white p-6 rounded-2xl border border-[#E5DDE2]/80 shadow-xs space-y-4">
                <h2 className="font-serif font-bold text-lg text-[#43243F] border-b border-gray-100 pb-2">
                  3. Payment Method
                </h2>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3.5 rounded-xl border border-[#704568] bg-[#F6E4EC]/30 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="ONLINE"
                      checked={formData.paymentMethod === "ONLINE"}
                      onChange={handleChange}
                      className="accent-[#704568] mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#704568]" />
                        <span className="text-xs font-bold text-[#43243F]">
                          Online Payment (UPI, Cards, NetBanking)
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6F6670] mt-0.5">
                        Instant confirmation. Ready for Razorpay merchant gateway integration.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-xl border border-[#E5DDE2] bg-white hover:border-[#A64D78] cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={formData.paymentMethod === "COD"}
                      onChange={handleChange}
                      className="accent-[#704568] mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-[#704568]" />
                        <span className="text-xs font-bold text-[#43243F]">
                          Cash on Delivery (COD) / Direct UPI on Delivery
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6F6670] mt-0.5">
                        Subject to availability in your PIN code.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5">
              <div className="sticky top-24 bg-white p-6 rounded-2xl border border-[#E5DDE2] shadow-sm space-y-6">
                <h3 className="font-serif font-bold text-lg text-[#43243F] border-b border-gray-100 pb-2">
                  Order Summary
                </h3>

                {/* Items List */}
                <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 text-xs">
                      <div
                        className="w-14 h-14 rounded-lg overflow-hidden bg-[#F8F0E9] relative shrink-0"
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
                          <div className="w-full h-full flex items-center justify-center">🌸</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-[#43243F] line-clamp-1">{item.productName}</h4>
                        <p className="text-[11px] text-[#6F6670]">Qty: {item.quantity}</p>
                        {item.personalisation && Object.keys(item.personalisation).length > 0 && (
                          <p className="text-[10px] text-[#A64D78] truncate">
                            {Object.values(item.personalisation).join(", ")}
                          </p>
                        )}
                      </div>
                      <div className="font-bold text-[#43243F]">
                        {formatPaise(item.pricePaise * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotals & Server calculation info */}
                <div className="border-t border-[#E5DDE2] pt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-[#6F6670]">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-[#43243F]">{formatPaise(subtotalPaise)}</span>
                  </div>
                  <div className="flex justify-between text-[#6F6670]">
                    <span>Pan-India Delivery</span>
                    <span className="text-[#28734D] font-semibold">FREE (Promotional)</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-[#43243F] pt-2 border-t border-gray-100">
                    <span>Total Amount</span>
                    <span className="text-[#704568]">{formatPaise(subtotalPaise)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#704568] hover:bg-[#43243F] disabled:bg-gray-300 text-white font-medium rounded-full shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Placing Your Order...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Confirm & Place Order</span>
                    </>
                  )}
                </button>

                <div className="text-[11px] text-[#6F6670] text-center space-y-1">
                  <p>🔒 256-bit Secure checkout • Server verified prices</p>
                  <p>You will receive an order confirmation & SMS/WhatsApp notification.</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}

