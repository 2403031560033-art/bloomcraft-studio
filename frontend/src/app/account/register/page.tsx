"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, Phone, Mail, Lock, ArrowRight, AlertCircle, Sparkles } from "lucide-react";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";

export default function AccountRegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!formData.phone.match(/^(\+91)?[6-9]\d{9}$/)) {
      setError("Please enter a valid 10-digit Indian phone number.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email || undefined,
          password: formData.password,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Registration failed");
      }

      window.location.href = "/account";
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFBF8]">
      <Header />
      <main className="flex-1 max-w-md mx-auto px-4 py-12 sm:py-16 w-full">
        <div className="bg-white rounded-3xl border border-[#E5DDE2] shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F6E4EC] text-[#A64D78] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Join BloomCraft Studio</span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#43243F]">
              Create Your Account
            </h1>
            <p className="text-xs text-[#6F6670]">
              Save delivery addresses, track handcrafted orders, and review bespoke quotes in one place.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-[#A33D4A]/10 border border-[#A33D4A]/30 rounded-xl text-xs text-[#A33D4A] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-[#43243F] mb-1">Full Name *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Aditi Sharma"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full p-3 pl-9 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl focus:outline-none focus:border-[#A64D78]"
                />
                <User className="w-4 h-4 text-[#6F6670] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block font-medium text-[#43243F] mb-1">
                Phone Number (WhatsApp preferred) *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-3 pl-9 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl focus:outline-none focus:border-[#A64D78]"
                />
                <Phone className="w-4 h-4 text-[#6F6670] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block font-medium text-[#43243F] mb-1">
                Email Address (Optional)
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 pl-9 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl focus:outline-none focus:border-[#A64D78]"
                />
                <Mail className="w-4 h-4 text-[#6F6670] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block font-medium text-[#43243F] mb-1">Password *</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full p-3 pl-9 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl focus:outline-none focus:border-[#A64D78]"
                />
                <Lock className="w-4 h-4 text-[#6F6670] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block font-medium text-[#43243F] mb-1">Confirm Password *</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Repeat your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full p-3 pl-9 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl focus:outline-none focus:border-[#A64D78]"
                />
                <Lock className="w-4 h-4 text-[#6F6670] absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#704568] hover:bg-[#43243F] disabled:bg-gray-300 text-white font-bold uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <span>{loading ? "Creating Account..." : "Create Account"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2 text-xs text-[#6F6670]">
              Already have an account?{" "}
              <Link href="/account/login" className="font-bold text-[#A64D78] hover:underline">
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

