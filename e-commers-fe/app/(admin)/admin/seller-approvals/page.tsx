"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Check, X, Store, AlertCircle, Search } from "lucide-react";

export default function SellerApprovalsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/seller-applications?status=PENDING');
      setApplications(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal memuat data aplikasi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApprove = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menyetujui pengajuan toko ini?")) return;
    
    try {
      await api.post(`/seller-applications/${id}/approve`);
      alert("Toko berhasil disetujui!");
      fetchApplications();
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal menyetujui toko");
    }
  };

  const filteredApps = applications.filter(app => 
    app.storeName.toLowerCase().includes(search.toLowerCase()) ||
    app.user?.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Persetujuan Penjual</h1>
          <p className="text-sm text-gray-500 mt-1">Daftar pengguna yang mengajukan pendaftaran toko (SLA 48 Jam).</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari nama toko atau pemilik..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
          </div>
          <div className="text-sm font-medium text-gray-500">
            Total Pending: <span className="text-slate-800 font-bold">{applications.length}</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Toko & Pemilik</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Deskripsi</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Waktu Pengajuan</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">
                    <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                    Memuat data...
                  </td>
                </tr>
              ) : filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">
                    <Store className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    Belum ada pengajuan toko baru
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => {
                  const submitDate = new Date(app.createdAt);
                  const isExpiringSoon = (new Date().getTime() - submitDate.getTime()) > (24 * 60 * 60 * 1000); // > 24 hours

                  return (
                    <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{app.storeName}</div>
                        <div className="text-xs font-medium text-gray-500 mt-0.5">{app.user?.fullName} ({app.user?.email})</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-600 max-w-xs truncate">{app.description || '-'}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-700">{submitDate.toLocaleDateString('id-ID')}</div>
                        <div className={`text-xs font-bold mt-0.5 ${isExpiringSoon ? 'text-orange-500' : 'text-gray-400'}`}>
                          {submitDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          {isExpiringSoon && ' (Mendekati SLA)'}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleApprove(app.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-xs transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" /> Setujui
                          </button>
                          <button 
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-red-600 rounded font-medium text-xs transition-colors"
                          >
                            <X className="w-3.5 h-3.5" /> Tolak
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
