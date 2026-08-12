"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Package, Clock, CheckCircle2, XCircle, Truck, Loader2,
  Search, Filter, RefreshCw, Eye, ChevronDown
} from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  subtotalAmount: number;
  shippingCost: number;
  shippingRecipient: string;
  shippingCity: string;
  shippingAddress: string;
  createdAt: string;
  items: {
    id: string;
    productName: string;
    variantName: string;
    quantity: number;
    price: number;
    imageUrl?: string;
  }[];
  buyer: {
    fullName: string;
    email: string;
  };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  PENDING_PAYMENT: { label: "Menunggu Bayar", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: Clock },
  PAID: { label: "Dibayar", color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: CheckCircle2 },
  PROCESSING: { label: "Diproses", color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200", icon: Package },
  SHIPPED: { label: "Dikirim", color: "text-cyan-600", bg: "bg-cyan-50 border-cyan-200", icon: Truck },
  DELIVERED: { label: "Selesai", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
  CANCELLED: { label: "Dibatalkan", color: "text-red-600", bg: "bg-red-50 border-red-200", icon: XCircle },
  REFUNDED: { label: "Refund", color: "text-slate-600", bg: "bg-slate-50 border-slate-200", icon: RefreshCw },
};

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const storeRes = await api.get("/stores/my-stores");
      if (storeRes.data?.length > 0) {
        const id = storeRes.data[0].id;
        setStoreId(id);
        const orderRes = await api.get(`/orders/store/${id}`);
        setOrders(orderRes.data?.data || orderRes.data || []);
      }
    } catch (err) {
      console.error("Gagal memuat pesanan:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert("Gagal update status pesanan");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filtered = orders.filter(o => {
    const matchSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.shippingRecipient.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="font-medium animate-pulse">Memuat pesanan masuk...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Pesanan Masuk</h1>
            <p className="text-slate-500 text-sm mt-1">Kelola dan proses semua pesanan dari pembeli.</p>
          </div>
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors text-sm font-medium">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { key: "ALL", label: "Semua", count: orders.length },
          { key: "PAID", label: "Baru", count: statusCounts.PAID || 0 },
          { key: "PROCESSING", label: "Diproses", count: statusCounts.PROCESSING || 0 },
          { key: "SHIPPED", label: "Dikirim", count: statusCounts.SHIPPED || 0 },
          { key: "DELIVERED", label: "Selesai", count: statusCounts.DELIVERED || 0 },
          { key: "CANCELLED", label: "Batal", count: statusCounts.CANCELLED || 0 },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              statusFilter === tab.key
                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300"
            }`}
          >
            {tab.label}
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
              statusFilter === tab.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
            }`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Cari nomor pesanan atau nama penerima..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm"
        />
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm">
          <Package size={56} className="text-slate-300 mx-auto mb-4" strokeWidth={1} />
          <h3 className="text-lg font-bold text-slate-700 mb-2">Belum Ada Pesanan</h3>
          <p className="text-slate-500 text-sm">Pesanan dari pembeli akan muncul di sini.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING_PAYMENT;
            const Icon = cfg.icon;
            const isExpanded = expandedOrder === order.id;

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Order Header */}
                <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl border ${cfg.bg}`}>
                      <Icon size={20} className={cfg.color} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-800">#{order.orderNumber}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {order.shippingRecipient} • {order.shippingCity} •{" "}
                        {new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-slate-800 text-lg">Rp {Number(order.totalAmount).toLocaleString("id-ID")}</p>
                      <p className="text-xs text-slate-400">{order.items?.length || 0} produk</p>
                    </div>
                    <button
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <ChevronDown size={18} className={`text-slate-500 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 bg-slate-50/50 space-y-4">
                    {/* Items */}
                    <div className="space-y-2">
                      {(order.items || []).map(item => (
                        <div key={item.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <Package size={18} />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-800 text-sm truncate">{item.productName}</p>
                            <p className="text-xs text-slate-500">{item.variantName} • x{item.quantity}</p>
                          </div>
                          <p className="font-bold text-slate-700 text-sm">Rp {Number(item.price * item.quantity).toLocaleString("id-ID")}</p>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Info */}
                    <div className="bg-white p-4 rounded-xl border border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Alamat Pengiriman</p>
                      <p className="font-semibold text-slate-800">{order.shippingRecipient}</p>
                      <p className="text-sm text-slate-600 mt-0.5">{order.shippingAddress}, {order.shippingCity}</p>
                    </div>

                    {/* Price Summary */}
                    <div className="bg-white p-4 rounded-xl border border-slate-100">
                      <div className="flex justify-between text-sm text-slate-600 mb-1">
                        <span>Subtotal</span>
                        <span>Rp {Number(order.subtotalAmount).toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex justify-between text-sm text-slate-600 mb-2">
                        <span>Ongkir</span>
                        <span>Rp {Number(order.shippingCost).toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-800 border-t border-slate-100 pt-2">
                        <span>Total</span>
                        <span>Rp {Number(order.totalAmount).toLocaleString("id-ID")}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-wrap">
                      {order.status === "PAID" && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, "PROCESSING")}
                          disabled={updatingStatus === order.id}
                          className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60 flex items-center gap-2"
                        >
                          {updatingStatus === order.id ? <Loader2 size={14} className="animate-spin" /> : <Package size={14} />}
                          Proses Pesanan
                        </button>
                      )}
                      {order.status === "PROCESSING" && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, "SHIPPED")}
                          disabled={updatingStatus === order.id}
                          className="px-4 py-2 bg-cyan-600 text-white text-sm font-semibold rounded-xl hover:bg-cyan-700 transition-colors disabled:opacity-60 flex items-center gap-2"
                        >
                          {updatingStatus === order.id ? <Loader2 size={14} className="animate-spin" /> : <Truck size={14} />}
                          Tandai Dikirim
                        </button>
                      )}
                      {(order.status === "PAID" || order.status === "PROCESSING") && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, "CANCELLED")}
                          disabled={updatingStatus === order.id}
                          className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 text-sm font-semibold rounded-xl hover:bg-red-100 transition-colors disabled:opacity-60"
                        >
                          Batalkan
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
