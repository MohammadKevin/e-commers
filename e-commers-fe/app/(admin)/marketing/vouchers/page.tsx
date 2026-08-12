"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Ticket, Plus, Loader2, Calendar, Tag, Percent,
  X, Save, AlertCircle, CheckCircle2, Trash2, Edit2
} from "lucide-react";

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

const EMPTY_FORM = {
  code: "",
  discountType: "percent" as "percent" | "amount",
  discountPercent: "",
  discountAmount: "",
  minPurchase: "",
  maxDiscount: "",
  quota: "100",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10),
};

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => { fetchVouchers(); }, []);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/vouchers");
      setVouchers(res.data || []);
    } catch (err) {
      console.error("Gagal memuat voucher:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload: any = {
        code: form.code.toUpperCase(),
        quota: Number(form.quota),
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
      };
      if (form.discountType === "percent") {
        payload.discountPercent = Number(form.discountPercent);
      } else {
        payload.discountAmount = Number(form.discountAmount);
      }
      if (form.minPurchase) payload.minPurchase = Number(form.minPurchase);
      if (form.maxDiscount) payload.maxDiscount = Number(form.maxDiscount);

      await api.post("/vouchers", payload);
      setSuccess("Voucher berhasil dibuat!");
      setShowForm(false);
      setForm(EMPTY_FORM);
      await fetchVouchers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal membuat voucher");
    } finally {
      setSaving(false);
    }
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    setForm(f => ({ ...f, code }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-pink-500 mb-4" />
        <p className="animate-pulse font-medium">Memuat voucher...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Voucher Global Platform</h1>
          <p className="text-slate-500 text-sm mt-1">Buat dan kelola voucher diskon yang berlaku untuk semua pembeli.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-pink-600 text-white font-semibold py-2.5 px-5 rounded-xl hover:bg-pink-700 transition-all shadow-sm flex items-center gap-2"
        >
          <Plus size={18} /> Buat Voucher
        </button>
      </div>

      {/* Notification */}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
          <CheckCircle2 size={18} />
          <p className="font-medium text-sm">{success}</p>
        </div>
      )}

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Ticket size={20} className="text-pink-600" />
                Buat Voucher Baru
              </h2>
              <button onClick={() => { setShowForm(false); setError(""); }} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              {/* Code */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Kode Voucher</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.code}
                    onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="DISKON10"
                    className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:border-pink-500 focus:ring-4 focus:ring-pink-50 outline-none text-sm uppercase font-mono tracking-widest"
                    required
                  />
                  <button
                    type="button"
                    onClick={generateCode}
                    className="px-3 py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors text-xs font-medium"
                  >
                    Generate
                  </button>
                </div>
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tipe Diskon</label>
                <div className="grid grid-cols-2 gap-2">
                  {["percent", "amount"].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm({ ...form, discountType: type as any })}
                      className={`py-3 rounded-xl font-semibold text-sm transition-all border ${
                        form.discountType === type
                          ? "bg-pink-600 text-white border-pink-600 shadow-sm"
                          : "bg-white text-slate-600 border-slate-200 hover:border-pink-300"
                      }`}
                    >
                      {type === "percent" ? "% Persentase" : "Rp Nominal"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Discount Value */}
              {form.discountType === "percent" ? (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Besaran Diskon (%)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={form.discountPercent}
                    onChange={e => setForm({ ...form, discountPercent: e.target.value })}
                    placeholder="10"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-pink-500 focus:ring-4 focus:ring-pink-50 outline-none text-sm"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nominal Diskon (Rp)</label>
                  <input
                    type="number"
                    min={1000}
                    value={form.discountAmount}
                    onChange={e => setForm({ ...form, discountAmount: e.target.value })}
                    placeholder="50000"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-pink-500 focus:ring-4 focus:ring-pink-50 outline-none text-sm"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Min. Pembelian (Rp)</label>
                  <input
                    type="number"
                    value={form.minPurchase}
                    onChange={e => setForm({ ...form, minPurchase: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-pink-500 focus:ring-4 focus:ring-pink-50 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Max. Diskon (Rp)</label>
                  <input
                    type="number"
                    value={form.maxDiscount}
                    onChange={e => setForm({ ...form, maxDiscount: e.target.value })}
                    placeholder="Tidak terbatas"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-pink-500 focus:ring-4 focus:ring-pink-50 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Kuota Penggunaan</label>
                <input
                  type="number"
                  min={1}
                  value={form.quota}
                  onChange={e => setForm({ ...form, quota: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-pink-500 focus:ring-4 focus:ring-pink-50 outline-none text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-pink-500 focus:ring-4 focus:ring-pink-50 outline-none text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal Berakhir</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={e => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-pink-500 focus:ring-4 focus:ring-pink-50 outline-none text-sm"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-pink-600 text-white font-bold py-4 rounded-2xl hover:bg-pink-700 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {saving ? "Menyimpan..." : "Buat Voucher"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Voucher Grid */}
      {vouchers.length === 0 ? (
        <div className="bg-white rounded-3xl py-20 text-center border border-slate-100 shadow-sm">
          <Ticket size={56} className="text-slate-300 mx-auto mb-4" strokeWidth={1} />
          <h3 className="text-lg font-bold text-slate-700 mb-2">Belum Ada Voucher</h3>
          <p className="text-slate-500 text-sm mb-6">Buat voucher diskon pertama untuk menarik lebih banyak pembeli.</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-pink-600 text-white font-semibold py-3 px-8 rounded-2xl hover:bg-pink-700 transition-colors"
          >
            Buat Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {vouchers.map(voucher => {
            const isExpired = new Date(voucher.endDate) < new Date();
            const usagePercent = Math.round((voucher.usedCount / voucher.quota) * 100);
            return (
              <div key={voucher.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md hover:border-pink-200 transition-all">
                {/* Ticket top */}
                <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-4 text-white relative">
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
                    <Ticket size={60} />
                  </div>
                  <p className="text-xs font-semibold text-pink-100 mb-1">KODE VOUCHER</p>
                  <p className="text-2xl font-extrabold tracking-widest font-mono">{voucher.code}</p>
                </div>
                {/* Divider */}
                <div className="flex items-center px-4 -mt-px">
                  <div className="w-4 h-4 rounded-full bg-slate-50 -ml-6 border border-slate-200 shrink-0"></div>
                  <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-2"></div>
                  <div className="w-4 h-4 rounded-full bg-slate-50 -mr-6 border border-slate-200 shrink-0"></div>
                </div>
                {/* Body */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Percent size={16} className="text-pink-500" />
                      <p className="font-bold text-slate-800">
                        {voucher.discountPercent
                          ? `Diskon ${voucher.discountPercent}%`
                          : `Diskon Rp ${Number(voucher.discountAmount).toLocaleString("id-ID")}`}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isExpired
                        ? "bg-red-50 text-red-500 border-red-200"
                        : voucher.isActive
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                        : "bg-slate-100 text-slate-500 border-slate-200"
                    }`}>
                      {isExpired ? "Kadaluarsa" : voucher.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                  {voucher.minPurchase && (
                    <p className="text-xs text-slate-500 mb-3">Min. belanja Rp {Number(voucher.minPurchase).toLocaleString("id-ID")}</p>
                  )}

                  {/* Usage Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                      <span>Terpakai {voucher.usedCount}/{voucher.quota}</span>
                      <span>{usagePercent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${usagePercent > 80 ? "bg-red-400" : "bg-pink-400"}`}
                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Calendar size={12} />
                    <span>
                      {new Date(voucher.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} —{" "}
                      {new Date(voucher.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
