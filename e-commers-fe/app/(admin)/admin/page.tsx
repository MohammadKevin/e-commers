"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Users, Store, ShoppingBag, Banknote, Clock, ArrowUpRight, ArrowDownRight, Download } from "lucide-react";

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

      try {
        const ordersRes = await api.get('/orders?limit=5');
        if (ordersRes.data?.data) {
          setRecentOrders(ordersRes.data.data);
        }
      } catch (err) {}

      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="font-medium text-sm">Memuat ringkasan sistem...</p>
      </div>
    );
  }

  const statCards = [
    { label: "Total Pengguna", value: stats.users.toLocaleString('id-ID'), icon: Users, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", trend: "+12.5%", isPositive: true },
    { label: "Toko Aktif", value: stats.stores.toLocaleString('id-ID'), icon: Store, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100", trend: "+5.2%", isPositive: true },
    { label: "Total Pesanan", value: stats.orders.toLocaleString('id-ID'), icon: ShoppingBag, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", trend: "+8.1%", isPositive: true },
    { label: "Total Pendapatan", value: `Rp ${stats.revenue.toLocaleString('id-ID')}`, icon: Banknote, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", trend: "-1.2%", isPositive: false },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Ringkasan Sistem</h1>
          <p className="text-sm text-gray-500 mt-1">Performa platform hari ini, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-slate-700 rounded-md text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm">
          <Download className="w-4 h-4" />
          Export Laporan
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Stats Grid - SaaS Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-md ${card.bg} ${card.border} border`}>
                  <Icon className={`w-5 h-5 ${card.color}`} strokeWidth={2.5} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${card.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  {card.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {card.trend}
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">{card.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{card.value}</h3>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Area */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
           <div className="p-5 border-b border-gray-100 flex justify-between items-center">
             <h3 className="text-base font-bold text-slate-800">Grafik Transaksi</h3>
             <select className="text-sm border-gray-200 rounded-md text-slate-600 focus:ring-blue-500 focus:border-blue-500">
               <option>7 Hari Terakhir</option>
               <option>Bulan Ini</option>
               <option>Tahun Ini</option>
             </select>
           </div>
           <div className="flex-1 p-5 flex items-center justify-center min-h-[300px]">
             <div className="text-center">
               <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                 <Banknote className="w-6 h-6 text-gray-300" />
               </div>
               <p className="text-gray-400 text-sm font-medium">Data grafik belum tersedia</p>
             </div>
           </div>
        </div>
        
        {/* Activity Feed */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
           <div className="p-5 border-b border-gray-100">
             <h3 className="text-base font-bold text-slate-800">Aktivitas Terbaru</h3>
           </div>
           <div className="flex-1 p-0">
             {recentOrders.length > 0 ? (
               <div className="divide-y divide-gray-100">
                 {recentOrders.map((order: any) => (
                   <div key={order.id} className="p-4 flex gap-3 items-start hover:bg-gray-50 transition-colors">
                     <div className="w-8 h-8 rounded bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                       <Clock className="w-4 h-4 text-gray-500" />
                     </div>
                     <div>
                       <p className="text-sm font-bold text-slate-800">
                         {order.orderNumber}
                       </p>
                       <p className="text-xs font-medium text-gray-500 mt-0.5">
                         {order.status} • Rp {Number(order.totalAmount || 0).toLocaleString('id-ID')}
                       </p>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="flex-1 p-5 flex items-center justify-center min-h-[300px]">
                 <div className="text-center">
                   <Clock className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                   <p className="text-gray-400 text-sm font-medium">Belum ada aktivitas</p>
                 </div>
               </div>
             )}
           </div>
           <div className="p-3 border-t border-gray-100 text-center">
             <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">Lihat Semua Aktivitas</button>
           </div>
        </div>
      </div>

    </div>
  );
}
