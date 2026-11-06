"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Package, MapPin, LogOut, Truck, ShoppingBag, Clock, ShieldCheck, ArrowRight } from "lucide-react";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import { formatPaise, getStatusColor } from "@/lib/utils";

export default function AccountDashboardPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "profile">("orders");

  useEffect(() => {
    // 1. Fetch current customer
    fetch("/api/v1/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.type === "CUSTOMER") {
          setCustomer(data.data);
          // 2. Fetch customer orders
          return fetch("/api/v1/customer/orders")
            .then((res) => res.json())
            .then((orderData) => {
              if (orderData.success) {
                setOrders(orderData.data);
              }
            });
        } else if (data.success && data.type === "ADMIN") {
          // If admin, redirect to admin dashboard
          router.push("/admin");
        } else {
          router.push("/account/login");
        }
      })
      .catch(() => {
        router.push("/account/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFFBF8]">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#704568] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#6F6670]">Loading your BloomCraft account...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFBF8]">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full space-y-8">
        {/* Welcome Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E5DDE2] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#F6E4EC] text-[#704568] flex items-center justify-center text-2xl font-serif font-bold shadow-xs">
              {customer?.name?.charAt(0) || "B"}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#A64D78] tracking-wider">
                Patron Account
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#43243F]">
                Namaste, {customer?.name}!
              </h1>
              <p className="text-xs text-[#6F6670] mt-0.5">
                {customer?.phone} {customer?.email ? `• ${customer.email}` : ""}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-[#FFFBF8] border border-[#E5DDE2] hover:bg-[#A33D4A]/10 hover:border-[#A33D4A]/30 text-[#A33D4A] text-xs font-semibold rounded-full transition flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-4 border-b border-[#E5DDE2] pb-1">
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-3 text-sm font-bold transition flex items-center gap-2 border-b-2 ${
              activeTab === "orders"
                ? "border-[#704568] text-[#43243F]"
                : "border-transparent text-[#6F6670] hover:text-[#43243F]"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Orders ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-3 text-sm font-bold transition flex items-center gap-2 border-b-2 ${
              activeTab === "profile"
                ? "border-[#704568] text-[#43243F]"
                : "border-transparent text-[#6F6670] hover:text-[#43243F]"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Addresses</span>
          </button>
        </div>

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-[#E5DDE2] text-center space-y-4">
                <span className="text-5xl">🛍️</span>
                <h3 className="font-serif text-xl font-bold text-[#43243F]">No Orders Placed Yet</h3>
                <p className="text-xs text-[#6F6670] max-w-sm mx-auto">
                  Explore our handcrafted bouquets, crochet pots, and keychains to begin your gift journey!
                </p>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#704568] text-white text-xs font-bold rounded-full hover:bg-[#43243F]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Start Shopping</span>
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white p-6 rounded-3xl border border-[#E5DDE2] shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-gray-100 pb-3 text-xs">
                    <div>
                      <span className="font-mono font-bold text-sm text-[#704568]">
                        #{order.orderNumber}
                      </span>
                      <span className="text-[#6F6670] ml-3">
                        Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${getStatusColor(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus.replace(/_/g, " ")}
                      </span>
                      <Link
                        href={`/track?orderNumber=${order.orderNumber}&phone=${encodeURIComponent(
                          order.customerPhoneSnapshot
                        )}`}
                        className="px-3 py-1 bg-[#F6E4EC] hover:bg-[#704568] text-[#704568] hover:text-white rounded-full font-semibold transition flex items-center gap-1 text-[11px]"
                      >
                        <Truck className="w-3 h-3" />
                        <span>Live Tracking</span>
                      </Link>
                    </div>
                  </div>

                  {/* Items in this order */}
                  <div className="divide-y divide-gray-100 text-xs">
                    {order.items?.map((item: any, i: number) => (
                      <div key={i} className="py-2.5 flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-[#43243F]">{item.productNameSnapshot}</h4>
                          {item.variantSnapshot && (
                            <p className="text-[11px] text-[#6F6670]">Style: {item.variantSnapshot.name}</p>
                          )}
                          <p className="text-[11px] text-[#6F6670]">Qty: {item.quantity}</p>
                        </div>
                        <span className="font-bold text-[#43243F]">
                          {formatPaise(item.lineTotalPaise)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-100 text-xs">
                    <span className="text-[#6F6670]">
                      Delivery to: {order.shippingAddressSnapshot?.city}, {order.shippingAddressSnapshot?.state}
                    </span>
                    <span className="font-serif font-bold text-base text-[#43243F]">
                      Total: {formatPaise(order.totalPaise)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-[#E5DDE2] shadow-xs space-y-4 text-xs">
              <h3 className="font-serif font-bold text-base text-[#43243F] border-b pb-2">
                Personal Information
              </h3>
              <div>
                <span className="text-[#6F6670] block">Full Name</span>
                <span className="font-bold text-sm text-[#43243F]">{customer?.name}</span>
              </div>
              <div>
                <span className="text-[#6F6670] block">Mobile Number</span>
                <span className="font-bold text-sm text-[#43243F]">{customer?.phone}</span>
              </div>
              <div>
                <span className="text-[#6F6670] block">Email Address</span>
                <span className="font-bold text-sm text-[#43243F]">
                  {customer?.email || "Not specified"}
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#E5DDE2] shadow-xs space-y-4 text-xs">
              <h3 className="font-serif font-bold text-base text-[#43243F] border-b pb-2">
                Saved Delivery Addresses
              </h3>
              {customer?.addresses && customer.addresses.length > 0 ? (
                <div className="space-y-3">
                  {customer.addresses.map((addr: any, i: number) => (
                    <div key={i} className="p-3 bg-[#FFFBF8] rounded-xl border border-[#E5DDE2]">
                      <span className="font-bold block">{addr.recipientName}</span>
                      <p className="text-[#6F6670]">{addr.addressLine1}</p>
                      <p className="text-[#6F6670]">
                        {addr.city}, {addr.state} - {addr.postalCode}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#6F6670]">
                  Addresses are automatically saved here whenever you place an order!
                </p>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

