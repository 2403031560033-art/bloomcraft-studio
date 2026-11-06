"use client";

import React, { useEffect, useState } from "react";
import { Save, CheckCircle, AlertCircle } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    businessName: "BloomCraft Studio",
    supportEmail: "bloomcraftstudio@gmail.com",
    supportPhone: "9876543210",
    instagramUrl: "https://www.instagram.com/bloomcraftstudio_",
    whatsappUrl: "https://wa.me/919876543210",
    flatShippingRateRupees: "0",
    freeShippingAboveRupees: "999",
    isCodEnabled: false,
    shippingPolicy: "",
    returnPolicy: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/v1/admin/settings")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setSettings({
            businessName: json.data.businessName || "BloomCraft Studio",
            supportEmail: json.data.supportEmail || "bloomcraftstudio@gmail.com",
            supportPhone: json.data.supportPhone || "",
            instagramUrl: json.data.instagramUrl || "https://www.instagram.com/bloomcraftstudio_",
            whatsappUrl: json.data.whatsappUrl || "",
            flatShippingRateRupees: ((json.data.flatShippingRatePaise || 0) / 100).toString(),
            freeShippingAboveRupees: json.data.freeShippingAbovePaise
              ? (json.data.freeShippingAbovePaise / 100).toString()
              : "999",
            isCodEnabled: json.data.isCodEnabled || false,
            shippingPolicy: json.data.shippingPolicy || "",
            returnPolicy: json.data.returnPolicy || "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const payload = {
        businessName: settings.businessName,
        supportEmail: settings.supportEmail,
        supportPhone: settings.supportPhone,
        instagramUrl: settings.instagramUrl,
        whatsappUrl: settings.whatsappUrl,
        flatShippingRatePaise: Math.round(parseFloat(settings.flatShippingRateRupees || "0") * 100),
        freeShippingAbovePaise: Math.round(parseFloat(settings.freeShippingAboveRupees || "0") * 100),
        isCodEnabled: settings.isCodEnabled,
        shippingPolicy: settings.shippingPolicy,
        returnPolicy: settings.returnPolicy,
      };

      const res = await fetch("/api/v1/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch {}
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#43243F]">
          Studio & Store Settings
        </h1>
        <p className="text-xs text-[#6F6670] mt-0.5">
          Configure official contact info, delivery rates, COD status, and store policies.
        </p>
      </div>

      {success && (
        <div className="p-4 bg-[#28734D]/10 border border-[#28734D]/30 rounded-2xl text-xs text-[#28734D] font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-[#E5DDE2] shadow-xs text-xs">
        {/* Contact info */}
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-base text-[#43243F] border-b pb-2">
            Brand & Contact Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#43243F] mb-1">Business Name</label>
              <input
                type="text"
                value={settings.businessName}
                onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                className="w-full p-2.5 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-[#43243F] mb-1">Support Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full p-2.5 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-[#43243F] mb-1">Instagram URL</label>
              <input
                type="url"
                value={settings.instagramUrl}
                onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                className="w-full p-2.5 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-[#43243F] mb-1">WhatsApp URL / Phone</label>
              <input
                type="text"
                value={settings.whatsappUrl}
                onChange={(e) => setSettings({ ...settings, whatsappUrl: e.target.value })}
                className="w-full p-2.5 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Payment Settings */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="font-serif font-bold text-base text-[#43243F] border-b pb-2">
            Payment & Shipping Rules
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#43243F] mb-1">
                Standard Shipping Charge (₹)
              </label>
              <input
                type="number"
                value={settings.flatShippingRateRupees}
                onChange={(e) =>
                  setSettings({ ...settings, flatShippingRateRupees: e.target.value })
                }
                className="w-full p-2.5 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-[#43243F] mb-1">
                Free Shipping Threshold (₹)
              </label>
              <input
                type="number"
                value={settings.freeShippingAboveRupees}
                onChange={(e) =>
                  setSettings({ ...settings, freeShippingAboveRupees: e.target.value })
                }
                className="w-full p-2.5 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 p-3 bg-[#FFFBF8] rounded-xl border border-[#E5DDE2] cursor-pointer">
              <input
                type="checkbox"
                checked={settings.isCodEnabled}
                onChange={(e) => setSettings({ ...settings, isCodEnabled: e.target.checked })}
                className="accent-[#704568] w-4 h-4"
              />
              <div>
                <span className="font-bold text-[#43243F] block">Enable Cash on Delivery (COD)</span>
                <span className="text-[11px] text-[#6F6670] block">
                  Per blueprint rule, COD options remain strictly hidden until activated by the owner.
                </span>
              </div>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-[#704568] hover:bg-[#43243F] text-white font-semibold rounded-xl shadow-md transition flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving Changes..." : "Save Store Configuration"}</span>
        </button>
      </form>
    </div>
  );
}

