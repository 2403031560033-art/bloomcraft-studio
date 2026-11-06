"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Search, Menu, X, Heart, User, LogOut, Package, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const { itemCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Auth state
  const [authData, setAuthData] = useState<{
    isLoggedIn: boolean;
    type: "CUSTOMER" | "ADMIN" | null;
    user: any;
  }>({
    isLoggedIn: false,
    type: null,
    user: null,
  });

  useEffect(() => {
    fetch("/api/v1/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.type) {
          setAuthData({
            isLoggedIn: true,
            type: data.type,
            user: data.data,
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleLogout = async () => {
    if (authData.type === "ADMIN") {
      await fetch("/api/v1/admin/auth/logout", { method: "POST" });
    } else {
      await fetch("/api/v1/auth/logout", { method: "POST" });
    }
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFBF8]/95 backdrop-blur-md border-b border-[#E5DDE2]/60">
      {/* Announcement Bar */}
      <div className="bg-[#704568] text-[#FFFBF8] py-1.5 px-4 text-xs font-medium text-center tracking-wide flex items-center justify-center gap-2">
        <Heart className="w-3.5 h-3.5 text-[#F6E4EC] fill-[#F6E4EC]" />
        <span>Handmade with love • Custom orders open ✨</span>
        <Heart className="w-3.5 h-3.5 text-[#F6E4EC] fill-[#F6E4EC]" />
      </div>

      {/* Main Navbar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[#43243F] hover:bg-[#F6E4EC] rounded-lg transition"
          aria-label="Open menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-[#F6E4EC] flex items-center justify-center text-[#704568] text-lg font-serif">
            🌸
          </div>
          <div>
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#43243F]">
              BloomCraft Studio
            </span>
            <span className="hidden sm:block text-[10px] text-[#A64D78] tracking-widest uppercase -mt-1 font-sans">
              Handmade in Jhansi
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#261F26]">
          <Link href="/shop" className="hover:text-[#A64D78] transition">
            Shop
          </Link>
          <Link href="/shop?category=bouquets" className="hover:text-[#A64D78] transition">
            Bouquets
          </Link>
          <Link href="/shop?category=flower-pots" className="hover:text-[#A64D78] transition">
            Flower Pots
          </Link>
          <Link href="/shop?category=keychains" className="hover:text-[#A64D78] transition">
            Keychains
          </Link>
          <Link href="/custom-order" className="text-[#A64D78] font-semibold hover:text-[#704568] transition">
            Custom Gifts ✨
          </Link>
          <Link href="/about" className="hover:text-[#A64D78] transition">
            About
          </Link>
          <Link href="/contact" className="hover:text-[#A64D78] transition">
            Contact
          </Link>
        </nav>

        {/* Right action icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Trigger */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 text-[#43243F] hover:bg-[#F6E4EC] rounded-full transition"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* User Account / Sign In Dropdown */}
          <div className="relative">
            {authData.isLoggedIn ? (
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-[#F6E4EC] text-[#704568] hover:bg-[#704568] hover:text-white transition text-xs font-semibold"
                aria-label="Account menu"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline max-w-[100px] truncate">
                  {authData.type === "ADMIN" ? "Studio Admin" : authData.user?.name?.split(" ")[0]}
                </span>
              </button>
            ) : (
              <Link
                href="/account/login"
                className="flex items-center gap-1.5 p-2 sm:px-3.5 sm:py-1.5 rounded-full bg-white border border-[#E5DDE2] hover:border-[#A64D78] text-[#43243F] hover:text-[#704568] transition text-xs font-semibold shadow-2xs"
                title="Sign in or create account"
              >
                <User className="w-4 h-4 text-[#A64D78]" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* Dropdown Menu when logged in */}
            {userDropdownOpen && authData.isLoggedIn && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-[#E5DDE2] shadow-xl py-2 z-50 text-xs"
                onMouseLeave={() => setUserDropdownOpen(false)}
              >
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="font-bold text-[#43243F] truncate">{authData.user?.name}</p>
                  <p className="text-[10px] text-[#6F6670] truncate">
                    {authData.type === "ADMIN" ? "Studio Owner" : authData.user?.phone || authData.user?.email}
                  </p>
                </div>

                {authData.type === "ADMIN" ? (
                  <Link
                    href="/admin"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-[#43243F] hover:bg-[#F6E4EC] font-semibold"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#704568]" />
                    <span>Owner Dashboard</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/account"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-[#43243F] hover:bg-[#F6E4EC]"
                    >
                      <User className="w-4 h-4 text-[#704568]" />
                      <span>My Profile & Orders</span>
                    </Link>
                    <Link
                      href="/account"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-[#43243F] hover:bg-[#F6E4EC]"
                    >
                      <Package className="w-4 h-4 text-[#704568]" />
                      <span>Order History</span>
                    </Link>
                  </>
                )}

                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-[#A33D4A] hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Cart trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-[#43243F] hover:bg-[#F6E4EC] rounded-full transition"
            aria-label="Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#A64D78] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Search Input */}
      {searchOpen && (
        <div className="border-t border-[#E5DDE2] bg-[#FFFBF8] py-3 px-4">
          <form onSubmit={handleSearch} className="max-w-xl mx-auto flex items-center gap-2">
            <input
              type="text"
              placeholder="Search handcrafted crochet bouquets, pots, keychains..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 text-sm bg-white border border-[#E5DDE2] rounded-full focus:outline-none focus:border-[#A64D78]"
              autoFocus
            />
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#704568] rounded-full hover:bg-[#43243F] transition"
            >
              Search
            </button>
          </form>
        </div>
      )}

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5DDE2] bg-[#FFFBF8] px-6 py-4 space-y-3">
          {/* Sign In / Account button for mobile */}
          <div className="pb-3 border-b border-[#E5DDE2]">
            {authData.isLoggedIn ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[#43243F]">{authData.user?.name}</p>
                  <p className="text-xs text-[#6F6670]">
                    {authData.type === "ADMIN" ? "Studio Owner" : "Customer Account"}
                  </p>
                </div>
                <Link
                  href={authData.type === "ADMIN" ? "/admin" : "/account"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-1.5 bg-[#704568] text-white text-xs font-semibold rounded-full"
                >
                  {authData.type === "ADMIN" ? "Dashboard" : "My Account"}
                </Link>
              </div>
            ) : (
              <Link
                href="/account/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 bg-[#704568] text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-xs"
              >
                <User className="w-4 h-4" />
                <span>Sign In / Create Account</span>
              </Link>
            )}
          </div>

          <Link
            href="/shop"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-[#43243F] hover:text-[#A64D78]"
          >
            All Products
          </Link>
          <Link
            href="/shop?category=bouquets"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-[#43243F] hover:text-[#A64D78]"
          >
            Bouquets
          </Link>
          <Link
            href="/shop?category=flower-pots"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-[#43243F] hover:text-[#A64D78]"
          >
            Flower Pots
          </Link>
          <Link
            href="/shop?category=keychains"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-[#43243F] hover:text-[#A64D78]"
          >
            Keychains
          </Link>
          <Link
            href="/shop?category=toran-wall-hangings"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-[#43243F] hover:text-[#A64D78]"
          >
            Toran & Wall Hangings
          </Link>
          <Link
            href="/shop?category=hair-accessories"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-[#43243F] hover:text-[#A64D78]"
          >
            Hair Accessories
          </Link>
          <div className="pt-2 border-t border-[#E5DDE2]">
            <Link
              href="/custom-order"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-semibold text-[#A64D78] flex items-center justify-between"
            >
              <span>Create a Custom Gift</span>
              <span>✨</span>
            </Link>
            <Link
              href="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 text-sm text-[#6F6670] hover:text-[#43243F]"
            >
              Track Your Order
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 text-sm text-[#6F6670] hover:text-[#43243F]"
            >
              About Our Jhansi Studio
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 text-sm text-[#6F6670] hover:text-[#43243F]"
            >
              Contact & WhatsApp
            </Link>
            {authData.isLoggedIn && (
              <button
                onClick={handleLogout}
                className="block w-full text-left py-2 text-xs font-bold text-[#A33D4A]"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
