"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Filter, ShoppingBag, Heart, Search, X } from "lucide-react";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import CartDrawer from "@/components/storefront/CartDrawer";
import { useCart } from "@/context/CartContext";
import { formatPaise } from "@/lib/utils";

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const initialQuery = searchParams.get("q") || "";

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [availability, setAvailability] = useState("");
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState(initialQuery);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const { addItem } = useCart();

  // Load categories
  useEffect(() => {
    fetch("/api/v1/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories(data.data);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch products on filter changes
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (availability) params.set("availability", availability);
    if (search) params.set("q", search);
    if (sort) params.set("sort", sort);

    fetch(`/api/v1/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProducts(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedCategory, availability, sort, search]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Title & Search bar */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5DDE2] pb-6">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#43243F]">
            The BloomCraft Collection
          </h1>
          <p className="text-sm text-[#6F6670] mt-1">
            Handmade crochet bouquets, floral accessories, pots & seasonal wall hangings.
          </p>
        </div>

        {/* Search input & Mobile filter trigger */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#E5DDE2] rounded-full focus:outline-none focus:border-[#A64D78]"
            />
            <Search className="w-4 h-4 text-[#6F6670] absolute left-3 top-2.5" />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center gap-1.5 px-4 py-2 bg-white border border-[#E5DDE2] rounded-full text-xs font-semibold text-[#43243F]"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Filters Desktop */}
        <aside
          className={`md:block ${
            mobileFilterOpen ? "block" : "hidden"
          } space-y-6 bg-white md:bg-transparent p-4 md:p-0 rounded-2xl border md:border-0 border-[#E5DDE2]`}
        >
          {/* Categories */}
          <div>
            <h3 className="font-serif font-bold text-sm text-[#43243F] mb-3">Categories</h3>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={() => setSelectedCategory("")}
                  className={`w-full text-left px-3 py-1.5 rounded-lg transition ${
                    selectedCategory === ""
                      ? "bg-[#704568] text-white font-medium"
                      : "text-[#261F26] hover:bg-[#F6E4EC]"
                  }`}
                >
                  All Categories
                </button>
              </li>
              {categories.map((c) => (
                <li key={c.slug}>
                  <button
                    onClick={() => setSelectedCategory(c.slug)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg transition ${
                      selectedCategory === c.slug
                        ? "bg-[#704568] text-white font-medium"
                        : "text-[#261F26] hover:bg-[#F6E4EC]"
                    }`}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Availability / Fulfilment type */}
          <div className="border-t border-[#E5DDE2] pt-4">
            <h3 className="font-serif font-bold text-sm text-[#43243F] mb-3">Availability</h3>
            <div className="space-y-2 text-xs text-[#261F26]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="availability"
                  checked={availability === ""}
                  onChange={() => setAvailability("")}
                  className="accent-[#704568]"
                />
                <span>All Items</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="availability"
                  checked={availability === "READY_STOCK"}
                  onChange={() => setAvailability("READY_STOCK")}
                  className="accent-[#704568]"
                />
                <span>Ready Stock (Ships within 24h)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="availability"
                  checked={availability === "MADE_TO_ORDER"}
                  onChange={() => setAvailability("MADE_TO_ORDER")}
                  className="accent-[#704568]"
                />
                <span>Made to Order (~3-5 days)</span>
              </label>
            </div>
          </div>

          {/* Sort */}
          <div className="border-t border-[#E5DDE2] pt-4">
            <h3 className="font-serif font-bold text-sm text-[#43243F] mb-3">Sort By</h3>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full text-xs p-2 bg-white border border-[#E5DDE2] rounded-lg focus:outline-none focus:border-[#A64D78]"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Alphabetical (A-Z)</option>
            </select>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="md:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="aspect-3/4 bg-[#E5DDE2]/40 rounded-2xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-[#E5DDE2] p-8 space-y-4">
              <span className="text-4xl">🌸</span>
              <h3 className="font-serif text-xl font-bold text-[#43243F]">No items matched</h3>
              <p className="text-sm text-[#6F6670] max-w-sm mx-auto">
                Try selecting another category, adjusting filters, or request a custom-made creation directly.
              </p>
              <Link
                href="/custom-order"
                className="inline-block mt-2 px-6 py-2.5 bg-[#704568] text-white text-xs font-semibold rounded-full hover:bg-[#43243F]"
              >
                Request a Custom Gift
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {products.map((product) => {
                const primaryImage =
                  product.images?.find((img: any) => img.isPrimary)?.imageUrl ||
                  product.images?.[0]?.imageUrl ||
                  "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=600&q=80";

                return (
                  <div
                    key={product._id}
                    className="group bg-white rounded-2xl border border-[#E5DDE2]/80 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                  >
                    <div
                      className="relative aspect-square overflow-hidden bg-[#F6E4EC]/20"
                      style={{ position: "relative" }}
                    >
                      <Link href={`/products/${product.slug}`} className="block w-full h-full">
                        <Image
                          src={primaryImage}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 50vw, 30vw"
                        />
                      </Link>

                      <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-[#704568] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                        {product.fulfilmentType === "READY_STOCK" ? "Ready Stock" : "Made to order"}
                      </span>

                      <button
                        aria-label="Wishlist"
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 backdrop-blur-xs text-[#6F6670] hover:text-[#A64D78] hover:bg-white transition shadow-xs"
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-[#A64D78] font-medium uppercase tracking-wider">
                          {product.categoryId?.name || "Craft"}
                        </span>
                        <Link href={`/products/${product.slug}`}>
                          <h3 className="font-serif font-bold text-sm sm:text-base text-[#43243F] group-hover:text-[#A64D78] transition line-clamp-1 mt-0.5">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="font-serif font-bold text-base text-[#704568] mt-1">
                          {formatPaise(product.basePricePaise)}
                        </p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-gray-100">
                        <button
                          onClick={() =>
                            addItem({
                              productId: product._id,
                              productName: product.name,
                              pricePaise: product.basePricePaise,
                              quantity: 1,
                              imageUrl: primaryImage,
                              fulfilmentType: product.fulfilmentType,
                              preparationDays: product.preparationMaxDays || 2,
                            })
                          }
                          className="w-full py-2 px-3 bg-[#F6E4EC] hover:bg-[#704568] text-[#704568] hover:text-white rounded-xl text-xs font-semibold tracking-wide flex items-center justify-center gap-1.5 transition duration-200"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFBF8]">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-sm">Loading collection...</div>}>
          <ShopContent />
        </Suspense>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}

