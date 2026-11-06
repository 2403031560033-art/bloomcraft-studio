"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Sparkles, Upload, CheckCircle2, AlertCircle, Info, Calendar, DollarSign, Palette } from "lucide-react";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";

const COMMON_OCCASIONS = [
  "Anniversary",
  "Birthday",
  "Wedding Favor",
  "Festival (Diwali / Rakhi)",
  "Home Décor",
  "Housewarming",
  "New Born / Baby Shower",
  "Other Celebration",
];

const POPULAR_COLOURS = [
  "Dusty Rose",
  "Lilac / Lavender",
  "Sunflower Yellow",
  "Sage Green",
  "Ivory / Cream",
  "Maroon / Wine",
  "Sky Blue",
  "Pastel Peach",
];

export default function CustomOrderPage() {
  const [formData, setFormData] = useState({
    customerName: "",
    phoneE164: "",
    email: "",
    occasion: "Anniversary",
    budgetMin: "500",
    budgetMax: "1500",
    description: "",
    requiredBy: "",
  });

  const [selectedColours, setSelectedColours] = useState<string[]>(["Dusty Rose", "Ivory / Cream"]);
  const [customColour, setCustomColour] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any>(null);

  const toggleColour = (colour: string) => {
    setSelectedColours((prev) =>
      prev.includes(colour) ? prev.filter((c) => c !== colour) : [...prev, colour]
    );
  };

  const addCustomColour = () => {
    if (customColour.trim() && !selectedColours.includes(customColour.trim())) {
      setSelectedColours((prev) => [...prev, customColour.trim()]);
      setCustomColour("");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Inspiration image must be under 5MB.");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.phoneE164.match(/^(\+91)?[6-9]\d{9}$/)) {
      setError("Please provide a valid 10-digit Indian phone number.");
      return;
    }

    if (formData.description.trim().length < 10) {
      setError("Please describe your custom gift idea in a bit more detail (at least 10 characters).");
      return;
    }

    setSubmitting(true);

    try {
      let uploadedImageUrl = "";
      let uploadedPublicId = "";

      // 1. Upload inspiration image if selected
      if (imageFile) {
        setUploadingImage(true);
        const uploadData = new FormData();
        uploadData.append("file", imageFile);
        uploadData.append("folder", "bloomcraft_custom_requests");

        const uploadRes = await fetch("/api/v1/upload", {
          method: "POST",
          body: uploadData,
        });

        const uploadJson = await uploadRes.json();
        if (uploadRes.ok && uploadJson.data?.url) {
          uploadedImageUrl = uploadJson.data.url;
          uploadedPublicId = uploadJson.data.publicId || "";
        }
        setUploadingImage(false);
      }

      // 2. Submit custom order request
      const payload = {
        customerName: formData.customerName,
        phoneE164: formData.phoneE164,
        email: formData.email || undefined,
        occasion: formData.occasion,
        budgetMinPaise: formData.budgetMin ? parseInt(formData.budgetMin, 10) * 100 : undefined,
        budgetMaxPaise: formData.budgetMax ? parseInt(formData.budgetMax, 10) * 100 : undefined,
        preferredColours: selectedColours,
        description: formData.description,
        requiredBy: formData.requiredBy || undefined,
        inspirationImageUrl: uploadedImageUrl || undefined,
        inspirationImagePublicId: uploadedPublicId || undefined,
      };

      const res = await fetch("/api/v1/custom-order-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to submit request.");
      }

      setSuccessData(json.data);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
      setUploadingImage(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFBF8]">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Page Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F6E4EC] text-[#A64D78] text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bespoke Commission</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#43243F]">
            Create a Custom Gift
          </h1>
          <p className="text-sm text-[#6F6670] leading-relaxed">
            Dreaming of a special crochet bouquet combination, custom wedding toran, or a personalized flower pot? Share your vision with Soni at BloomCraft Studio.
          </p>
        </div>

        {/* Clear Blueprint Disclaimer */}
        <div className="p-4 rounded-2xl bg-[#EEE9F7] border border-[#704568]/20 flex items-start gap-3 mb-8 text-xs text-[#43243F]">
          <Info className="w-5 h-5 text-[#704568] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm">How custom orders work:</h4>
            <p>
              Submitting this request <strong>does not create a paid order immediately</strong>. Soni will personally review your requested colours, deadline, and reference image, and contact you on WhatsApp/Phone with an exact quote and preparation schedule.
            </p>
          </div>
        </div>

        {/* Success View */}
        {successData ? (
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#E5DDE2] shadow-sm text-center space-y-6 animate-fadeIn">
            <div className="w-20 h-20 rounded-full bg-[#28734D]/10 text-[#28734D] mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <span className="text-xs uppercase font-bold text-[#A64D78] tracking-widest">
                Inquiry Received
              </span>
              <h2 className="font-serif text-3xl font-bold text-[#43243F]">
                Thank You, {formData.customerName}!
              </h2>
              <p className="text-sm text-[#6F6670] max-w-md mx-auto">
                Your request has been logged under reference:
              </p>
              <div className="inline-block px-4 py-2 bg-[#F6E4EC] rounded-xl font-mono font-bold text-[#704568] text-lg">
                #{successData.requestNumber}
              </div>
            </div>

            <p className="text-xs text-[#6F6670] max-w-sm mx-auto">
              We will reach out to you at <strong>{formData.phoneE164}</strong> within 24 hours to discuss your design details and provide a confirmed quote.
            </p>

            <div className="pt-4">
              <button
                onClick={() => {
                  setSuccessData(null);
                  setImagePreview(null);
                  setImageFile(null);
                }}
                className="px-8 py-3 bg-[#704568] text-white text-xs font-semibold rounded-full hover:bg-[#43243F] transition"
              >
                Submit Another Custom Idea
              </button>
            </div>
          </div>
        ) : (
          /* Request Form */
          <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-10 rounded-3xl border border-[#E5DDE2] shadow-xs space-y-8">
            {error && (
              <div className="p-4 bg-[#A33D4A]/10 border border-[#A33D4A]/30 rounded-2xl flex items-center gap-3 text-xs text-[#A33D4A]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Step 1: Your Contact */}
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-lg text-[#43243F] border-b border-gray-100 pb-2">
                1. Your Contact Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#43243F] mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Soni Verma"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full text-xs p-3 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl focus:outline-none focus:border-[#A64D78]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#43243F] mb-1">
                    WhatsApp / Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={formData.phoneE164}
                    onChange={(e) => setFormData({ ...formData, phoneE164: e.target.value })}
                    className="w-full text-xs p-3 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl focus:outline-none focus:border-[#A64D78]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[#43243F] mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs p-3 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl focus:outline-none focus:border-[#A64D78]"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Occasion, Budget & Timeline */}
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-lg text-[#43243F] border-b border-gray-100 pb-2">
                2. Occasion & Budget Range
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#43243F] mb-1">
                    Occasion / Event
                  </label>
                  <select
                    value={formData.occasion}
                    onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                    className="w-full text-xs p-3 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl focus:outline-none focus:border-[#A64D78]"
                  >
                    {COMMON_OCCASIONS.map((occ) => (
                      <option key={occ} value={occ}>
                        {occ}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#43243F] mb-1">
                    Estimated Budget (INR)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min ₹"
                      value={formData.budgetMin}
                      onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                      className="w-1/2 text-xs p-3 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl focus:outline-none focus:border-[#A64D78]"
                    />
                    <span className="text-[#6F6670]">-</span>
                    <input
                      type="number"
                      placeholder="Max ₹"
                      value={formData.budgetMax}
                      onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                      className="w-1/2 text-xs p-3 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl focus:outline-none focus:border-[#A64D78]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#43243F] mb-1">
                    Required-By Date
                  </label>
                  <input
                    type="date"
                    value={formData.requiredBy}
                    onChange={(e) => setFormData({ ...formData, requiredBy: e.target.value })}
                    className="w-full text-xs p-3 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl focus:outline-none focus:border-[#A64D78]"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Preferred Colours */}
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-lg text-[#43243F] border-b border-gray-100 pb-2">
                3. Preferred Palette & Colours
              </h3>
              <div className="flex flex-wrap gap-2">
                {POPULAR_COLOURS.map((col) => {
                  const isSelected = selectedColours.includes(col);
                  return (
                    <button
                      key={col}
                      type="button"
                      onClick={() => toggleColour(col)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                        isSelected
                          ? "bg-[#704568] text-white shadow-xs"
                          : "bg-[#FFFBF8] border border-[#E5DDE2] text-[#43243F] hover:border-[#A64D78]"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {col}
                    </button>
                  );
                })}
              </div>

              {/* Add custom color input */}
              <div className="flex gap-2 max-w-xs pt-2">
                <input
                  type="text"
                  placeholder="Add custom colour..."
                  value={customColour}
                  onChange={(e) => setCustomColour(e.target.value)}
                  className="flex-1 text-xs p-2 bg-[#FFFBF8] border border-[#E5DDE2] rounded-lg focus:outline-none focus:border-[#A64D78]"
                />
                <button
                  type="button"
                  onClick={addCustomColour}
                  className="px-3 py-1.5 bg-[#F6E4EC] text-[#704568] hover:bg-[#704568] hover:text-white rounded-lg text-xs font-semibold transition"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Step 4: Description & Optional Cloudinary Image Upload */}
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-lg text-[#43243F] border-b border-gray-100 pb-2">
                4. Gift Description & Inspiration Photo
              </h3>

              <div>
                <label className="block text-xs font-medium text-[#43243F] mb-1">
                  Describe what you would love us to craft *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="e.g. I want a 7-flower crochet bouquet with 3 sunflowers, 2 white daisies, and 2 lavender stems wrapped in kraft paper with a pink satin ribbon and a tag saying 'To the best Sister'..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-xs p-3 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl focus:outline-none focus:border-[#A64D78]"
                />
              </div>

              {/* Inspiration Image Upload */}
              <div>
                <label className="block text-xs font-medium text-[#43243F] mb-1">
                  Inspiration Photo / Screenshot (Optional)
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 border-2 border-dashed border-[#E5DDE2] hover:border-[#A64D78] rounded-2xl p-4 text-center cursor-pointer bg-[#FFFBF8] transition">
                    <Upload className="w-5 h-5 text-[#A64D78] mx-auto mb-1" />
                    <span className="text-xs font-medium text-[#43243F] block">
                      Click to choose image from phone or computer
                    </span>
                    <span className="text-[10px] text-[#6F6670] block mt-0.5">
                      PNG, JPG or WEBP up to 5MB (stored securely on Cloudinary)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>

                  {imagePreview && (
                    <div
                      className="relative w-24 h-24 rounded-2xl overflow-hidden border border-[#E5DDE2] shrink-0"
                      style={{ position: "relative" }}
                    >
                      <Image
                        src={imagePreview}
                        alt="Inspiration Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-[#E5DDE2]">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-[#704568] hover:bg-[#43243F] disabled:bg-gray-300 text-white font-medium rounded-full shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {uploadingImage
                    ? "Uploading Inspiration Photo..."
                    : submitting
                    ? "Submitting Your Vision..."
                    : "Send Custom Gift Request"}
                </span>
              </button>
              <p className="text-[11px] text-[#6F6670] text-center mt-2">
                🌸 No advance payment needed until design and price are mutually agreed upon.
              </p>
            </div>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
}

