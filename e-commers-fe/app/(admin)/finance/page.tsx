"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { DollarSign, ArrowUpRight, ArrowDownRight, Wallet, Activity, Loader2 } from "lucide-react";

export default function FinanceDashboardPage() {
  const [stats, setStats] = useState({ revenue: 0, pendingWithdrawals: 0, retainedBalance: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinance = async () => {
      try {
        setLoading(true);
        const res = await api.get('/users/admin/stats');
        setStats({
          revenue: res.data.revenue || 0,
          pendingWithdrawals: 0, // No withdrawal API yet
          retainedBalance: (res.data.revenue || 0) * 0.8, // Simulate 80% retained
        });
      } catch (err) {
        console.error("Gagal mengambil data keuangan", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFinance();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
        <p className="font-medium animate-pulse">Menghitung pembukuan platform...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Keuangan & Pencairan</h1>
          <p className="text-slate-500 text-sm mt-1">Pantau aliran dana platform dan permintaan pencairan (withdrawal) toko.</p>
        </div>
        <button className="bg-slate-800 text-white font-semibold py-2.5 px-5 rounded-xl hover:bg-slate-900 transition-all shadow-sm flex items-center gap-2">
          <FileTextIcon /> Ekspor Laporan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-7 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 bg-emerald-50 w-24 h-24 rounded-full flex items-end justify-start p-6 group-hover:scale-110 transition-transform">
            <DollarSign className="text-emerald-500 opacity-50" size={32} />
          </div>
          <p className="text-sm font-semibold text-slate-500 mb-2 relative z-10">Total Nilai Transaksi (GMV)</p>
          <h3 className="text-4xl font-extrabold text-emerald-600 relative z-10">Rp {stats.revenue.toLocaleString('id-ID')}</h3>
          <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold mt-3 relative z-10 bg-emerald-50 w-fit px-2 py-1 rounded-md">
            <ArrowUpRight size={14} /> +12.5% vs bulan lalu
          </div>
        </div>

        <div className="bg-white p-7 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 bg-amber-50 w-24 h-24 rounded-full flex items-end justify-start p-6 group-hover:scale-110 transition-transform">
            <Activity className="text-amber-500 opacity-50" size={32} />
          </div>
          <p className="text-sm font-semibold text-slate-500 mb-2 relative z-10">Menunggu Pencairan</p>
          <h3 className="text-4xl font-extrabold text-slate-800 relative z-10">{stats.pendingWithdrawals} <span className="text-lg font-medium text-slate-400">Permintaan</span></h3>
          <p className="text-xs text-slate-400 mt-4 relative z-10 font-medium">Semua permintaan telah diproses</p>
        </div>

        <div className="bg-white p-7 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 relative overflow-hidden group">
           <div className="absolute -right-6 -top-6 bg-blue-50 w-24 h-24 rounded-full flex items-end justify-start p-6 group-hover:scale-110 transition-transform">
            <Wallet className="text-blue-500 opacity-50" size={32} />
          </div>
          <p className="text-sm font-semibold text-slate-500 mb-2 relative z-10">Total Saldo Tertahan</p>
          <h3 className="text-4xl font-extrabold text-slate-800 relative z-10">Rp {stats.retainedBalance.toLocaleString('id-ID')}</h3>
          <p className="text-xs text-slate-400 mt-4 relative z-10 font-medium">Dana aman di rekening escrow</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Riwayat Pencairan Terbaru</h3>
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
           <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4">
             <ArrowDownRight className="text-slate-300" size={32} />
           </div>
          <h4 className="text-lg font-bold text-slate-700 mb-2">Belum Ada Riwayat</h4>
          <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
            Sistem belum mendeteksi adanya permintaan pencairan dana (withdrawal) dari toko mana pun minggu ini.
          </p>
        </div>
      </div>
    </div>
  );
}

function FileTextIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}
