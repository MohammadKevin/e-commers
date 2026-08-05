"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Users, Store, ShoppingBag, Banknote, Clock, Loader2 } from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    users: 0,
    stores: 0,
    orders: 0,
    revenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/users/admin/stats');
        setStats({
          users: res.data.users || 0,
          stores: res.data.stores || 0,
          orders: res.data.orders || 0,
          revenue: res.data.revenue || 0,
        });
      } catch (err) {
        setError("Gagal memuat data statistik dari server");
      }

      // Try fetching recent orders for activity feed
      try {
        const ordersRes = await api.get('/orders?limit=5');
        if (ordersRes.data?.data) {
          setRecentOrders(ordersRes.data.data);
        }
      } catch (err) {
        // Silent fail — orders endpoint may not be available
      }

      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-500 mb-4" />
        <p className="font-medium animate-pulse">Memuat ringkasan sistem...</p>
      </div>
    );
  }

  const statCards = [
    { label: "Total Pengguna", value: stats.users.toLocaleString('id-ID'), icon: Users, color: "cyan", growth: "+12% bulan ini" },
    { label: "Toko Aktif", value: stats.stores.toLocaleString('id-ID'), icon: Store, color: "blue", growth: "5 toko baru" },
    { label: "Total Pesanan", value: stats.orders.toLocaleString('id-ID'), icon: ShoppingBag, color: "amber", growth: "Data sepanjang waktu" },
    { label: "Total Pendapatan", value: `Rp ${stats.revenue.toLocaleString('id-ID')}`, icon: Banknote, color: "emerald", growth: "+8.5% dari bulan lalu" },
  ];

  const colorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
    cyan: { bg: "bg-cyan-50", text: "text-cyan-600", iconBg: "bg-cyan-100" },
    blue: { bg: "bg-blue-50", text: "text-blue-600", iconBg: "bg-blue-100" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", iconBg: "bg-amber-100" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", iconBg: "bg-emerald-100" },
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Ringkasan Sistem</h1>
          <p className="text-slate-500 mt-1">Gambaran umum platform sakserShop hari ini.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
            Unduh Laporan
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          const colors = colorMap[card.color];
          return (
            <div key={card.label} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                <Icon className={`w-16 h-16 ${colors.text}`} />
              </div>
              <div className="relative z-10">
                <p className="text-sm font-medium text-slate-500 mb-1">{card.label}</p>
                <h3 className="text-3xl font-bold text-slate-800">{card.value}</h3>
                <p className="text-xs font-medium text-emerald-500 mt-2 flex items-center gap-1">
                  {card.growth}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
           <h3 className="text-lg font-bold text-slate-800 mb-4">Grafik Transaksi</h3>
           <div className="h-64 flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
             <p className="text-slate-400 text-sm">Grafik akan tampil saat data transaksi bertambah</p>
           </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
           <h3 className="text-lg font-bold text-slate-800 mb-4">Aktivitas Terbaru</h3>
           <div className="space-y-4">
             {recentOrders.length > 0 ? recentOrders.map((order: any) => (
               <div key={order.id} className="flex gap-3 items-start">
                 <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0 mt-0.5">
                   <Clock className="w-4 h-4" />
                 </div>
                 <div>
                   <p className="text-sm font-medium text-slate-800">
                     Pesanan #{order.orderNumber}
                   </p>
                   <p className="text-xs text-slate-500">
                     {order.status} • Rp {Number(order.totalAmount || 0).toLocaleString('id-ID')}
                   </p>
                 </div>
               </div>
             )) : (
               <div className="text-center py-8 text-slate-400 text-sm">
                 <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                 <p>Belum ada aktivitas tercatat</p>
               </div>
             )}
           </div>
        </div>
      </div>

    </div>
  );
}
