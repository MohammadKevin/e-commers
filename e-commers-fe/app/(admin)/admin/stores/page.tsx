"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Store, Search, Loader2, MapPin, Package,
  CheckCircle2, XCircle, RefreshCw, ShieldCheck
} from "lucide-react";

interface StoreItem {
  id: string;
  name: string;
  slug: string;
  city: string;
  province: string;
  isActive: boolean;
  isOfficial: boolean;
  createdAt: string;
  _count?: { products: number; orders: number };
}

const DEMO_STORES: StoreItem[] = [
  { id: "1", name: "Elektronik Jaya", slug: "elektronik-jaya", city: "Jakarta", province: "DKI Jakarta", isActive: true, isOfficial: true, createdAt: new Date(Date.now() - 86400000 * 60).toISOString(), _count: { products: 45, orders: 128 } },
  { id: "2", name: "Fashion Kita", slug: "fashion-kita", city: "Surabaya", province: "Jawa Timur", isActive: true, isOfficial: false, createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), _count: { products: 120, orders: 89 } },
  { id: "3", name: "Toko Buku Nusantara", slug: "toko-buku-nusantara", city: "Bandung", province: "Jawa Barat", isActive: true, isOfficial: false, createdAt: new Date(Date.now() - 86400000 * 14).toISOString(), _count: { products: 67, orders: 34 } },
  { id: "4", name: "Gadget World", slug: "gadget-world", city: "Yogyakarta", province: "DIY", isActive: false, isOfficial: false, createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), _count: { products: 12, orders: 5 } },
];

export default function AdminStoresPage() {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    const timer = setTimeout(() => {
      setStores(DEMO_STORES);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const filtered = stores.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.city?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && s.isActive) ||
      (statusFilter === "INACTIVE" && !s.isActive) ||
      (statusFilter === "OFFICIAL" && s.isOfficial);
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-500 mb-4" />
        <p className="animate-pulse font-medium">Memuat data toko...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Toko</h1>
          <p className="text-slate-500 text-sm mt-1">Pantau dan kelola semua toko aktif di platform.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors text-sm font-medium">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Toko", value: stores.length, icon: Store, color: "text-slate-700", bg: "bg-slate-50" },
          { label: "Toko Aktif", value: stores.filter(s => s.isActive).length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Toko Official", value: stores.filter(s => s.isOfficial).length, icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Non-aktif", value: stores.filter(s => !s.isActive).length, icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={18} className={item.color} />
              </div>
              <p className="text-2xl font-extrabold text-slate-800">{item.value}</p>
              <p className="text-sm text-slate-500 mt-0.5">{item.label}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Cari nama atau kota toko..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50 outline-none transition-all text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:border-cyan-500 outline-none text-sm text-slate-700 font-medium"
        >
          <option value="ALL">Semua Status</option>
          <option value="ACTIVE">Aktif</option>
          <option value="INACTIVE">Non-aktif</option>
          <option value="OFFICIAL">Official</option>
        </select>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(store => (
          <div key={store.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md hover:border-cyan-200 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-cyan-500/20">
                  {store.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-slate-800">{store.name}</p>
                    {store.isOfficial && (
                      <ShieldCheck size={14} className="text-blue-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400">/{store.slug}</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                store.isActive
                  ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                  : "bg-red-50 text-red-500 border-red-200"
              }`}>
                {store.isActive ? "Aktif" : "Nonaktif"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-4">
              <MapPin size={14} />
              <span>{store.city}{store.province ? `, ${store.province}` : ""}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                <p className="text-lg font-extrabold text-slate-800">{store._count?.products || 0}</p>
                <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
                  <Package size={11} /> Produk
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                <p className="text-lg font-extrabold text-slate-800">{store._count?.orders || 0}</p>
                <p className="text-xs text-slate-500">Pesanan</p>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-100 pt-3">
              <span>Bergabung: {new Date(store.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
              <button className="text-cyan-600 hover:underline font-medium">Detail →</button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-3xl py-16 text-center border border-slate-100 shadow-sm">
          <Store size={40} className="text-slate-300 mx-auto mb-3" strokeWidth={1} />
          <p className="font-medium text-slate-600">Tidak ada toko ditemukan</p>
        </div>
      )}
    </div>
  );
}
