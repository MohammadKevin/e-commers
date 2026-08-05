"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { LifeBuoy, AlertTriangle, ShieldCheck, CheckCircle2, MessageSquare, Search, Loader2 } from "lucide-react";

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
      } catch (err) {
        console.error("Gagal memuat data operasional", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOpsData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
        <p className="font-medium animate-pulse">Mensinkronisasi tiket bantuan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Pusat Operasional & CS</h1>
          <p className="text-slate-500 text-sm mt-1">Pantau komplain, pengiriman bermasalah, dan tiket bantuan pelanggan.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari ID Tiket..." 
            className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4 group">
          <div className="p-3 bg-red-50 text-red-500 rounded-xl group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white transition-all">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Komplain Terbuka</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">0</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4 group">
          <div className="p-3 bg-amber-50 text-amber-500 rounded-xl group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all">
            <LifeBuoy size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tiket Menunggu</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">0</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4 group">
          <div className="p-3 bg-indigo-50 text-indigo-500 rounded-xl group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pesanan Dipantau</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.orders}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4 group">
          <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Selesai Hari Ini</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">0</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800">Tiket Prioritas Tinggi (Butuh Tindakan)</h3>
          <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Lihat Semua</button>
        </div>
        
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
           <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4">
             <MessageSquare className="text-slate-300" size={32} />
           </div>
          <h4 className="text-lg font-bold text-slate-700 mb-2">Semua Aman Terkendali!</h4>
          <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
            Tidak ada komplain atau tiket bantuan yang memerlukan perhatian Anda saat ini. Tim operasional bekerja dengan sangat baik.
          </p>
        </div>
      </div>
    </div>
  );
}
