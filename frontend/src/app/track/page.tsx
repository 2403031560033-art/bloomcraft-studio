"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Package, Clock, CheckCircle, Truck, AlertCircle, MapPin } from "lucide-react";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import { formatPaise } from "@/lib/utils";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get("orderNumber") || "";
  const initialPhone = searchParams.get("phone") || "";

  const [orderNumber, setOrderNumber] = useState(initialOrder);
  const [phone, setPhone] = useState(initialPhone);
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTracking = async (num: string, ph: string) => {
    if (!num.trim() || !ph.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/orders/track?orderNumber=${encodeURIComponent(num.trim())}&phone=${encodeURIComponent(ph.trim())}`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Order not found. Please verify the order number and phone.");
      }
      setOrderData(json.data);
    } catch (err: any) {
      setError(err.message || "Failed to locate order.");
      setOrderData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrder && initialPhone) {
      fetchTracking(initialOrder, initialPhone);
    }
  }, [initialOrder, initialPhone]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(orderNumber, phone);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-[#A64D78]">
          Real-Time Fulfilment Status
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#43243F]">
          Track Your Handmade Gift
        </h1>
        <p className="text-xs sm:text-sm text-[#6F6670]">
          Enter your Order Reference Number and the Mobile Number provided at checkout.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E5DDE2] shadow-xs mb-10 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#43243F] mb-1">
                Order Number
              </label>
              <input
                type="text"
                required
                placeholder="e.g. BC261105..."
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full text-xs p-3 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl focus:outline-none focus:border-[#A64D78] font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#43243F] mb-1">
                Phone Number (Used in order)
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs p-3 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl focus:outline-none focus:border-[#A64D78]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#704568] hover:bg-[#43243F] disabled:bg-gray-300 text-white text-xs font-semibold uppercase tracking-wider rounded-full shadow-md transition flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? "Searching Dispatch Records..." : "Track My Package"}</span>
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-[#A33D4A]/10 border border-[#A33D4A]/30 rounded-xl flex items-center gap-2 text-xs text-[#A33D4A]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Tracking Results View */}
      {orderData && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#E5DDE2] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-bold text-[#704568]">
                  #{orderData.orderNumber}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-[#F6E4EC] text-[#A64D78]">
                  {orderData.orderStatus.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-xs text-[#6F6670] mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#A64D78]" />
                <span>
                  Delivering to: {orderData.deliveryCity}, {orderData.deliveryState} - {orderData.deliveryPostalCode}
                </span>
              </p>
            </div>

            {orderData.trackingCarrier && orderData.trackingNumber && (
              <div className="bg-[#EEE9F7] p-3 rounded-2xl text-xs text-[#43243F]">
                <span className="text-[10px] uppercase font-bold text-[#704568] block">
                  Courier Tracking
                </span>
                <span className="font-semibold">{orderData.trackingCarrier}: </span>
                <span className="font-mono font-bold">{orderData.trackingNumber}</span>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E5DDE2] shadow-sm">
            <h3 className="font-serif font-bold text-lg text-[#43243F] mb-6">
              Production & Delivery Progress
            </h3>

            <div className="relative border-l-2 border-[#E5DDE2] ml-4 space-y-8 pb-4">
              {orderData.timeline?.map((step: any, idx: number) => (
                <div key={idx} className="relative pl-6">
                  {/* Step circle */}
                  <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-[#704568] border-2 border-white flex items-center justify-center text-white text-[10px]">
                    ✓
                  </div>

                  <div>
                    <span className="text-xs font-bold text-[#43243F] uppercase tracking-wide block">
                      {step.status.replace(/_/g, " ")}
                    </span>
                    <p className="text-xs text-[#6F6670] mt-0.5">{step.description}</p>
                    <span className="text-[10px] text-[#A64D78] mt-1 block">
                      {new Date(step.createdAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Items Summary in Safe View */}
          <div className="bg-white p-6 rounded-3xl border border-[#E5DDE2] shadow-sm">
            <h3 className="font-serif font-bold text-base text-[#43243F] mb-4">
              Items in this Shipment
            </h3>
            <div className="divide-y divide-gray-100 text-xs">
              {orderData.items?.map((item: any, idx: number) => (
                <div key={idx} className="py-3 flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-[#43243F]">{item.productName}</h4>
                    {item.variantName && (
                      <p className="text-[#6F6670]">Style: {item.variantName}</p>
                    )}
                    <p className="text-[#6F6670]">Quantity: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-[#43243F]">
                    {formatPaise(item.lineTotalPaise)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFBF8]">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-sm">Loading tracker...</div>}>
          <TrackOrderContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

