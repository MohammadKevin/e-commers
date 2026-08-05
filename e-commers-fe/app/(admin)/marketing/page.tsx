"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Ticket, Percent, Plus, Tag, Calendar, Loader2 } from "lucide-react";

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
    const fetchVouchers = async () => {
      try {
        setLoading(true);
        // We use public GET /vouchers endpoint
        const res = await api.get('/vouchers');
        setVouchers(res.data || []);
      } catch (err) {
        console.error("Gagal mengambil data voucher", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Kampanye Pemasaran</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola voucher diskon global, banner promosi, dan loyalitas.</p>
        </div>
        <button className="bg-pink-600 text-white font-semibold py-2.5 px-5 rounded-xl hover:bg-pink-700 transition-all shadow-sm hover:shadow-pink-600/20 flex items-center gap-2">
          <Plus size={18} /> Buat Kupon Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-7 rounded-3xl shadow-md text-white relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform">
            <Ticket size={120} />
          </div>
          <p className="text-sm font-medium text-pink-100 mb-2 relative z-10">Voucher Diskon Aktif</p>
          <h3 className="text-5xl font-extrabold relative z-10">{vouchers.length}</h3>
          <p className="text-xs text-pink-100 mt-4 relative z-10 bg-white/20 w-fit px-3 py-1.5 rounded-lg backdrop-blur-sm">
            Siap digunakan pembeli
          </p>
        </div>
        <div className="bg-white p-7 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 relative overflow-hidden group">
           <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
            <Percent size={120} className="text-slate-900" />
          </div>
          <p className="text-sm font-semibold text-slate-500 mb-2 relative z-10">Total Penggunaan Kupon</p>
          <h3 className="text-5xl font-extrabold text-slate-800 relative z-10">{totalUsed}</h3>
          <p className="text-xs text-emerald-500 mt-4 font-bold relative z-10 bg-emerald-50 w-fit px-3 py-1.5 rounded-lg border border-emerald-100">
            Kupon berhasil diklaim
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Daftar Voucher Tersedia</h3>
        
        {vouchers.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4">
               <Tag className="text-slate-300" size={32} />
             </div>
            <h4 className="text-lg font-bold text-slate-700 mb-2">Belum Ada Kupon</h4>
            <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
              Tingkatkan penjualan dengan membagikan voucher diskon menarik kepada pelanggan.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {vouchers.map(voucher => (
              <div key={voucher.id} className="p-5 border border-slate-200 rounded-2xl flex flex-col justify-between bg-white hover:border-pink-300 transition-colors shadow-sm">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-extrabold text-lg text-slate-800 bg-pink-50 text-pink-600 px-3 py-1 rounded-lg border border-pink-100 tracking-wider">
                      {voucher.code}
                    </span>
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      Aktif
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-700 mt-2">
                    {voucher.discountPercent ? `Diskon ${voucher.discountPercent}%` : `Diskon Rp ${voucher.discountAmount?.toLocaleString('id-ID')}`}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Min. belanja Rp {voucher.minPurchase ? voucher.minPurchase.toLocaleString('id-ID') : 0}
                  </p>
                </div>
                
                <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} /> 
                    {new Date(voucher.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </div>
                  <div className="bg-slate-100 text-slate-600 px-2 py-1 rounded">
                    Terpakai {voucher.usedCount}/{voucher.quota}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
