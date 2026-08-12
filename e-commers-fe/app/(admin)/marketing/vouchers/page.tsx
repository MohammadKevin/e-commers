"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Plus, Tag, Search, Calendar, Check, AlertCircle } from "lucide-react";

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  const filteredVouchers = vouchers.filter(v => v.code.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Voucher Global</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola dan pantau semua kode promo diskon di platform.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Buat Voucher
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari kode voucher..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
          </div>
          <div className="text-sm font-medium text-gray-500">
            Total: <span className="text-slate-800 font-bold">{vouchers.length}</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Kode Voucher</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nilai Diskon</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Kuota Terpakai</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Masa Berlaku</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                    Memuat data...
                  </td>
                </tr>
              ) : filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    <Tag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    Belum ada data voucher
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((voucher) => (
                  <tr key={voucher.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="inline-flex font-bold text-slate-800 bg-gray-100 px-2 py-1 rounded border border-gray-200">{voucher.code}</div>
                      {voucher.isActive && <span className="ml-2 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold uppercase tracking-wider">Aktif</span>}
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-bold text-slate-700">
                        {voucher.discountPercent ? `${voucher.discountPercent}%` : `Rp ${voucher.discountAmount?.toLocaleString('id-ID')}`}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">Min. Rp {voucher.minPurchase?.toLocaleString('id-ID') || 0}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-slate-700">
                        {voucher.usedCount} / {voucher.quota}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1.5 overflow-hidden">
                        <div 
                          className="bg-blue-500 h-1.5 rounded-full" 
                          style={{ width: `${Math.min(100, (voucher.usedCount / voucher.quota) * 100)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(voucher.endDate).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded transition-colors">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
