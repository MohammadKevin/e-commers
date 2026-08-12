"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Search, Plus, Filter, LayoutGrid, Loader2 } from "lucide-react";

export default function CategoriesPage() {
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error("Gagal memuat kategori", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (editingId) {
        await api.patch(`/categories/${editingId}`, formData);
        alert("Kategori berhasil diperbarui!");
      } else {
        await api.post('/categories', formData);
        alert("Kategori berhasil ditambahkan!");
      }
      setIsModalOpen(false);
      setFormData({ name: "" });
      setEditingId(null);
      fetchCategories();
    } catch (err: any) {
      alert(`Terjadi kesalahan saat ${editingId ? 'memperbarui' : 'menambahkan'} kategori`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus kategori ini?")) {
      try {
        await api.delete(`/categories/${id}`);
        alert("Kategori berhasil dihapus!");
        fetchCategories();
      } catch (err) {
        alert("Gagal menghapus kategori");
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Kategori Produk</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola master data kategori produk untuk seluruh platform.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => {
              setEditingId(null);
              setFormData({ name: "" });
              setIsModalOpen(true);
            }}
            className="flex flex-1 md:flex-none items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah Kategori
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
              placeholder="Cari nama kategori..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
          </div>
          <div className="text-sm font-medium text-gray-500">
            Total: <span className="text-slate-800 font-bold">{categories.length}</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Ikon</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Kategori</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Slug</th>
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
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-sm">
                      <LayoutGrid className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mb-1">Belum Ada Kategori</h3>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                      Data master kategori produk belum dikonfigurasi di platform ini.
                    </p>
                  </td>
                </tr>
              ) : (
                categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                         <LayoutGrid className="w-4 h-4" />
                      </div>
                    </td>
                    <td className="p-4 font-bold text-sm text-slate-800">{cat.name}</td>
                    <td className="p-4 text-sm text-gray-500">{cat.slug}</td>
                    <td className="p-4 text-sm"><span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-bold">Aktif</span></td>
                    <td className="p-4 text-sm text-right space-x-3">
                      <button 
                        onClick={() => {
                          setEditingId(cat.id);
                          setFormData({ name: cat.name });
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 font-semibold hover:underline"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(cat.id)}
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

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="font-bold text-slate-800">{editingId ? 'Edit Kategori' : 'Tambah Kategori Baru'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-slate-700">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nama Kategori</label>
                <input 
                  type="text" required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Misal: Elektronik"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
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
                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : "Simpan Kategori"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
