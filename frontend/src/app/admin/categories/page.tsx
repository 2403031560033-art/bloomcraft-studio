"use client";

import React, { useEffect, useState } from "react";
import { Plus, Edit2, CheckCircle, XCircle, Layers, X } from "lucide-react";
import { slugify } from "@/lib/utils";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchCategories = () => {
    setLoading(true);
    fetch("/api/v1/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (cat?: any) => {
    if (cat) {
      setEditingCategory(cat);
      setName(cat.name);
      setSlug(cat.slug);
      setDescription(cat.description || "");
    } else {
      setEditingCategory(null);
      setName("");
      setSlug("");
      setDescription("");
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name,
        slug: slug || slugify(name),
        description,
        isActive: true,
      };

      let res;
      if (editingCategory) {
        res = await fetch(`/api/v1/categories/${editingCategory._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/v1/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setModalOpen(false);
        fetchCategories();
      } else {
        const err = await res.json();
        alert(err.error?.message || "Failed to save category");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#43243F]">
            Product Categories
          </h1>
          <p className="text-xs text-[#6F6670] mt-0.5">
            Organize handmade collections displayed in storefront filters and navigation.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-[#704568] hover:bg-[#43243F] text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5DDE2] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFFBF8] text-[#6F6670] border-b border-[#E5DDE2]">
              <tr>
                <th className="py-3 px-4">Category Name</th>
                <th className="py-3 px-4">URL Slug</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#6F6670]">
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#6F6670]">
                    No categories created yet.
                  </td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c._id} className="hover:bg-[#FFFBF8]/80 transition">
                    <td className="py-3 px-4 font-bold text-[#43243F]">{c.name}</td>
                    <td className="py-3 px-4 font-mono text-[#704568]">/{c.slug}</td>
                    <td className="py-3 px-4 text-[#6F6670]">{c.description || "—"}</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-bold uppercase">
                        Active
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenModal(c)}
                        className="p-1.5 text-[#704568] hover:bg-[#F6E4EC] rounded-lg transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif font-bold text-lg text-[#43243F]">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h3>
              <button onClick={() => setModalOpen(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Torans & Wall Hangings"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingCategory) setSlug(slugify(e.target.value));
                  }}
                  className="w-full p-2.5 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Slug *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full p-2.5 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-[#704568] hover:bg-[#43243F] text-white font-semibold rounded-xl"
              >
                {saving ? "Saving..." : "Save Category"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

