"use client";

import React, { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  ShoppingBag,
  Sparkles,
  Clock,
  ShieldCheck,
  Truck,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import CartDrawer from "@/components/storefront/CartDrawer";
import { useCart } from "@/context/CartContext";
import { formatPaise } from "@/lib/utils";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [personalisationValues, setPersonalisationValues] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  const { addItem } = useCart();

  useEffect(() => {
    fetch(`/api/v1/products/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProduct(data.data);
          if (data.data.variants && data.data.variants.length > 0) {
            const firstActive = data.data.variants.find((v: any) => v.isActive);
            if (firstActive) setSelectedVariantId(firstActive._id);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFFBF8]">
        <Header />
        <div className="flex-1 max-w-6xl mx-auto px-4 py-20 text-center animate-pulse space-y-4">
          <div className="w-12 h-12 bg-[#F6E4EC] rounded-full mx-auto" />
          <p className="text-sm text-[#6F6670]">Loading handcrafted details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFFBF8]">
        <Header />
        <div className="flex-1 max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
          <span className="text-5xl">🌸</span>
          <h2 className="font-serif text-2xl font-bold text-[#43243F]">Creation Not Found</h2>
          <p className="text-sm text-[#6F6670]">This piece may have been retired or moved.</p>
          <Link
            href="/shop"
            className="inline-block px-6 py-2.5 bg-[#704568] text-white text-xs font-semibold rounded-full hover:bg-[#43243F]"
          >
            Back to Shop
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Calculate dynamic price based on active variant
  let currentPricePaise = product.basePricePaise;
  const activeVariant = product.variants?.find((v: any) => v._id === selectedVariantId);
  if (activeVariant) {
    currentPricePaise += activeVariant.priceDeltaPaise;
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : [
        {
          imageUrl: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=800&q=80",
          altText: product.name,
        },
      ];

  const handleAddToCart = () => {
    addItem({
      productId: product._id,
      variantId: activeVariant?._id,
      productName: product.name,
      variantName: activeVariant?.name,
      pricePaise: currentPricePaise,
      quantity,
      imageUrl: images[activeImageIndex]?.imageUrl || images[0].imageUrl,
      fulfilmentType: product.fulfilmentType,
      personalisation: personalisationValues,
      preparationDays: product.preparationMaxDays || 2,
    });
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFBF8]">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="text-xs text-[#6F6670] mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-[#43243F]">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#43243F]">Shop</Link>
          <span>/</span>
          <Link
            href={`/shop?category=${product.categoryId?.slug}`}
            className="hover:text-[#43243F]"
          >
            {product.categoryId?.name}
          </Link>
          <span>/</span>
          <span className="text-[#43243F] font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div
              className="relative aspect-square rounded-3xl overflow-hidden bg-[#F8F0E9] border border-[#E5DDE2]"
              style={{ position: "relative" }}
            >
              <Image
                src={images[activeImageIndex]?.imageUrl}
                alt={images[activeImageIndex]?.altText || product.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />

              {/* Fulfilment badge */}
              <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs text-[#704568] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                {product.fulfilmentType === "READY_STOCK" ? "Ready Stock" : "Made to order"}
              </span>
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    style={{ position: "relative" }}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                      activeImageIndex === idx
                        ? "border-[#A64D78] shadow-sm"
                        : "border-[#E5DDE2] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img.imageUrl}
                      alt={img.altText || `View ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details & Purchase Form */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#A64D78] tracking-widest uppercase mb-1">
                <span>{product.categoryId?.name}</span>
                <span>•</span>
                <span>Jhansi Studio</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#43243F] leading-tight">
                {product.name}
              </h1>

              <div className="mt-3 flex items-baseline gap-3">
                <span className="font-serif text-3xl font-bold text-[#704568]">
                  {formatPaise(currentPricePaise)}
                </span>
                <span className="text-xs text-[#6F6670]">Taxes included • Free shipping over ₹999</span>
              </div>
            </div>

            {/* Fulfilment & Production notice */}
            <div className="p-4 rounded-2xl bg-[#F6E4EC]/50 border border-[#E5DDE2] flex items-start gap-3 text-xs text-[#43243F]">
              <Clock className="w-4 h-4 text-[#A64D78] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">
                  {product.fulfilmentType === "READY_STOCK"
                    ? "In Stock & Ready to Dispatch"
                    : `Estimated Prep Time: ${product.preparationMinDays || 2}-${product.preparationMaxDays || 4} Days`}
                </span>
                <p className="text-[#6F6670] mt-0.5">
                  {product.fulfilmentType === "READY_STOCK"
                    ? "Dispatched within 24 hours via reliable pan-India courier."
                    : "Lovingly hand-knitted upon order confirmation before safe dispatch."}
                </p>
              </div>
            </div>

            {/* Short Description */}
            <p className="text-sm text-[#261F26] leading-relaxed">
              {product.shortDescription || product.description}
            </p>

            {/* Variants Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#E5DDE2]">
                <label className="text-xs font-bold text-[#43243F] uppercase tracking-wider">
                  Select Style / Size
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {product.variants.map((v: any) => (
                    <button
                      key={v._id}
                      type="button"
                      onClick={() => setSelectedVariantId(v._id)}
                      className={`p-2.5 text-xs rounded-xl border text-left transition ${
                        selectedVariantId === v._id
                          ? "border-[#704568] bg-[#F6E4EC]/60 text-[#43243F] font-semibold"
                          : "border-[#E5DDE2] bg-white text-[#6F6670] hover:border-[#A64D78]"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{v.name}</span>
                        {v.priceDeltaPaise !== 0 && (
                          <span className="text-[10px] text-[#A64D78]">
                            +{formatPaise(v.priceDeltaPaise)}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Personalisation Schema Input Fields */}
            {product.personalisationFields && product.personalisationFields.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-[#E5DDE2]">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#A64D78] uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Personalisation Options</span>
                </div>
                {product.personalisationFields.map((field: any, idx: number) => (
                  <div key={idx} className="space-y-1">
                    <label className="text-xs font-medium text-[#43243F] flex items-center justify-between">
                      <span>{field.label} {field.required && <span className="text-[#A33D4A]">*</span>}</span>
                      {field.maxLength && (
                        <span className="text-[10px] text-[#6F6670]">max {field.maxLength} chars</span>
                      )}
                    </label>
                    <input
                      type="text"
                      maxLength={field.maxLength}
                      placeholder={field.placeholder || "e.g. Happy Birthday Di, Pink Ribbon"}
                      value={personalisationValues[field.fieldName] || ""}
                      onChange={(e) =>
                        setPersonalisationValues((prev) => ({
                          ...prev,
                          [field.fieldName]: e.target.value,
                        }))
                      }
                      className="w-full text-xs p-2.5 bg-white border border-[#E5DDE2] rounded-xl focus:outline-none focus:border-[#A64D78]"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Quantity Stepper & Add to Cart */}
            <div className="pt-4 border-t border-[#E5DDE2] space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-[#E5DDE2] rounded-full bg-white px-2 py-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1 hover:text-[#A64D78] text-[#43243F] transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-sm font-bold text-[#43243F]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1 hover:text-[#A64D78] text-[#43243F] transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 bg-[#704568] hover:bg-[#43243F] text-white font-medium rounded-full shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 group"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Basket • {formatPaise(currentPricePaise * quantity)}</span>
                </button>
              </div>

              {addedNotice && (
                <div className="p-2.5 bg-[#28734D]/10 border border-[#28734D]/30 rounded-xl text-xs text-[#28734D] font-medium flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Added to gift basket! Proceeding to your order whenever ready.</span>
                </div>
              )}
            </div>

            {/* Care instructions & Trust Accordion */}
            <div className="space-y-3 pt-4 border-t border-[#E5DDE2] text-xs text-[#6F6670]">
              {product.careInstructions && (
                <div className="p-3 bg-[#FFFBF8] rounded-xl border border-[#E5DDE2]/70">
                  <h4 className="font-bold text-[#43243F] mb-1">Handmade Care Instructions</h4>
                  <p>{product.careInstructions}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#A64D78]" />
                  <span>Pan-India Courier Dispatch</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#A64D78]" />
                  <span>Safe & Secure Indian Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}

