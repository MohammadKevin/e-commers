"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Search, Plus, Filter, MessageSquare, AlertCircle, Loader2 } from "lucide-react";

export default function TicketsPage() {
  const [search, setSearch] = useState("");
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusFormData, setStatusFormData] = useState({ status: "OPEN" });
  
  const [formData, setFormData] = useState({ subject: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tickets');
      setTickets(res.data);
    } catch (err) {
      console.error("Gagal memuat tiket", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.post('/tickets', formData);
      alert("Tiket berhasil dibuat!");
      setIsModalOpen(false);
      setFormData({ subject: "", description: "" });
      fetchTickets();
    } catch (err: any) {
      alert("Terjadi kesalahan saat membuat tiket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      setIsSubmitting(true);
      await api.patch(`/tickets/${editingId}`, statusFormData);
      alert("Status tiket berhasil diperbarui!");
      setIsUpdateModalOpen(false);
      fetchTickets();
    } catch (err: any) {
      alert("Gagal memperbarui status tiket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus tiket ini? Tindakan ini tidak dapat dibatalkan.")) {
      try {
        await api.delete(`/tickets/${id}`);
        alert("Tiket berhasil dihapus!");
        fetchTickets();
      } catch (err) {
        alert("Gagal menghapus tiket");
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Tiket & Bantuan</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola tiket bantuan pelanggan dan eskalasi keluhan pesanan.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-slate-700 rounded-md text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex flex-1 md:flex-none items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Buat Tiket
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
              placeholder="Cari ID tiket atau pengguna..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
          </div>
          <div className="text-sm font-medium text-gray-500">
            Total: <span className="text-slate-800 font-bold">{tickets.length}</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID Tiket</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Pelapor</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Subjek / Masalah</th>
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
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-sm">
                      <MessageSquare className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mb-1">Belum Ada Tiket Bantuan</h3>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                      Saat ini tidak ada tiket keluhan atau bantuan pelanggan yang menunggu untuk ditindaklanjuti.
                    </p>
                  </td>
                </tr>
              ) : (
                tickets.filter(t => t.subject.toLowerCase().includes(search.toLowerCase()) || t.user?.fullName?.toLowerCase().includes(search.toLowerCase())).map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="p-4 text-sm font-semibold text-slate-700">#{ticket.id.substring(0, 8)}</td>
                    <td className="p-4">
                      <p className="font-bold text-sm text-slate-800">{ticket.user?.fullName}</p>
                      <p className="text-xs text-gray-500">{ticket.user?.email}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-semibold text-slate-800">{ticket.subject}</p>
                      <p className="text-xs text-gray-500 truncate max-w-xs">{ticket.description}</p>
                    </td>
                    <td className="p-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        ticket.status === 'OPEN' ? 'bg-red-100 text-red-700' :
                        ticket.status === 'WAITING' ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-right space-x-3">
                      <button 
                        onClick={() => {
                          setEditingId(ticket.id);
                          setStatusFormData({ status: ticket.status });
                          setIsUpdateModalOpen(true);
                        }}
                        className="text-blue-600 font-semibold hover:underline"
                      >
                        Update
                      </button>
                      <button 
                        onClick={() => handleDelete(ticket.id)}
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

      {/* Modal Buat Tiket */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="font-bold text-slate-800">Buat Tiket Baru</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-slate-700">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Subjek</label>
                <input 
                  type="text" required
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  placeholder="Ringkasan masalah"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Deskripsi Masalah</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Jelaskan masalah secara detail..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                ></textarea>
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
                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim...</> : "Buat Tiket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Update Status Tiket */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="font-bold text-slate-800">Update Status Tiket</h2>
              <button onClick={() => setIsUpdateModalOpen(false)} className="text-gray-400 hover:text-slate-700">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUpdateStatus} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Pilih Status</label>
                <select
                  value={statusFormData.status}
                  onChange={e => setStatusFormData({ status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="WAITING">WAITING</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
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
                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : "Simpan Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
