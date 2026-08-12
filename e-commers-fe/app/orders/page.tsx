"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Header from "@/components/Header";
import {
  Loader2, Package, PackageOpen, ChevronDown, ChevronUp,
  CreditCard, CheckCircle2, Truck,
} from "lucide-react";

// ── Real Leaflet map — no SSR ─────────────────────────────────────
const TrackingMap = dynamic(() => import("@/components/TrackingMap"), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl flex items-center justify-center border border-slate-200">
      <div className="flex flex-col items-center gap-2 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
        <p className="text-xs font-medium">Memuat peta pengiriman...</p>
      </div>
    </div>
  ),
});

// ── Types ─────────────────────────────────────────────────────────
interface OrderItem {
  id: string; quantity: number; price: number;
  productName?: string; variantName?: string; imageUrl?: string;
}
interface Order {
  id: string; orderNumber?: string; status: string; totalAmount: number;
  createdAt: string; updatedAt: string;
  store?: { name: string; city?: string };
  items?: OrderItem[];
  payment?: { status: string; paymentMethod?: string };
  shipment?: { trackingNumber?: string; courierName?: string; shippedAt?: string };
  shippingCity?: string; shippingRecipient?: string;
}

// ── Config ────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING_PAYMENT: { label: "Belum Dibayar", color: "bg-amber-100 text-amber-700 border-amber-200" },
  PAID:            { label: "Dibayar",        color: "bg-blue-100 text-blue-700 border-blue-200" },
  PROCESSING:      { label: "Diproses",       color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  SHIPPED:         { label: "Dikirim",        color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  DELIVERED:       { label: "Diterima",       color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  CANCELLED:       { label: "Dibatalkan",     color: "bg-red-100 text-red-700 border-red-200" },
  REFUNDED:        { label: "Dikembalikan",   color: "bg-slate-100 text-slate-600 border-slate-200" },
};

const STATUS_TABS = ["Semua","PENDING_PAYMENT","PAID","PROCESSING","SHIPPED","DELIVERED","CANCELLED"];

// ── Toast ─────────────────────────────────────────────────────────
function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div className={`fixed top-24 right-6 z-[100] px-5 py-3 rounded-2xl shadow-xl text-white text-sm font-semibold flex items-center gap-2
      ${type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
      {type === "success" ? "✅" : "❌"} {message}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Semua");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.push("/login"); return; }
    fetchOrders();
  }, []);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/orders");
      setOrders(Array.isArray(res.data) ? res.data : res.data?.orders || []);
    } catch { showToast("Gagal memuat pesanan", "error"); }
    finally { setLoading(false); }
  };

  const confirmReceived = async (orderId: string) => {
    setConfirming(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: "DELIVERED" });
      showToast("Pesanan dikonfirmasi diterima!", "success");
      fetchOrders();
    } catch (e: any) {
      showToast(e.response?.data?.message || "Gagal konfirmasi", "error");
    } finally { setConfirming(null); }
  };

  const filtered = activeTab === "Semua" ? orders : orders.filter(o => o.status === activeTab);

  const fmt = (d: string) => d
    ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />
      {toast && <Toast message={toast.message} type={toast.type} />}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center gap-3">
          <Package className="w-7 h-7 text-cyan-600" /> Pesanan Saya
        </h1>

        {/* Status Tabs */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar mb-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-1">
          {STATUS_TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0
                ${activeTab === tab ? "bg-cyan-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"}`}>
              {tab === "Semua" ? "Semua" : STATUS_CONFIG[tab]?.label || tab}
              {tab !== "Semua" && (
                <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab ? "bg-white/20" : "bg-slate-100"}`}>
                  {orders.filter(o => o.status === tab).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 gap-4">
            <PackageOpen className="w-16 h-16 text-slate-200" />
            <p className="text-slate-500 font-medium">Belum ada pesanan</p>
            <Link href="/" className="px-5 py-2.5 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-700 transition-colors text-sm">
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map(order => {
              const cfg        = STATUS_CONFIG[order.status] || { label: order.status, color: "bg-slate-100 text-slate-600 border-slate-200" };
              const isExpanded = expandedOrder === order.id;

              return (
                <div key={order.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

                  {/* Card header */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-mono font-bold text-slate-400">
                            {order.orderNumber || order.id.slice(0, 10).toUpperCase()}
                          </span>
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-700">{order.store?.name || "—"}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{fmt(order.createdAt)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-slate-400">Total</p>
                        <p className="text-lg font-extrabold text-slate-800">
                          Rp {Number(order.totalAmount).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>

                    {/* Item thumbnails */}
                    {order.items && order.items.length > 0 && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex -space-x-2">
                          {order.items.slice(0, 3).map((item, i) => (
                            <div key={item.id} className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 border-2 border-white relative shrink-0"
                              style={{ zIndex: 30 - i * 10 }}>
                              {item.imageUrl
                                ? <Image src={item.imageUrl} alt="" fill className="object-cover" />
                                : <div className="w-full h-full flex items-center justify-center"><PackageOpen className="w-4 h-4 text-slate-300" /></div>}
                            </div>
                          ))}
                        </div>
                        <span className="text-xs text-slate-500 truncate">
                          {order.items[0]?.productName}
                          {order.items.length > 1 && ` +${order.items.length - 1} lainnya`}
                        </span>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 flex-wrap">
                      {order.status === "PENDING_PAYMENT" && (
                        <Link href={`/payment/${order.id}`}
                          className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 text-white text-xs font-bold rounded-xl hover:bg-cyan-700 transition-colors">
                          <CreditCard className="w-3.5 h-3.5" /> Bayar Sekarang
                        </Link>
                      )}
                      {order.status === "SHIPPED" && (
                        <button onClick={() => confirmReceived(order.id)} disabled={confirming === order.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50">
                          {confirming === order.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <CheckCircle2 className="w-3.5 h-3.5" />}
                          Konfirmasi Diterima
                        </button>
                      )}
                      <button onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                        className="flex items-center gap-1 px-3 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-200 transition-colors ml-auto">
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        {isExpanded ? "Tutup" : "Detail"}
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/60 p-5 space-y-5">

                      {/* ── LEAFLET MAP TRACKING ── */}
                      {["PROCESSING","SHIPPED","DELIVERED"].includes(order.status) && (
                        <div>
                          <p className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3">
                            <Truck className="w-4 h-4 text-cyan-600" /> Tracking Pengiriman Realtime
                          </p>
                          <TrackingMap
                            originCity={order.store?.city || "Jakarta Selatan"}
                            destCity={order.shippingCity || "Jakarta"}
                            status={order.status}
                            createdAt={order.createdAt}
                            updatedAt={order.updatedAt}
                            shippedAt={order.shipment?.shippedAt}
                            orderNumber={order.orderNumber}
                            courierName={order.shipment?.courierName}
                          />
                        </div>
                      )}

                      {/* Item list */}
                      {order.items && order.items.length > 0 && (
                        <div>
                          <h3 className="text-sm font-bold text-slate-700 mb-3">Detail Produk</h3>
                          <div className="flex flex-col gap-3">
                            {order.items.map(item => (
                              <div key={item.id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-slate-100">
                                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                                  {item.imageUrl
                                    ? <Image src={item.imageUrl} alt="" fill className="object-cover" />
                                    : <div className="w-full h-full flex items-center justify-center"><PackageOpen className="w-5 h-5 text-slate-300" /></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-slate-800 truncate">{item.productName}</p>
                                  <p className="text-xs text-slate-400">{item.variantName} · ×{item.quantity}</p>
                                </div>
                                <p className="text-sm font-bold text-slate-700 shrink-0">
                                  Rp {(Number(item.price) * item.quantity).toLocaleString("id-ID")}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Payment info */}
                      {order.payment && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 bg-white rounded-xl p-3 border border-slate-100">
                          <span className="font-semibold">Metode Bayar:</span>
                          <span>{order.payment.paymentMethod?.replace(/_/g, " ") || "—"}</span>
                          <span className={`ml-auto px-2 py-0.5 rounded-full font-bold ${
                            order.payment.status === "SUCCESS"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}>{order.payment.status}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
