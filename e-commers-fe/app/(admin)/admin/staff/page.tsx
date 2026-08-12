"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { UserPlus, Shield, Mail, Phone, Loader2, AlertCircle } from "lucide-react";

export default function StaffManagementPage() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    globalRole: "FINANCE_ADMIN"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/staff');
      setStaffList(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal memuat daftar staf");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.post('/users/create-staff', formData);
      alert("Staf berhasil ditambahkan!");
      setIsModalOpen(false);
      setFormData({ fullName: "", email: "", password: "", phone: "", globalRole: "FINANCE_ADMIN" });
      fetchStaff();
    } catch (err: any) {
      alert(err.response?.data?.message || "Terjadi kesalahan saat menambahkan staf");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch(role) {
      case 'FINANCE_ADMIN': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'OPERATIONS_CS': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'MARKETING_ADMIN': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Staf</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola akun admin internal platform.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          Tambah Staf Baru
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-sm font-bold text-slate-700">Daftar Akun Internal</h3>
          <div className="text-sm font-medium text-gray-500">
            Total: <span className="text-slate-800 font-bold">{staffList.length}</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Staf</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role & Akses</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Kontak</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal Bergabung</th>
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
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">
                    <Shield className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    Belum ada data staf terdaftar.
                  </td>
                </tr>
              ) : (
                staffList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{staff.fullName}</div>
                      <div className="text-xs font-medium text-gray-500 mt-0.5 font-mono">{staff.id.substring(0,8)}...</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-md border ${getRoleBadgeColor(staff.globalRole)}`}>
                        {staff.globalRole.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        {staff.email}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(staff.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Staf */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="font-bold text-slate-800">Tambah Staf Baru</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-slate-700">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nama Lengkap</label>
                <input 
                  type="text" required
                  placeholder="Masukkan nama lengkap staf"
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-slate-800 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email</label>
                <input 
                  type="email" required
                  placeholder="email@perusahaan.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-slate-800 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
                <input 
                  type="password" required minLength={6}
                  placeholder="Minimal 6 karakter"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-slate-800 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Role / Peran</label>
                <select 
                  value={formData.globalRole}
                  onChange={e => setFormData({...formData, globalRole: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="FINANCE_ADMIN" className="text-slate-800">FINANCE ADMIN (Keuangan)</option>
                  <option value="OPERATIONS_CS" className="text-slate-800">OPERATIONS CS (Operasional)</option>
                  <option value="MARKETING_ADMIN" className="text-slate-800">MARKETING ADMIN (Pemasaran)</option>
                </select>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-md text-sm hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 py-2 bg-blue-600 text-white font-semibold rounded-md text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : "Simpan Staf"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
