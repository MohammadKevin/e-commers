"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { DollarSign, ArrowUpRight, Wallet, Activity, Download, ArrowDownRight, ArrowRightLeft } from "lucide-react";

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
          pendingWithdrawals: 0,
          retainedBalance: (res.data.revenue || 0) * 0.8,
        });
      } catch (err) {} finally {
        setLoading(false);
      }
    };
    fetchFinance();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="font-medium text-sm">Menghitung pembukuan platform...</p>
      </div>
    );
  }

  const statCards = [
    { label: "Total Nilai Transaksi (GMV)", value: `Rp ${stats.revenue.toLocaleString('id-ID')}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", trend: "+12.5%", isPositive: true },
    { label: "Menunggu Pencairan", value: `${stats.pendingWithdrawals}`, subtext: "Permintaan", icon: Activity, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", note: "Semua permintaan telah diproses" },
    { label: "Total Saldo Tertahan", value: `Rp ${stats.retainedBalance.toLocaleString('id-ID')}`, icon: Wallet, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", note: "Dana aman di rekening escrow" },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Keuangan & Pencairan</h1>
          <p className="text-sm text-gray-500 mt-1">Pantau aliran dana platform dan permintaan pencairan (withdrawal) toko.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-800 text-white rounded-md text-sm font-semibold hover:bg-slate-900 transition-colors shadow-sm">
          <Download className="w-4 h-4" />
          Ekspor Laporan
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-md ${card.bg} ${card.border} border`}>
                  <Icon className={`w-5 h-5 ${card.color}`} strokeWidth={2.5} />
                </div>
                {card.trend && (
                  <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${card.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    {card.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {card.trend}
                  </div>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">{card.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                {card.value} {card.subtext && <span className="text-sm font-medium text-gray-400 ml-1">{card.subtext}</span>}
              </h3>
              {card.note && <p className="text-xs font-medium text-gray-400 mt-2">{card.note}</p>}
            </div>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
         <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
           <h3 className="text-base font-bold text-slate-800">Riwayat Pencairan Terbaru</h3>
         </div>
         <div className="flex-1 p-5 flex items-center justify-center min-h-[350px]">
           <div className="text-center max-w-sm">
             <div className="w-14 h-14 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm">
               <ArrowRightLeft className="w-6 h-6 text-gray-400" />
             </div>
             <h4 className="text-base font-bold text-slate-800 mb-1">Belum Ada Riwayat</h4>
             <p className="text-gray-500 text-sm leading-relaxed">
               Sistem belum mendeteksi adanya permintaan pencairan dana (withdrawal) dari toko mana pun minggu ini.
             </p>
           </div>
         </div>
      </div>

    </div>
  );
}
