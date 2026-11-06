"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, ShieldCheck, AlertCircle, User, ArrowLeft, Store } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/v1/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Invalid credentials");
      }

      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#FFFBF8] to-[#F6E4EC]/40 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#E5DDE2] shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#704568] text-white flex items-center justify-center mx-auto text-xl shadow-md">
            🌸
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#43243F]">
            BloomCraft Studio Admin
          </h1>
          <p className="text-xs text-[#6F6670]">
            Secure owner & manager access portal
          </p>
        </div>

        {error && (
          <div className="p-3 bg-[#A33D4A]/10 border border-[#A33D4A]/30 rounded-xl flex items-center gap-2 text-xs text-[#A33D4A]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#43243F] mb-1">
              Admin Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="Enter admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs p-3 pl-9 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl focus:outline-none focus:border-[#A64D78]"
              />
              <Lock className="w-4 h-4 text-[#6F6670] absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#704568] hover:bg-[#43243F] disabled:bg-gray-300 text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{loading ? "Authenticating..." : "Sign In to Studio"}</span>
          </button>
        </form>

        {/* CUSTOMER LOGIN & STOREFRONT SWITCHER */}
        <div className="pt-4 border-t border-[#E5DDE2] space-y-3 text-center text-xs">
          <p className="text-[11px] text-[#6F6670]">
            Looking for your orders or patron account?
          </p>
          <Link
            href="/account/login"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-[#A64D78] bg-[#F6E4EC]/40 hover:bg-[#F6E4EC] text-[#704568] font-bold transition shadow-2xs"
          >
            <User className="w-4 h-4 text-[#A64D78]" />
            <span>Sign In as Customer / Patron →</span>
          </Link>

          <div className="flex items-center justify-between text-[11px] text-[#6F6670] pt-1">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 hover:text-[#43243F] font-medium transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Storefront</span>
            </Link>
            <Link
              href="/account/register"
              className="hover:text-[#A64D78] font-semibold transition"
            >
              Create Customer Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

