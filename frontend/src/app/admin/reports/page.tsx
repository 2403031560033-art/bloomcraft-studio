"use client";

import React, { useEffect, useState } from "react";
import { Download, BarChart3, TrendingUp, ShoppingBag, DollarSign } from "lucide-react";
import { formatPaise } from "@/lib/utils";

export default function AdminReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/admin/reports/summary")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalOrders = data?.totalOrders || 0;
  const totalRevenuePaise = data?.totalRevenuePaise || 0;
  const aovPaise = totalOrders > 0 ? Math.round(totalRevenuePaise / totalOrders) : 0;

  return (
    <div className="space-y-8">
      {/* Title & Download CSV CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#43243F]">
            Reports & CSV Export
          </h1>
          <p className="text-xs text-[#6F6670] mt-0.5">
            Download raw order histories, review sales metrics, and analyze channel performance.
          </p>
        </div>

        <a
          href="/api/v1/admin/reports/orders.csv"
          download
          className="px-5 py-2.5 bg-[#28734D] hover:bg-green-800 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Orders to CSV</span>
        </a>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E5DDE2] shadow-xs space-y-2">
          <span className="text-xs text-[#6F6670] font-medium">Gross Revenue</span>
          <div className="text-3xl font-serif font-bold text-[#43243F]">
            {formatPaise(totalRevenuePaise)}
          </div>
          <span className="text-[11px] text-[#28734D] font-medium block">
            Paid & Confirmed Orders
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E5DDE2] shadow-xs space-y-2">
          <span className="text-xs text-[#6F6670] font-medium">Total Orders Fulfilled</span>
          <div className="text-3xl font-serif font-bold text-[#43243F]">
            {totalOrders}
          </div>
          <span className="text-[11px] text-[#6F6670] block">
            Across Storefront & Social DMs
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E5DDE2] shadow-xs space-y-2">
          <span className="text-xs text-[#6F6670] font-medium">Average Order Value (AOV)</span>
          <div className="text-3xl font-serif font-bold text-[#704568]">
            {formatPaise(aovPaise)}
          </div>
          <span className="text-[11px] text-[#6F6670] block">
            Calculated per transaction
          </span>
        </div>
      </div>

      {/* Channel Breakdown Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5DDE2] shadow-xs space-y-4">
        <h3 className="font-serif font-bold text-lg text-[#43243F]">
          Sales Distribution by Channel
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {["WEBSITE", "INSTAGRAM", "WHATSAPP", "MANUAL"].map((channel) => {
            const match = data?.ordersBySource?.find((s: any) => s._id === channel);
            return (
              <div
                key={channel}
                className="p-4 bg-[#FFFBF8] rounded-xl border border-[#E5DDE2] space-y-1 text-xs"
              >
                <span className="font-bold text-[#704568] uppercase text-[10px] block">
                  {channel}
                </span>
                <div className="text-lg font-bold text-[#43243F]">
                  {match ? match.count : 0} orders
                </div>
                <div className="text-[11px] text-[#6F6670]">
                  {formatPaise(match?.revenuePaise || 0)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

