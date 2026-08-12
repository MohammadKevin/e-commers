"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Search, Filter, Users, Loader2 } from "lucide-react";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ globalRole: "USER", tier: "SILVER" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/buyers'); // Can be /users if we have an endpoint for all, but buyers is fine for now
      setUsers(res.data);
    } catch (err) {
      console.error("Gagal memuat pengguna", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      setIsSubmitting(true);
      await api.patch(`/users/${editingId}/admin`, formData);
      alert("Data pengguna berhasil diperbarui!");
      setIsUpdateModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      alert("Gagal memperbarui pengguna");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.")) {
      try {
        await api.delete(`/users/${id}/admin`);
        alert("Pengguna berhasil dihapus!");
        fetchUsers();
      } catch (err) {
        alert("Gagal menghapus pengguna");
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Pengguna (Pembeli)</h1>
          <p className="text-sm text-gray-500 mt-1">Pantau dan kelola semua akun pengguna terdaftar di platform.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-slate-700 rounded-md text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm">
            <Filter className="w-4 h-4" />
            Filter Tier
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari email atau nama pengguna..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
          </div>
          <div className="text-sm font-medium text-gray-500">
            Total Pengguna: <span className="text-slate-800 font-bold">{users.length}</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Pengguna</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tier</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal Bergabung</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                    Memuat data...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-sm">
                      <Users className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mb-1">Daftar Pengguna Kosong</h3>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                      Belum ada data pengguna (pembeli) yang bisa ditampilkan.
                    </p>
                  </td>
                </tr>
              ) : (
                users.filter(u => u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())).map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <p className="font-bold text-sm text-slate-800">{user.fullName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </td>
                    <td className="p-4 text-sm font-semibold text-slate-700">{user.tier}</td>
                    <td className="p-4 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString('id-ID')}</td>
                    <td className="p-4 text-sm"><span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-bold">Aktif</span></td>
                    <td className="p-4 text-sm text-right space-x-3">
                      <button 
                        onClick={() => {
                          setEditingId(user.id);
                          setFormData({ globalRole: user.globalRole, tier: user.tier });
                          setIsUpdateModalOpen(true);
                        }}
                        className="text-blue-600 font-semibold hover:underline"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 font-semibold hover:underline"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Update Role & Tier Pengguna */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="font-bold text-slate-800">Ubah Akses Pengguna</h2>
              <button onClick={() => setIsUpdateModalOpen(false)} className="text-gray-400 hover:text-slate-700">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Global Role</label>
                <select
                  value={formData.globalRole}
                  onChange={e => setFormData({ ...formData, globalRole: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="USER">USER</option>
                  <option value="SELLER">SELLER</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  <option value="OPERATIONS_CS">OPERATIONS_CS</option>
                  <option value="FINANCE_ADMIN">FINANCE_ADMIN</option>
                  <option value="MARKETING_ADMIN">MARKETING_ADMIN</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tier</label>
                <select
                  value={formData.tier}
                  onChange={e => setFormData({ ...formData, tier: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="SILVER">SILVER</option>
                  <option value="GOLD">GOLD</option>
                  <option value="PLATINUM">PLATINUM</option>
                </select>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="flex-1 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-md text-sm hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 py-2 bg-blue-600 text-white font-semibold rounded-md text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
