"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Ticket, Percent, Plus, Tag, Calendar, Loader2, TrendingUp, Users, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface Voucher {
  id: string;
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  minPurchase?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  quota: number;
  usedCount: number;
  isActive: boolean;
}

export default function MarketingDashboardPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await api.get("/vouchers");
        setVouchers(res.data || []);
      } catch (err) {
        console.error("Gagal mengambil data voucher", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-pink-500 mb-4" />
        <p className="font-medium animate-pulse">Memuat kampanye marketing...</p>
      </div>
    );
  }

  const totalUsed = vouchers.reduce((acc, curr) => acc + curr.usedCount, 0);
  const activeVouchers = vouchers.filter(v => v.isActive && new Date(v.endDate) > new Date());
  const totalQuota = vouchers.reduce((acc, curr) => acc + curr.quota, 0);
  const usageRate = totalQuota > 0 ? Math.round((totalUsed / totalQuota) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Kampanye Pemasaran</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola voucher diskon global, banner promosi, dan loyalitas.</p>
        </div>
        <Link
          href="/marketing/vouchers"
          className="bg-pink-600 text-white font-semibold py-2.5 px-5 rounded-xl hover:bg-pink-700 transition-all shadow-sm hover:shadow-pink-600/20 flex items-center gap-2"
        >
          <Plus size={18} /> Buat Kupon Baru
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Voucher Aktif", value: activeVouchers.length, icon: Ticket, color: "text-pink-600", bg: "bg-pink-50", badge: "Siap pakai" },
          { label: "Total Penggunaan", value: totalUsed, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50", badge: "Diklaim pembeli" },
          { label: "Total Kuota", value: totalQuota, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50", badge: "Tersedia" },
          { label: "Tingkat Pakai", value: `${usageRate}%`, icon: Percent, color: "text-amber-600", bg: "bg-amber-50", badge: "Dari total kuota" },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-11 h-11 ${item.bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={20} className={item.color} />
              </div>
              <p className="text-2xl font-extrabold text-slate-800">{item.value}</p>
              <p className="text-sm text-slate-500 mt-0.5">{item.label}</p>
              <p className="text-xs text-slate-400 mt-1">{item.badge}</p>
            </div>
          );
        })}
      </div>

      {/* Voucher List Preview */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800">Voucher Aktif Terbaru</h3>
          <Link href="/marketing/vouchers" className="text-sm font-semibold text-pink-600 hover:underline flex items-center gap-1">
            Kelola Semua <ArrowUpRight size={14} />
          </Link>
        </div>

        {vouchers.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-14 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4">
              <Tag className="text-slate-300" size={28} />
            </div>
            <h4 className="font-bold text-slate-700 mb-2">Belum Ada Kupon</h4>
            <p className="text-slate-500 text-sm max-w-sm mb-4">Tingkatkan penjualan dengan membagikan voucher diskon menarik.</p>
            <Link href="/marketing/vouchers" className="bg-pink-600 text-white font-semibold py-2.5 px-6 rounded-xl hover:bg-pink-700 transition-colors text-sm">
              Buat Voucher Pertama
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {vouchers.slice(0, 6).map(voucher => {
              const isExpired = new Date(voucher.endDate) < new Date();
              const usagePercent = Math.round((voucher.usedCount / voucher.quota) * 100);
              return (
                <div key={voucher.id} className="p-5 border border-slate-200 rounded-2xl bg-white hover:border-pink-200 hover:shadow-sm transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-extrabold text-pink-600 bg-pink-50 px-3 py-1.5 rounded-lg border border-pink-100 tracking-widest font-mono text-sm">
                      {voucher.code}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isExpired ? "bg-red-50 text-red-500 border-red-200" :
                      voucher.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                      "bg-slate-100 text-slate-500 border-slate-200"
                    }`}>
                      {isExpired ? "Kadaluarsa" : voucher.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-700">
                    {voucher.discountPercent ? `Diskon ${voucher.discountPercent}%` : `Diskon Rp ${Number(voucher.discountAmount).toLocaleString("id-ID")}`}
                  </p>
                  {voucher.minPurchase && (
                    <p className="text-xs text-slate-400 mt-0.5">Min. Rp {Number(voucher.minPurchase).toLocaleString("id-ID")}</p>
                  )}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Pakai {voucher.usedCount}/{voucher.quota}</span>
                      <span>{usagePercent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className="bg-pink-400 h-1.5 rounded-full" style={{ width: `${Math.min(usagePercent, 100)}%` }}></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400 mt-3">
                    <Calendar size={11} />
                    <span>Sampai {new Date(voucher.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
