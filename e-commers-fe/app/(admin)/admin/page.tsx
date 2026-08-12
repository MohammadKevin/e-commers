"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Users, Store, ShoppingBag, Banknote, Clock, Loader2, TrendingUp, ArrowUpRight } from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ users: 0, stores: 0, orders: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await api.get("/users/admin/stats");
        setStats({
          users: res.data.users || 0,
          stores: res.data.stores || 0,
          orders: res.data.orders || 0,
          revenue: res.data.revenue || 0,
        });
      } catch {
        setError("Gagal memuat data statistik dari server");
      }
      try {
        const ordersRes = await api.get("/orders?limit=5");
        if (ordersRes.data?.data) setRecentOrders(ordersRes.data.data);
      } catch {}
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-500 mb-4" />
        <p className="font-medium animate-pulse">Memuat ringkasan sistem...</p>
      </div>
    );
  }

  const statCards = [
    { label: "Total Pengguna", value: stats.users.toLocaleString("id-ID"), icon: Users, gradient: "from-cyan-500 to-cyan-600", growth: "+12% bulan ini", sub: "Pengguna aktif" },
    { label: "Toko Aktif", value: stats.stores.toLocaleString("id-ID"), icon: Store, gradient: "from-blue-500 to-blue-600", growth: "5 toko baru", sub: "Dari berbagai kota" },
    { label: "Total Pesanan", value: stats.orders.toLocaleString("id-ID"), icon: ShoppingBag, gradient: "from-amber-500 to-orange-500", growth: "Sepanjang waktu", sub: "Semua status" },
    { label: "Total Pendapatan", value: `Rp ${stats.revenue.toLocaleString("id-ID")}`, icon: Banknote, gradient: "from-emerald-500 to-teal-500", growth: "+8.5% bulan lalu", sub: "Gross revenue" },
  ];

  const STATUS_COLOR: Record<string, string> = {
    PAID: "bg-emerald-100 text-emerald-700",
    PENDING_PAYMENT: "bg-amber-100 text-amber-700",
    PROCESSING: "bg-blue-100 text-blue-700",
    SHIPPED: "bg-cyan-100 text-cyan-700",
    DELIVERED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Ringkasan Sistem</h1>
          <p className="text-slate-500 mt-1 text-sm">Gambaran umum platform sakserShop hari ini.</p>
        </div>
        <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
          <TrendingUp size={15} /> Unduh Laporan
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-200 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group">
              <div className={`h-1.5 w-full bg-gradient-to-r ${card.gradient}`}></div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-sm`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    <ArrowUpRight size={12} />
                    {card.growth}
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-500 mb-1">{card.label}</p>
                <h3 className="text-2xl font-extrabold text-slate-800 leading-none">{card.value}</h3>
                <p className="text-xs text-slate-400 mt-2">{card.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Placeholder */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Grafik Transaksi</h3>
            <div className="flex gap-1.5">
              {["7H", "30H", "3B"].map((period, i) => (
                <button key={period} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  i === 1 ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}>
                  {period}
                </button>
              ))}
            </div>
          </div>
          {/* Simulated bar chart */}
          <div className="h-52 flex items-end justify-between gap-2 px-2">
            {[40, 65, 55, 80, 45, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-cyan-500 to-blue-400 opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                  style={{ height: `${h}%` }}
                ></div>
                <span className="text-[9px] text-slate-400 font-medium">{i + 1}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 text-center mt-2">Data simulasi — akan diisi dari data transaksi nyata</p>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-5">Aktivitas Terbaru</h3>
          <div className="space-y-3">
            {recentOrders.length > 0 ? recentOrders.map((order: any) => (
              <div key={order.id} className="flex gap-3 items-start p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0">
                  <Clock size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">Pesanan #{order.orderNumber}</p>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLOR[order.status] || "bg-slate-100 text-slate-600"}`}>
                      {order.status}
                    </span>
                    <span>Rp {Number(order.totalAmount || 0).toLocaleString("id-ID")}</span>
                  </p>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-slate-400">
                <Clock size={36} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">Belum ada aktivitas</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Lihat Pengguna", href: "/admin/users", color: "bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100" },
          { label: "Lihat Toko", href: "/admin/stores", color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" },
          { label: "Buat Voucher", href: "/marketing/vouchers", color: "bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100" },
          { label: "Cek Tiket CS", href: "/operations/tickets", color: "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100" },
        ].map(action => (
          <a
            key={action.label}
            href={action.href}
            className={`p-4 rounded-2xl border font-semibold text-sm text-center transition-colors ${action.color}`}
          >
            {action.label}
          </a>
        ))}
      </div>
    </div>
  );
}
