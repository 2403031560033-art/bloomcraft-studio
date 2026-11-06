"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, Phone, ShieldCheck, User, ArrowRight, AlertCircle, Heart } from "lucide-react";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";

function AccountLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";
  const initialTab = searchParams.get("tab") === "admin" ? "admin" : "customer";

  const [activeTab, setActiveTab] = useState<"customer" | "admin">(initialTab);

  // Customer form
  const [identifier, setIdentifier] = useState("");
  const [customerPassword, setCustomerPassword] = useState("");
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerError, setCustomerError] = useState<string | null>(null);

  // Admin form
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerError(null);
    setCustomerLoading(true);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password: customerPassword }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Invalid credentials");
      }

      window.location.href = redirectUrl;
    } catch (err: any) {
      setCustomerError(err.message || "Login failed");
    } finally {
      setCustomerLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setAdminLoading(true);

    try {
      const res = await fetch("/api/v1/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Invalid admin credentials");
      }

      window.location.href = "/admin";
    } catch (err: any) {
      setAdminError(err.message || "Admin login failed");
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16">
      <div className="bg-white rounded-3xl border border-[#E5DDE2] shadow-xl p-8 space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#F6E4EC] text-[#704568] flex items-center justify-center mx-auto text-xl shadow-xs">
            🌸
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#43243F]">
            Welcome to BloomCraft
          </h1>
          <p className="text-xs text-[#6F6670]">
            Sign in to access your orders, saved addresses, or manage the studio.
          </p>
        </div>

        {/* Tab switcher: Customer vs Studio Owner */}
        <div className="flex bg-[#FFFBF8] p-1 rounded-2xl border border-[#E5DDE2]">
          <button
            type="button"
            onClick={() => setActiveTab("customer")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === "customer"
                ? "bg-[#704568] text-white shadow-xs"
                : "text-[#6F6670] hover:text-[#43243F]"
            }`}
          >
            Customer Sign In
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("admin")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === "admin"
                ? "bg-[#43243F] text-white shadow-xs"
                : "text-[#6F6670] hover:text-[#43243F]"
            }`}
          >
            Studio Owner / Admin
          </button>
        </div>

        {/* CUSTOMER LOGIN TAB */}
        {activeTab === "customer" && (
          <form onSubmit={handleCustomerLogin} className="space-y-4">
            {customerError && (
              <div className="p-3 bg-[#A33D4A]/10 border border-[#A33D4A]/30 rounded-xl text-xs text-[#A33D4A] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{customerError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#43243F] mb-1">
                Phone Number or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. 9876543210 or name@example.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full text-xs p-3 pl-9 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl focus:outline-none focus:border-[#A64D78]"
                />
                <User className="w-4 h-4 text-[#6F6670] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#43243F] mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={customerPassword}
                  onChange={(e) => setCustomerPassword(e.target.value)}
                  className="w-full text-xs p-3 pl-9 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl focus:outline-none focus:border-[#A64D78]"
                />
                <Lock className="w-4 h-4 text-[#6F6670] absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={customerLoading}
              className="w-full py-3.5 bg-[#704568] hover:bg-[#43243F] disabled:bg-gray-300 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <span>{customerLoading ? "Signing In..." : "Sign In to My Account"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2 text-xs text-[#6F6670] space-y-2">
              <p>
                Don&apos;t have an account yet?{" "}
                <Link href="/account/register" className="font-bold text-[#A64D78] hover:underline">
                  Create Account
                </Link>
              </p>
              <p>
                Just tracking an existing order?{" "}
                <Link href="/track" className="font-medium text-[#704568] hover:underline">
                  Guest Order Tracker →
                </Link>
              </p>
            </div>
          </form>
        )}

        {/* STUDIO OWNER LOGIN TAB */}
        {activeTab === "admin" && (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            {adminError && (
              <div className="p-3 bg-[#A33D4A]/10 border border-[#A33D4A]/30 rounded-xl text-xs text-[#A33D4A] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{adminError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#43243F] mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="Enter admin email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full text-xs p-3 pl-9 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl focus:outline-none focus:border-[#A64D78]"
                />
                <Mail className="w-4 h-4 text-[#6F6670] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#43243F] mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full text-xs p-3 pl-9 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl focus:outline-none focus:border-[#A64D78]"
                />
                <Lock className="w-4 h-4 text-[#6F6670] absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={adminLoading}
              className="w-full py-3.5 bg-[#43243F] hover:bg-[#261F26] disabled:bg-gray-300 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{adminLoading ? "Authenticating..." : "Access Owner Dashboard"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AccountLoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFBF8]">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-sm">Loading sign-in portal...</div>}>
          <AccountLoginContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

