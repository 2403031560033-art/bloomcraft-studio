"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Sparkles,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  ArrowRight,
  Clock,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  X,
} from "lucide-react";
import { formatPaise, getStatusColor, INDIAN_STATES } from "@/lib/utils";

export default function AdminCustomRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [quotePrice, setQuotePrice] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Convert to order state
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [convertAddress, setConvertAddress] = useState({
    recipientName: "",
    phoneE164: "",
    addressLine1: "",
    city: "Jhansi",
    state: "Uttar Pradesh",
    postalCode: "",
  });

  const fetchRequests = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("q", search);

    fetch(`/api/v1/admin/custom-requests?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRequests(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, search]);

  const handleOpenDetail = (req: any) => {
    setSelectedReq(req);
    setQuotePrice(req.quotePaise ? (req.quotePaise / 100).toString() : "");
    setAdminNotes(req.adminNotes || "");
    setNewStatus(req.status);
    setConvertAddress({
      recipientName: req.customerName,
      phoneE164: req.phoneE164,
      addressLine1: "",
      city: "Jhansi",
      state: "Uttar Pradesh",
      postalCode: "",
    });
  };

  const handleUpdateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    setUpdating(true);
    setUpdateError(null);

    try {
      const payload: any = {
        status: newStatus,
        adminNotes,
      };
      if (quotePrice) {
        payload.quotePaise = parseInt(quotePrice, 10) * 100;
      }

      const res = await fetch(`/api/v1/admin/custom-requests/${selectedReq._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to update custom request");
      }

      setSelectedReq(json.data);
      fetchRequests();
    } catch (err: any) {
      setUpdateError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleConvertToOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    try {
      const res = await fetch(`/api/v1/admin/custom-requests/${selectedReq._id}/convert-to-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: {
            ...convertAddress,
            countryCode: "IN",
          },
          shippingPaise: 0,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Conversion failed");
      }

      setConvertModalOpen(false);
      setSelectedReq(null);
      fetchRequests();
      alert(`Successfully converted into Order #${json.data.order.orderNumber}!`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#43243F]">
          Custom Order Requests
        </h1>
        <p className="text-xs text-[#6F6670] mt-0.5">
          Review customer inquiries, provide quotes, and convert approved commissions into pipeline orders.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5DDE2] shadow-xs flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search by request #, name, phone, or occasion..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl focus:outline-none focus:border-[#A64D78]"
          />
          <Search className="w-4 h-4 text-[#6F6670] absolute left-3 top-3" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs p-2.5 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl focus:outline-none w-full md:w-auto"
        >
          <option value="">All Statuses</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="NEEDS_INFORMATION">Needs Information</option>
          <option value="QUOTED">Quoted</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="CONVERTED">Converted to Order</option>
          <option value="DECLINED">Declined</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-[#E5DDE2] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFFBF8] text-[#6F6670] border-b border-[#E5DDE2]">
              <tr>
                <th className="py-3 px-4">Request #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Occasion</th>
                <th className="py-3 px-4">Budget Range</th>
                <th className="py-3 px-4">Quote</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#6F6670]">
                    Loading requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#6F6670]">
                    No custom order requests match the criteria.
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r._id} className="hover:bg-[#FFFBF8]/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#704568]">
                      {r.requestNumber}
                    </td>
                    <td className="py-3 px-4 text-[#6F6670]">
                      {new Date(r.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#43243F]">{r.customerName}</div>
                      <div className="text-[10px] text-[#6F6670]">{r.phoneE164}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-[#43243F]">
                      {r.occasion || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-[#6F6670]">
                      {r.budgetMinPaise ? formatPaise(r.budgetMinPaise) : "₹0"} -{" "}
                      {r.budgetMaxPaise ? formatPaise(r.budgetMaxPaise) : "Open"}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#704568]">
                      {r.quotePaise ? formatPaise(r.quotePaise) : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getStatusColor(
                          r.status
                        )}`}
                      >
                        {r.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenDetail(r)}
                        className="p-1.5 text-[#704568] hover:bg-[#F6E4EC] rounded-lg transition"
                        title="View and Manage"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Detail & Quotation Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-[#E5DDE2] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#A64D78] tracking-wider">
                  Custom Request Details
                </span>
                <h2 className="font-mono text-xl font-bold text-[#43243F]">
                  #{selectedReq.requestNumber}
                </h2>
              </div>
              <button
                onClick={() => setSelectedReq(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Description Details */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-[#FFFBF8] p-4 rounded-2xl border border-[#E5DDE2]">
                <div>
                  <h4 className="font-bold text-[#43243F] mb-1">Customer</h4>
                  <p className="font-semibold">{selectedReq.customerName}</p>
                  <p className="text-[#6F6670]">{selectedReq.phoneE164}</p>
                  {selectedReq.email && <p className="text-[#6F6670]">{selectedReq.email}</p>}
                </div>
                <div>
                  <h4 className="font-bold text-[#43243F] mb-1">Occasion & Timing</h4>
                  <p>Occasion: <strong>{selectedReq.occasion || "Not specified"}</strong></p>
                  <p>
                    Required By:{" "}
                    <strong>
                      {selectedReq.requiredBy
                        ? new Date(selectedReq.requiredBy).toLocaleDateString("en-IN")
                        : "Flexible"}
                    </strong>
                  </p>
                  <p>
                    Palette:{" "}
                    <strong>{selectedReq.preferredColours?.join(", ") || "Open to suggestions"}</strong>
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[#43243F] mb-1">Gift Vision Description:</h4>
                <div className="p-4 bg-[#FFFBF8] rounded-xl border border-[#E5DDE2] text-[#261F26] leading-relaxed">
                  {selectedReq.description}
                </div>
              </div>

              {/* Inspiration Image (Cloudinary) */}
              {selectedReq.inspirationImageUrl && (
                <div>
                  <h4 className="font-bold text-[#43243F] mb-2">Customer Inspiration Image:</h4>
                  <div
                    className="relative w-48 h-48 rounded-2xl overflow-hidden border border-[#E5DDE2]"
                    style={{ position: "relative" }}
                  >
                    <Image
                      src={selectedReq.inspirationImageUrl}
                      alt="Customer Inspiration"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Management & Quotation Form */}
            <div className="bg-[#F6E4EC]/30 p-5 rounded-2xl border border-[#A64D78]/20 space-y-4">
              <h4 className="font-serif font-bold text-sm text-[#43243F]">
                Studio Workflow & Quotation
              </h4>

              {updateError && (
                <div className="p-3 bg-[#A33D4A]/10 border border-[#A33D4A]/30 rounded-xl text-xs text-[#A33D4A] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{updateError}</span>
                </div>
              )}

              <form onSubmit={handleUpdateRequest} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#43243F] mb-1">Workflow Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full p-2.5 bg-white border border-[#E5DDE2] rounded-xl focus:outline-none"
                    >
                      <option value="SUBMITTED">SUBMITTED</option>
                      <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                      <option value="NEEDS_INFORMATION">NEEDS_INFORMATION</option>
                      <option value="QUOTED">QUOTED (Quote sent to patron)</option>
                      <option value="ACCEPTED">ACCEPTED (Patron agreed)</option>
                      <option value="DECLINED">DECLINED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#43243F] mb-1">
                      Agreed Quote (₹ INR)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 1200"
                      value={quotePrice}
                      onChange={(e) => setQuotePrice(e.target.value)}
                      className="w-full p-2.5 bg-white border border-[#E5DDE2] rounded-xl focus:outline-none font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#43243F] mb-1">
                    Internal Studio Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Discussed with patron on WhatsApp. Agreed on 5 lilac daisies with baby pink wrapper."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#E5DDE2] rounded-xl focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 py-2.5 bg-[#704568] hover:bg-[#43243F] text-white font-semibold rounded-xl transition"
                  >
                    {updating ? "Saving..." : "Save Status & Notes"}
                  </button>

                  {(newStatus === "ACCEPTED" || selectedReq.status === "ACCEPTED") && (
                    <button
                      type="button"
                      onClick={() => setConvertModalOpen(true)}
                      className="px-5 py-2.5 bg-[#28734D] hover:bg-green-800 text-white font-semibold rounded-xl transition flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Convert to Pipeline Order</span>
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Convert to Order Address Modal */}
      {convertModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4">
            <h3 className="font-serif font-bold text-lg text-[#43243F]">
              Confirm Shipping Address for Converted Order
            </h3>
            <form onSubmit={handleConvertToOrder} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Recipient Name *</label>
                <input
                  type="text"
                  required
                  value={convertAddress.recipientName}
                  onChange={(e) =>
                    setConvertAddress({ ...convertAddress, recipientName: e.target.value })
                  }
                  className="w-full p-2.5 border border-[#E5DDE2] rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  placeholder="Address Line 1"
                  value={convertAddress.addressLine1}
                  onChange={(e) =>
                    setConvertAddress({ ...convertAddress, addressLine1: e.target.value })
                  }
                  className="w-full p-2.5 border border-[#E5DDE2] rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={convertAddress.city}
                    onChange={(e) => setConvertAddress({ ...convertAddress, city: e.target.value })}
                    className="w-full p-2.5 border border-[#E5DDE2] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">PIN Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="284001"
                    value={convertAddress.postalCode}
                    onChange={(e) =>
                      setConvertAddress({ ...convertAddress, postalCode: e.target.value })
                    }
                    className="w-full p-2.5 border border-[#E5DDE2] rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConvertModalOpen(false)}
                  className="w-1/2 py-2.5 border border-gray-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-[#28734D] text-white font-bold rounded-xl"
                >
                  Confirm & Convert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

