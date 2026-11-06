"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  Plus,
  Eye,
  CheckCircle,
  Truck,
  Clock,
  X,
  AlertCircle,
  MessageCircle,
} from "lucide-react";
import { formatPaise, getStatusColor, INDIAN_STATES } from "@/lib/utils";

function OrdersContent() {
  const searchParams = useSearchParams();
  const openNewManual = searchParams.get("newManual") === "true";

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [search, setSearch] = useState("");

  // Modals
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [manualModalOpen, setManualModalOpen] = useState(openNewManual);
  const [transitioning, setTransitioning] = useState(false);
  const [transitionError, setTransitionError] = useState<string | null>(null);

  // Status transition form
  const [targetStatus, setTargetStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [trackingCarrier, setTrackingCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  // Manual order form
  const [manualForm, setManualForm] = useState({
    source: "INSTAGRAM",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    addressLine1: "",
    city: "Jhansi",
    state: "Uttar Pradesh",
    postalCode: "",
    itemTitle: "Handmade Crochet Bouquet",
    itemPrice: "799",
    itemQuantity: 1,
    paymentStatus: "PAID",
  });

  const fetchOrders = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (sourceFilter) params.set("source", sourceFilter);
    if (search) params.set("q", search);

    fetch(`/api/v1/admin/orders?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrders(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, sourceFilter, search]);

  const handleStatusTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !targetStatus) return;

    setTransitioning(true);
    setTransitionError(null);

    try {
      const res = await fetch(`/api/v1/admin/orders/${selectedOrder._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: targetStatus,
          note: statusNote || undefined,
          trackingCarrier: trackingCarrier || undefined,
          trackingNumber: trackingNumber || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to update status");
      }

      setSelectedOrder(json.data);
      fetchOrders();
      setStatusNote("");
      setTargetStatus("");
    } catch (err: any) {
      setTransitionError(err.message || "Transition failed");
    } finally {
      setTransitioning(false);
    }
  };

  const handleManualOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        source: manualForm.source,
        customerName: manualForm.customerName,
        customerPhone: manualForm.customerPhone,
        customerEmail: manualForm.customerEmail || undefined,
        shippingAddress: {
          recipientName: manualForm.customerName,
          phoneE164: manualForm.customerPhone,
          addressLine1: manualForm.addressLine1,
          city: manualForm.city,
          state: manualForm.state,
          postalCode: manualForm.postalCode,
          countryCode: "IN",
        },
        items: [
          {
            productName: manualForm.itemTitle,
            unitPricePaise: parseInt(manualForm.itemPrice, 10) * 100,
            quantity: manualForm.itemQuantity,
          },
        ],
        shippingPaise: 0,
        discountPaise: 0,
        paymentStatus: manualForm.paymentStatus,
      };

      const res = await fetch("/api/v1/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to create manual order");
      }

      setManualModalOpen(false);
      fetchOrders();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Manual Entry Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#43243F]">
            Order Management
          </h1>
          <p className="text-xs text-[#6F6670] mt-0.5">
            Manage incoming orders from website checkout, Instagram DMs, and WhatsApp.
          </p>
        </div>

        <button
          onClick={() => setManualModalOpen(true)}
          className="px-4 py-2 bg-[#704568] hover:bg-[#43243F] text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record DM / Manual Order</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5DDE2] shadow-xs flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search by order #, customer name, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl focus:outline-none focus:border-[#A64D78]"
          />
          <Search className="w-4 h-4 text-[#6F6670] absolute left-3 top-3" />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs p-2.5 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="PLACED">Placed</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="IN_PRODUCTION">In Production</option>
            <option value="READY_TO_DISPATCH">Ready to Dispatch</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="text-xs p-2.5 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl focus:outline-none"
          >
            <option value="">All Channels</option>
            <option value="WEBSITE">Website</option>
            <option value="INSTAGRAM">Instagram</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="MANUAL">Manual</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-[#E5DDE2] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFFBF8] text-[#6F6670] border-b border-[#E5DDE2]">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#6F6670]">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#6F6670]">
                    No orders match the selected filters.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o._id} className="hover:bg-[#FFFBF8]/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#704568]">
                      {o.orderNumber}
                    </td>
                    <td className="py-3 px-4 text-[#6F6670]">
                      {new Date(o.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 font-semibold text-gray-700">
                        {o.source}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#43243F]">{o.customerNameSnapshot}</div>
                      <div className="text-[10px] text-[#6F6670]">{o.customerPhoneSnapshot}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          o.paymentStatus === "PAID"
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getStatusColor(
                          o.orderStatus
                        )}`}
                      >
                        {o.orderStatus.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[#43243F]">
                      {formatPaise(o.totalPaise)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="p-1.5 text-[#704568] hover:bg-[#F6E4EC] rounded-lg transition"
                        title="View & Update"
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

      {/* Order Detail & Transition Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-[#E5DDE2] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#A64D78] tracking-wider">
                  Order Details & Pipeline
                </span>
                <h2 className="font-mono text-xl font-bold text-[#43243F]">
                  #{selectedOrder.orderNumber}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Address Snapshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#FFFBF8] p-4 rounded-2xl border border-[#E5DDE2]">
              <div>
                <h4 className="font-bold text-[#43243F] mb-1">Customer Snapshot</h4>
                <p className="font-semibold text-sm">{selectedOrder.customerNameSnapshot}</p>
                <p className="text-[#6F6670]">{selectedOrder.customerPhoneSnapshot}</p>
                {selectedOrder.customerEmailSnapshot && (
                  <p className="text-[#6F6670]">{selectedOrder.customerEmailSnapshot}</p>
                )}
              </div>
              <div>
                <h4 className="font-bold text-[#43243F] mb-1">Shipping Snapshot</h4>
                <p>{selectedOrder.shippingAddressSnapshot?.addressLine1}</p>
                <p>
                  {selectedOrder.shippingAddressSnapshot?.city},{" "}
                  {selectedOrder.shippingAddressSnapshot?.state} -{" "}
                  {selectedOrder.shippingAddressSnapshot?.postalCode}
                </p>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-[#43243F]">Items in Order</h4>
              <div className="divide-y divide-gray-100 border border-[#E5DDE2] rounded-xl overflow-hidden">
                {selectedOrder.items?.map((item: any, i: number) => (
                  <div key={i} className="p-3 flex justify-between items-center bg-white">
                    <div>
                      <span className="font-semibold text-[#43243F]">{item.productNameSnapshot}</span>
                      {item.variantSnapshot && (
                        <p className="text-[11px] text-[#6F6670]">Style: {item.variantSnapshot.name}</p>
                      )}
                      {item.personalisation && (
                        <p className="text-[10px] text-[#A64D78]">
                          Custom: {JSON.stringify(item.personalisation)}
                        </p>
                      )}
                      <p className="text-[#6F6670]">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-[#43243F]">{formatPaise(item.lineTotalPaise)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Transition Control */}
            <div className="bg-[#F6E4EC]/30 p-5 rounded-2xl border border-[#A64D78]/20 space-y-4">
              <h4 className="font-serif font-bold text-sm text-[#43243F]">
                Update Fulfilment Stage
              </h4>

              {transitionError && (
                <div className="p-3 bg-[#A33D4A]/10 border border-[#A33D4A]/30 rounded-xl text-xs text-[#A33D4A] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{transitionError}</span>
                </div>
              )}

              <form onSubmit={handleStatusTransition} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#43243F] mb-1">
                      Target Status
                    </label>
                    <select
                      value={targetStatus}
                      onChange={(e) => setTargetStatus(e.target.value)}
                      required
                      className="w-full text-xs p-2.5 bg-white border border-[#E5DDE2] rounded-xl focus:outline-none"
                    >
                      <option value="">Select Next Status...</option>
                      <option value="CONFIRMED">CONFIRMED (Accepted)</option>
                      <option value="IN_PRODUCTION">IN_PRODUCTION (Handcrafting)</option>
                      <option value="READY_TO_DISPATCH">READY_TO_DISPATCH (Packed)</option>
                      <option value="SHIPPED">SHIPPED (Handed to Courier)</option>
                      <option value="DELIVERED">DELIVERED (Fulfilled)</option>
                      <option value="CANCELLED">CANCELLED</option>
                      <option value="ON_HOLD">ON_HOLD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#43243F] mb-1">
                      Audit Note (Internal)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Knitted 3 pink roses, packed with gift card"
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-[#E5DDE2] rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                {targetStatus === "SHIPPED" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-bold text-[#43243F] mb-1">
                        Courier Carrier
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Delhivery / BlueDart / India Post"
                        value={trackingCarrier}
                        onChange={(e) => setTrackingCarrier(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-[#E5DDE2] rounded-xl focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#43243F] mb-1">
                        Tracking / AWB Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. DEL123456789"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-[#E5DDE2] rounded-xl focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={transitioning}
                  className="w-full py-2.5 bg-[#704568] hover:bg-[#43243F] text-white text-xs font-semibold rounded-xl shadow-xs transition"
                >
                  {transitioning ? "Updating Status..." : "Apply Transition & Record Audit"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Manual Order Modal (Instagram / WhatsApp DMs) */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-3xl border border-[#E5DDE2] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#A64D78] tracking-wider">
                  Offline / Social Channel Sale
                </span>
                <h2 className="font-serif text-xl font-bold text-[#43243F]">
                  Record Social DM Order
                </h2>
              </div>
              <button
                onClick={() => setManualModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualOrderSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#43243F] mb-1">Order Source Channel</label>
                <select
                  value={manualForm.source}
                  onChange={(e) => setManualForm({ ...manualForm, source: e.target.value })}
                  className="w-full p-2.5 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl"
                >
                  <option value="INSTAGRAM">Instagram DM (@bloomcraftstudio_)</option>
                  <option value="WHATSAPP">WhatsApp Direct</option>
                  <option value="MANUAL">In-Person / Phone Call</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#43243F] mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pooja Sharma"
                    value={manualForm.customerName}
                    onChange={(e) => setManualForm({ ...manualForm, customerName: e.target.value })}
                    className="w-full p-2.5 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#43243F] mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={manualForm.customerPhone}
                    onChange={(e) => setManualForm({ ...manualForm, customerPhone: e.target.value })}
                    className="w-full p-2.5 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#43243F] mb-1">Delivery Address *</label>
                <input
                  type="text"
                  required
                  placeholder="Street / Colony"
                  value={manualForm.addressLine1}
                  onChange={(e) => setManualForm({ ...manualForm, addressLine1: e.target.value })}
                  className="w-full p-2.5 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#43243F] mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={manualForm.city}
                    onChange={(e) => setManualForm({ ...manualForm, city: e.target.value })}
                    className="w-full p-2.5 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#43243F] mb-1">State *</label>
                  <select
                    value={manualForm.state}
                    onChange={(e) => setManualForm({ ...manualForm, state: e.target.value })}
                    className="w-full p-2.5 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#43243F] mb-1">PIN Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="284001"
                    value={manualForm.postalCode}
                    onChange={(e) => setManualForm({ ...manualForm, postalCode: e.target.value })}
                    className="w-full p-2.5 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                <div className="col-span-2">
                  <label className="block font-bold text-[#43243F] mb-1">Item Title *</label>
                  <input
                    type="text"
                    required
                    value={manualForm.itemTitle}
                    onChange={(e) => setManualForm({ ...manualForm, itemTitle: e.target.value })}
                    className="w-full p-2.5 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#43243F] mb-1">Agreed Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={manualForm.itemPrice}
                    onChange={(e) => setManualForm({ ...manualForm, itemPrice: e.target.value })}
                    className="w-full p-2.5 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#43243F] mb-1">Payment Status</label>
                <select
                  value={manualForm.paymentStatus}
                  onChange={(e) => setManualForm({ ...manualForm, paymentStatus: e.target.value })}
                  className="w-full p-2.5 bg-[#FFFBF8] border border-[#E5DDE2] rounded-xl"
                >
                  <option value="PAID">PAID (UPI received on DM)</option>
                  <option value="UNPAID">UNPAID (Awaiting payment)</option>
                  <option value="COD_DUE">COD DUE (Pay on delivery)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#704568] hover:bg-[#43243F] text-white font-medium rounded-xl shadow-md transition"
              >
                Create Order & Enter Pipeline
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-[#6F6670]">Loading orders...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
