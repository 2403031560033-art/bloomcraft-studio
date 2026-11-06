"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Sparkles,
  Package,
  Layers,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If on login page, don't show the dashboard shell
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    fetch("/api/v1/admin/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAdmin(data.data);
        } else {
          router.push("/admin/login");
        }
      })
      .catch(() => {
        router.push("/admin/login");
      })
      .finally(() => setLoading(false));
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    await fetch("/api/v1/admin/auth/logout", { method: "POST" });
    router.push("/account/login");
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFBF8]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#704568] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#6F6670]">Verifying owner session...</p>
        </div>
      </div>
    );
  }

  const NAV_ITEMS = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { label: "Custom Requests", href: "/admin/custom-requests", icon: Sparkles },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Categories", href: "/admin/categories", icon: Layers },
    { label: "Reports & CSV", href: "/admin/reports", icon: BarChart3 },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-[#F8F0E9]/30">
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#43243F] text-white px-4 h-14 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <span>🌸</span>
          <span className="font-serif font-bold text-base">BloomCraft Admin</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 text-white hover:bg-white/10 rounded-lg"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#43243F] text-white flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 space-y-6">
          {/* Brand */}
          <div className="flex items-center justify-between border-b border-[#704568] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#704568] flex items-center justify-center text-lg">
                🌸
              </div>
              <div>
                <h2 className="font-serif font-bold text-base leading-tight">BloomCraft</h2>
                <span className="text-[10px] text-[#F6E4EC]/70 uppercase tracking-widest block">
                  Studio Dashboard
                </span>
              </div>
            </div>
            <Link
              href="/"
              target="_blank"
              className="p-1 text-[#F6E4EC]/70 hover:text-white"
              title="Open storefront"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? "bg-[#704568] text-white shadow-xs font-semibold"
                      : "text-[#F6E4EC]/80 hover:bg-[#704568]/40 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile & Logout */}
        <div className="p-4 border-t border-[#704568] bg-[#351c32]">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <p className="text-xs font-bold truncate">{admin?.name || "Soni"}</p>
              <span className="text-[10px] text-[#A64D78] font-semibold uppercase tracking-wider">
                {admin?.role || "OWNER"}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-[#F6E4EC]/70 hover:text-white hover:bg-white/10 rounded-lg transition"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col pt-14 lg:pt-0">
        <main className="p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}

