"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { LifeBuoy, AlertTriangle, ShieldCheck, CheckCircle2, MessageSquare, Search } from "lucide-react";

export default function OperationsDashboardPage() {
  const [stats, setStats] = useState({ orders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOpsData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/users/admin/stats');
        setStats({
          orders: res.data.orders || 0,
        });
      } catch (err) {} finally {
        setLoading(false);
      }
    };
    fetchOpsData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="font-medium text-sm">Mensinkronisasi tiket bantuan...</p>
      </div>
    );
  }

  const statCards = [
    { label: "Komplain Terbuka", value: 0, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", border: "border-red-100" },
    { label: "Tiket Menunggu", value: 0, icon: LifeBuoy, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
    { label: "Pesanan Dipantau", value: stats.orders, icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    { label: "Selesai Hari Ini", value: 0, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Pusat Operasional & CS</h1>
          <p className="text-sm text-gray-500 mt-1">Pantau komplain, pengiriman bermasalah, dan tiket bantuan pelanggan.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Cari ID Tiket..." 
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-md ${card.bg} ${card.border} border`}>
                  <Icon className={`w-5 h-5 ${card.color}`} strokeWidth={2.5} />
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">{card.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{card.value}</h3>
            </div>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
         <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
           <h3 className="text-sm font-bold text-slate-700">Tiket Prioritas Tinggi (Butuh Tindakan)</h3>
           <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded">Lihat Semua</button>
         </div>
         <div className="flex-1 p-5 flex items-center justify-center min-h-[350px]">
           <div className="text-center max-w-sm">
             <div className="w-14 h-14 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm">
               <MessageSquare className="w-6 h-6 text-gray-400" />
             </div>
             <h4 className="text-base font-bold text-slate-800 mb-1">Semua Aman Terkendali!</h4>
             <p className="text-gray-500 text-sm leading-relaxed">
               Tidak ada komplain atau tiket bantuan yang memerlukan perhatian Anda saat ini. Tim operasional bekerja dengan sangat baik.
             </p>
           </div>
         </div>
      </div>

    </div>
  );
}
