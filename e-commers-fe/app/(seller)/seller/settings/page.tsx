"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Store, MapPin, FileText, Globe, Save, Loader2,
  AlertCircle, CheckCircle2, Camera, Phone
} from "lucide-react";

interface StoreData {
  id: string;
  name: string;
  slug: string;
  description: string;
  city: string;
  province: string;
  postalCode: string;
  logoUrl: string;
  isActive: boolean;
  isOfficial: boolean;
}

export default function SellerSettingsPage() {
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    description: "",
    city: "",
    province: "",
    postalCode: "",
    logoUrl: "",
  });

  useEffect(() => { fetchStore(); }, []);

  const fetchStore = async () => {
    setLoading(true);
    try {
      const res = await api.get("/stores/my-stores");
      if (res.data?.length > 0) {
        const s = res.data[0];
        setStore(s);
        setForm({
          description: s.description || "",
          city: s.city || "",
          province: s.province || "",
          postalCode: s.postalCode || "",
          logoUrl: s.logoUrl || "",
        });
      }
    } catch (err) {
      console.error("Gagal memuat toko:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      await api.patch(`/stores/${store.id}`, form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      await fetchStore();
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="font-medium animate-pulse">Memuat pengaturan toko...</p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm">
        <Store size={56} className="text-slate-300 mx-auto mb-4" strokeWidth={1} />
        <h3 className="text-lg font-bold text-slate-700 mb-2">Toko Belum Dibuat</h3>
        <p className="text-slate-500 text-sm">Silakan buka toko terlebih dahulu dari halaman dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800">Pengaturan Toko</h1>
        <p className="text-slate-500 text-sm mt-1">Kelola informasi dan tampilan toko Anda.</p>
      </div>

      {/* Store Identity (read-only) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <h2 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
          <Store size={18} className="text-blue-600" />
          Identitas Toko
        </h2>
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white text-3xl font-bold shadow-md">
              {store.name.charAt(0).toUpperCase()}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:bg-blue-50 transition-colors">
              <Camera size={12} className="text-slate-500" />
            </button>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-800">{store.name}</h3>
              {store.isOfficial && (
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">Official</span>
              )}
            </div>
            <p className="text-slate-500 text-sm">/{store.slug}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-400 font-medium mb-0.5">Nama Toko</p>
            <p className="font-semibold text-slate-700">{store.name}</p>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-400 font-medium mb-0.5">Status</p>
            <span className={`font-semibold text-sm ${store.isActive ? "text-emerald-600" : "text-red-600"}`}>
              {store.isActive ? "● Aktif" : "● Nonaktif"}
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-3">Nama dan slug toko tidak dapat diubah. Hubungi support untuk informasi lebih lanjut.</p>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
        <h2 className="font-bold text-slate-800 flex items-center gap-2">
          <FileText size={18} className="text-blue-600" />
          Informasi Toko
        </h2>

        {success && (
          <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
            <CheckCircle2 size={18} />
            <p className="font-medium text-sm">Pengaturan berhasil disimpan!</p>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100">
            <AlertCircle size={18} />
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Deskripsi Toko</label>
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Ceritakan tentang toko dan produk Anda..."
            rows={4}
            className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-slate-800 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
            <Camera size={14} className="text-blue-500" /> URL Logo Toko
          </label>
          <input
            type="url"
            value={form.logoUrl}
            onChange={e => setForm({ ...form, logoUrl: e.target.value })}
            placeholder="https://example.com/logo.png"
            className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-slate-800"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <MapPin size={14} className="text-blue-500" /> Kota
            </label>
            <input
              type="text"
              value={form.city}
              onChange={e => setForm({ ...form, city: e.target.value })}
              placeholder="Jakarta Selatan"
              className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-slate-800"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <Globe size={14} className="text-blue-500" /> Provinsi
            </label>
            <input
              type="text"
              value={form.province}
              onChange={e => setForm({ ...form, province: e.target.value })}
              placeholder="DKI Jakarta"
              className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Kode Pos</label>
          <input
            type="text"
            value={form.postalCode}
            onChange={e => setForm({ ...form, postalCode: e.target.value })}
            placeholder="12345"
            className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-slate-800"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>
    </div>
  );
}
