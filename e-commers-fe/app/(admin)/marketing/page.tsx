"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Ticket, Percent, Plus, Tag, Calendar } from "lucide-react";

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
        const res = await api.get('/vouchers');
        setVouchers(res.data || []);
      } catch (err) {} finally {
        setLoading(false);
      }
    };
    fetchVouchers();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="font-medium text-sm">Memuat data pemasaran...</p>
      </div>
    );
  }

  const totalUsed = vouchers.reduce((acc, curr) => acc + curr.usedCount, 0);

  return (
    <div className="space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Kampanye Pemasaran</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola voucher diskon global, banner promosi, dan loyalitas.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 border border-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Buat Kupon Baru
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-md bg-blue-50 border-blue-100 border">
              <Ticket className="w-5 h-5 text-blue-600" strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Voucher Diskon Aktif</p>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            {vouchers.length} <span className="text-sm font-medium text-gray-400 ml-1">Kupon</span>
          </h3>
          <p className="text-xs font-medium text-gray-400 mt-2">Siap digunakan oleh pelanggan</p>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-md bg-emerald-50 border-emerald-100 border">
              <Percent className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Penggunaan Kupon</p>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            {totalUsed} <span className="text-sm font-medium text-gray-400 ml-1">Kali Digunakan</span>
          </h3>
          <p className="text-xs font-medium text-gray-400 mt-2">Tingkat konversi kupon diskon</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
         <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
           <h3 className="text-sm font-bold text-slate-700">Daftar Voucher Tersedia</h3>
         </div>
         
         <div className="p-0">
          {vouchers.length === 0 ? (
            <div className="flex-1 p-5 flex items-center justify-center min-h-[350px]">
              <div className="text-center max-w-sm">
                <div className="w-14 h-14 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Tag className="w-6 h-6 text-gray-400" />
                </div>
                <h4 className="text-base font-bold text-slate-800 mb-1">Belum Ada Kupon</h4>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Tingkatkan penjualan dengan membagikan voucher diskon menarik kepada pelanggan platform.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {vouchers.map(voucher => (
                <div key={voucher.id} className="p-4 border border-gray-200 rounded-md flex flex-col justify-between bg-white hover:border-blue-300 transition-colors shadow-sm">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-bold text-sm text-slate-800 bg-gray-100 px-2 py-1 rounded border border-gray-200 tracking-wider">
                        {voucher.code}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold uppercase tracking-wider">
                        Aktif
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 mt-2">
                      {voucher.discountPercent ? `Diskon ${voucher.discountPercent}%` : `Diskon Rp ${voucher.discountAmount?.toLocaleString('id-ID')}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">
                      Min. belanja Rp {voucher.minPurchase ? voucher.minPurchase.toLocaleString('id-ID') : 0}
                    </p>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> 
                      {new Date(voucher.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </div>
                    <div className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-bold">
                      {voucher.usedCount}/{voucher.quota}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
         </div>
      </div>
    </div>
  );
}
