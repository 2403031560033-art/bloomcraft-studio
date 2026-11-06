"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Plus,
  MessageCircle,
} from "lucide-react";
import { InstagramIcon } from "@/components/ui/Icons";
import { formatPaise, getStatusColor } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/admin/reports/summary")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData(json.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-[#E5DDE2] rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 bg-[#E5DDE2]/60 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const {
    totalRevenuePaise = 0,
    activeOrders = 0,
    pendingRequests = 0,
    lowStockProducts = [],
    recentOrders = [],
    ordersBySource = [],
  } = data || {};

  return (
    <div className="space-y-8">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#43243F]">
            Studio Overview
          </h1>
          <p className="text-xs text-[#6F6670] mt-0.5">
            Real-time sales, order fulfilment pipeline, and custom inquiry queues.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders?newManual=true"
            className="px-4 py-2 bg-[#704568] hover:bg-[#43243F] text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Record DM Order</span>
          </Link>

          <Link
            href="/admin/products?newProduct=true"
            className="px-4 py-2 bg-white border border-[#E5DDE2] hover:border-[#A64D78] text-[#43243F] text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-[#A64D78]" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5DDE2] shadow-xs space-y-2">
          <div className="flex justify-between items-center text-[#6F6670]">
            <span className="text-xs font-medium">Total Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-[#28734D]/10 text-[#28734D] flex items-center justify-center">
              ₹
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-[#43243F]">
            {formatPaise(totalRevenuePaise)}
          </div>
          <span className="text-[11px] text-[#28734D] font-medium block">
            Verified across all sales channels
          </span>
        </div>

        {/* Active Production Orders */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5DDE2] shadow-xs space-y-2">
          <div className="flex justify-between items-center text-[#6F6670]">
            <span className="text-xs font-medium">Active In Production</span>
            <div className="w-8 h-8 rounded-lg bg-[#F6E4EC] text-[#704568] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-[#43243F]">
            {activeOrders}
          </div>
          <Link
            href="/admin/orders"
            className="text-[11px] text-[#704568] hover:underline font-medium block"
          >
            View dispatch queue →
          </Link>
        </div>

        {/* Pending Custom Inquiries */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5DDE2] shadow-xs space-y-2">
          <div className="flex justify-between items-center text-[#6F6670]">
            <span className="text-xs font-medium">Pending Custom Inquiries</span>
            <div className="w-8 h-8 rounded-lg bg-[#EEE9F7] text-[#704568] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#A64D78]" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-[#43243F]">
            {pendingRequests}
          </div>
          <Link
            href="/admin/custom-requests"
            className="text-[11px] text-[#A64D78] hover:underline font-medium block"
          >
            Review and quote requests →
          </Link>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5DDE2] shadow-xs space-y-2">
          <div className="flex justify-between items-center text-[#6F6670]">
            <span className="text-xs font-medium">Ready Stock Warnings</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-[#43243F]">
            {lowStockProducts.length}
          </div>
          <span className="text-[11px] text-amber-700 font-medium block">
            {lowStockProducts.length === 0 ? "Inventory healthy" : "Items with ≤ 3 units"}
          </span>
        </div>
      </div>

      {/* Orders by Channel breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E5DDE2] shadow-xs space-y-4">
          <h3 className="font-serif font-bold text-base text-[#43243F]">
            Sales by Channel
          </h3>
          <div className="space-y-3">
            {ordersBySource.length === 0 ? (
              <p className="text-xs text-[#6F6670]">No sales recorded yet.</p>
            ) : (
              ordersBySource.map((channel: any) => (
                <div
                  key={channel._id}
                  className="p-3 bg-[#FFFBF8] rounded-xl border border-[#E5DDE2] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 font-medium text-[#43243F]">
                    {channel._id === "INSTAGRAM" && <InstagramIcon className="w-3.5 h-3.5 text-pink-600" />}
                    {channel._id === "WHATSAPP" && <MessageCircle className="w-3.5 h-3.5 text-green-600" />}
                    <span>{channel._id}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#43243F]">{channel.count} orders</span>
                    <span className="text-[10px] text-[#6F6670] block">
                      {formatPaise(channel.revenuePaise)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E5DDE2] shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-serif font-bold text-base text-[#43243F]">
              Recent Orders
            </h3>
            <Link
              href="/admin/orders"
              className="text-xs font-medium text-[#704568] hover:underline"
            >
              View all orders →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFFBF8] text-[#6F6670] border-y border-[#E5DDE2]">
                <tr>
                  <th className="py-2.5 px-3">Order</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Channel</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-[#6F6670]">
                      No orders placed yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((o: any) => (
                    <tr key={o._id} className="hover:bg-[#FFFBF8]/80 transition">
                      <td className="py-3 px-3 font-mono font-bold text-[#704568]">
                        <Link href={`/admin/orders?orderId=${o._id}`}>
                          {o.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-3 font-medium text-[#43243F]">
                        {o.customerNameSnapshot}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-semibold uppercase">
                          {o.source}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getStatusColor(
                            o.orderStatus
                          )}`}
                        >
                          {o.orderStatus.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-[#43243F]">
                        {formatPaise(o.totalPaise)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
