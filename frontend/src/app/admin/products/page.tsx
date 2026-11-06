"use client";

import React, { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  Package,
  Upload,
  Edit2,
  Archive,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
} from "lucide-react";
import { formatPaise, slugify } from "@/lib/utils";

function ProductsContent() {
  const searchParams = useSearchParams();
  const openNewProduct = searchParams.get("newProduct") === "true";

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(openNewProduct);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    categoryId: "",
    name: "",
    slug: "",
    sku: "",
    shortDescription: "",
    description: "",
    basePriceRupees: "799",
    fulfilmentType: "MADE_TO_ORDER",
    stockQuantity: "10",
    prepMinDays: "2",
    prepMaxDays: "4",
    isPublished: true,
    imageUrl: "",
    imageAlt: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/v1/admin/products"),
        fetch("/api/v1/categories"),
      ]);
      const [prodData, catData] = await Promise.all([prodRes.json(), catRes.json()]);

      if (prodData.success) setProducts(prodData.data);
      if (catData.success) {
        setCategories(catData.data);
        if (catData.data.length > 0 && !form.categoryId) {
          setForm((prev) => ({ ...prev, categoryId: catData.data[0]._id }));
        }
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: slugify(name),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "bloomcraft_products");

      const res = await fetch("/api/v1/upload", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Upload failed");

      setForm((prev) => ({
        ...prev,
        imageUrl: json.data.url,
      }));
    } catch (err: any) {
      alert(err.message || "Failed to upload image");
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload: any = {
        categoryId: form.categoryId || categories[0]?._id,
        name: form.name,
        slug: form.slug || slugify(form.name),
        sku: form.sku || undefined,
        shortDescription: form.shortDescription,
        description: form.description,
        basePricePaise: Math.round(parseFloat(form.basePriceRupees) * 100),
        currency: "INR",
        fulfilmentType: form.fulfilmentType,
        stockQuantity: form.fulfilmentType === "READY_STOCK" ? parseInt(form.stockQuantity, 10) : undefined,
        preparationMinDays: parseInt(form.prepMinDays, 10),
        preparationMaxDays: parseInt(form.prepMaxDays, 10),
        isPublished: form.isPublished,
        images: form.imageUrl
          ? [
              {
                imageUrl: form.imageUrl,
                altText: form.imageAlt || form.name,
                isPrimary: true,
                sortOrder: 0,
              },
            ]
          : [],
      };

      let res;
      if (editingProduct) {
        res = await fetch(`/api/v1/admin/products/${editingProduct._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/v1/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to save product");

      setModalOpen(false);
      setEditingProduct(null);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm("Are you sure you want to archive this product? It will be removed from the public shop.")) {
      return;
    }

    try {
      const res = await fetch(`/api/v1/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      }
    } catch {}
  };

  const openEditModal = (p: any) => {
    setEditingProduct(p);
    setForm({
      categoryId: p.categoryId?._id || p.categoryId,
      name: p.name,
      slug: p.slug,
      sku: p.sku || "",
      shortDescription: p.shortDescription || "",
      description: p.description || "",
      basePriceRupees: (p.basePricePaise / 100).toString(),
      fulfilmentType: p.fulfilmentType,
      stockQuantity: (p.stockQuantity ?? 10).toString(),
      prepMinDays: (p.preparationMinDays ?? 2).toString(),
      prepMaxDays: (p.preparationMaxDays ?? 4).toString(),
      isPublished: p.isPublished,
      imageUrl: p.images?.[0]?.imageUrl || "",
      imageAlt: p.images?.[0]?.altText || "",
    });
    setModalOpen(true);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#43243F]">
            Product Catalogue
          </h1>
          <p className="text-xs text-[#6F6670] mt-0.5">
            Create, manage photos via Cloudinary, adjust prices in rupees, and track inventory.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProduct(null);
            setForm({
              categoryId: categories[0]?._id || "",
              name: "",
              slug: "",
              sku: "",
              shortDescription: "",
              description: "",
              basePriceRupees: "799",
              fulfilmentType: "MADE_TO_ORDER",
              stockQuantity: "10",
              prepMinDays: "2",
              prepMaxDays: "4",
              isPublished: true,
              imageUrl: "",
              imageAlt: "",
            });
            setModalOpen(true);
          }}
          className="px-4 py-2 bg-[#704568] hover:bg-[#43243F] text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5DDE2] shadow-xs">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by product title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl focus:outline-none focus:border-[#A64D78]"
          />
          <Search className="w-4 h-4 text-[#6F6670] absolute left-3 top-3" />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-[#E5DDE2] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFFBF8] text-[#6F6670] border-b border-[#E5DDE2]">
              <tr>
                <th className="py-3 px-4">Image</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Fulfilment Type</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock / Capacity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#6F6670]">
                    Loading products...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#6F6670]">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const img = p.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=150&q=80";
                  return (
                    <tr key={p._id} className="hover:bg-[#FFFBF8]/80 transition">
                      <td className="py-3 px-4">
                        <div
                          className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-[#E5DDE2]"
                          style={{ position: "relative" }}
                        >
                          <Image src={img} alt={p.name} fill className="object-cover" />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#43243F]">{p.name}</div>
                        <div className="text-[10px] text-[#6F6670] font-mono">/{p.slug}</div>
                      </td>
                      <td className="py-3 px-4 text-[#6F6670]">
                        {p.categoryId?.name || "Uncategorized"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-semibold uppercase">
                          {p.fulfilmentType}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-[#704568]">
                        {formatPaise(p.basePricePaise)}
                      </td>
                      <td className="py-3 px-4 text-[#43243F]">
                        {p.fulfilmentType === "READY_STOCK" ? (
                          <span className={p.stockQuantity <= 3 ? "text-amber-600 font-bold" : ""}>
                            {p.stockQuantity ?? 0} units
                          </span>
                        ) : (
                          <span className="text-[#6F6670]">Made to order (~{p.preparationMaxDays || 3}d)</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {p.isPublished && !p.archivedAt ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-bold uppercase">
                            Published
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-bold uppercase">
                            Draft / Archived
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-[#704568] hover:bg-[#F6E4EC] rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleArchive(p._id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Archive"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-[#E5DDE2] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#A64D78] tracking-wider">
                  Catalogue Editor
                </span>
                <h2 className="font-serif text-xl font-bold text-[#43243F]">
                  {editingProduct ? "Edit Product" : "Create New Handmade Product"}
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-[#A33D4A]/10 border border-[#A33D4A]/30 rounded-xl text-xs text-[#A33D4A] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#43243F] mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Heart Rose Bouquet"
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full p-2.5 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#43243F] mb-1">URL Slug *</label>
                  <input
                    type="text"
                    required
                    placeholder="heart-rose-bouquet"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full p-2.5 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#43243F] mb-1">Category *</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full p-2.5 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#43243F] mb-1">Base Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={form.basePriceRupees}
                    onChange={(e) => setForm({ ...form, basePriceRupees: e.target.value })}
                    className="w-full p-2.5 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#43243F] mb-1">Fulfilment Type *</label>
                  <select
                    value={form.fulfilmentType}
                    onChange={(e) => setForm({ ...form, fulfilmentType: e.target.value })}
                    className="w-full p-2.5 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl"
                  >
                    <option value="READY_STOCK">READY STOCK</option>
                    <option value="MADE_TO_ORDER">MADE TO ORDER</option>
                    <option value="CUSTOM_ONLY">CUSTOM ONLY</option>
                  </select>
                </div>
              </div>

              {form.fulfilmentType === "READY_STOCK" ? (
                <div>
                  <label className="block font-bold text-[#43243F] mb-1">Stock Quantity Available *</label>
                  <input
                    type="number"
                    min={0}
                    value={form.stockQuantity}
                    onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
                    className="w-full p-2.5 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#43243F] mb-1">Min Handcrafting Days</label>
                    <input
                      type="number"
                      value={form.prepMinDays}
                      onChange={(e) => setForm({ ...form, prepMinDays: e.target.value })}
                      className="w-full p-2.5 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#43243F] mb-1">Max Handcrafting Days</label>
                    <input
                      type="number"
                      value={form.prepMaxDays}
                      onChange={(e) => setForm({ ...form, prepMaxDays: e.target.value })}
                      className="w-full p-2.5 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl"
                    />
                  </div>
                </div>
              )}

              {/* Image Upload with Cloudinary */}
              <div className="space-y-2 p-3 bg-[#FFFBF8] rounded-xl border border-[#E5DDE2]">
                <label className="block font-bold text-[#43243F]">Product Photo (Cloudinary Upload)</label>
                <div className="flex items-center gap-3">
                  <label className="px-4 py-2 bg-white border border-[#E5DDE2] hover:border-[#A64D78] rounded-xl cursor-pointer text-[#43243F] font-semibold flex items-center gap-1.5 transition">
                    <Upload className="w-3.5 h-3.5 text-[#A64D78]" />
                    <span>{imageUploading ? "Uploading to Cloud..." : "Upload Photo"}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  {form.imageUrl && (
                    <div
                      className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#E5DDE2]"
                      style={{ position: "relative" }}
                    >
                      <Image src={form.imageUrl} alt="Preview" fill className="object-cover" />
                    </div>
                  )}
                </div>
                <input
                  type="url"
                  placeholder="Or paste external image URL"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full p-2 bg-white border border-[#E5DDE2] rounded-lg text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#43243F] mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={form.shortDescription}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  className="w-full p-2.5 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  className="accent-[#704568] w-4 h-4"
                />
                <label htmlFor="isPublished" className="font-semibold text-[#43243F] cursor-pointer">
                  Publish immediately to online storefront
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-[#704568] hover:bg-[#43243F] text-white font-semibold rounded-xl shadow-md transition"
              >
                {saving ? "Saving Product..." : editingProduct ? "Update Product" : "Create Product"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-[#6F6670]">Loading catalogue...</div>}>
      <ProductsContent />
    </Suspense>
  );
}

