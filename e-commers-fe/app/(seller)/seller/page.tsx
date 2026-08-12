"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  Store, 
  Package, 
  TrendingUp, 
  PlusCircle, 
  AlertCircle,
  MapPin,
  FileText,
  Loader2
} from "lucide-react";
import Link from "next/link";

interface StoreData {
  id: string;
  name: string;
  slug: string;
  description: string;
  city: string;
  isActive: boolean;
}

export default function SellerDashboardPage() {
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", description: "", city: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Real stats
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchMyStore();
  }, []);

  const fetchMyStore = async () => {
    try {
      setLoading(true);
      const res = await api.get("/stores/my-stores");
      if (res.data && res.data.length > 0) {
        const storeData = res.data[0];
        setStore(storeData);
        // Fetch real stats for this store
        await fetchStoreStats(storeData.id);
      }
    } catch (err: any) {
      console.error("Failed to fetch store:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreStats = async (storeId: string) => {
    try {
      // Fetch products count
      const prodRes = await api.get(`/products?storeId=${storeId}&limit=1`);
      setTotalProducts(prodRes.data?.meta?.total || 0);
    } catch (err) {}

    try {
      // Fetch orders
      const orderRes = await api.get(`/orders?storeId=${storeId}&limit=5`);
      const orders = orderRes.data?.data || [];
      setRecentOrders(orders);
      setTotalOrders(orderRes.data?.meta?.total || orders.length || 0);
      
      // Calculate revenue from orders
      const rev = orders.reduce((acc: number, o: any) => acc + Number(o.totalAmount || 0), 0);
      setTotalRevenue(rev);
    } catch (err) {
      // Orders endpoint might not support storeId filter — that's ok
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.city) {
      setError("Nama toko dan kota wajib diisi");
      return;
    }
    
    setError("");
    setSubmitting(true);
    
    try {
      // Auto-generate slug dari nama toko
      const slug = createForm.name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") || "toko";
      
      await api.post("/stores", {
        name: createForm.name,
        slug: slug + "-" + Date.now().toString().slice(-6),
        description: createForm.description,
        city: createForm.city,
      });
      await fetchMyStore();
      setIsCreating(false);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(", ") : msg || "Gagal membuat toko");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="font-medium animate-pulse">Memuat data toko...</p>
      </div>
    );
  }

  // UI if user doesn't have a store yet
  if (!store && !isCreating) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white max-w-lg w-full rounded-3xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 text-center">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Store size={40} strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Mulai Berjualan Sekarang</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Anda belum memiliki toko yang aktif. Buka tokomu secara gratis sekarang dan raih jutaan pembeli di sakserShop.
          </p>
          <button 
            onClick={() => setIsCreating(true)}
            className="w-full bg-blue-600 text-white font-semibold py-3.5 rounded-2xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all duration-300"
          >
            Buka Toko Gratis
          </button>
        </div>
      </div>
    );
  }

  // UI for Store Creation Form
  if (isCreating) {
    return (
      <div className="max-w-2xl mx-auto py-8 animate-in slide-in-from-bottom-8 duration-500">
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <button 
            onClick={() => setIsCreating(false)}
            className="text-slate-400 hover:text-slate-600 mb-8 font-medium text-sm transition-colors"
          >
            ← Kembali
          </button>
          
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Detail Toko Baru</h2>
          <p className="text-slate-500 mb-8">Lengkapi informasi dasar toko Anda untuk memulai.</p>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-start gap-3">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleCreateStore} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Store size={16} className="text-blue-500" /> Nama Toko
              </label>
              <input 
                type="text" 
                value={createForm.name}
                onChange={e => setCreateForm({...createForm, name: e.target.value})}
                placeholder="Misal: Sakser Official Store"
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-slate-800"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-blue-500" /> Kota Pengiriman
              </label>
              <input 
                type="text" 
                value={createForm.city}
                onChange={e => setCreateForm({...createForm, city: e.target.value})}
                placeholder="Misal: Jakarta Selatan"
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-slate-800"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <FileText size={16} className="text-blue-500" /> Deskripsi Singkat
              </label>
              <textarea 
                value={createForm.description}
                onChange={e => setCreateForm({...createForm, description: e.target.value})}
                placeholder="Ceritakan sedikit tentang produk yang Anda jual..."
                rows={4}
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-slate-800 resize-none"
              ></textarea>
            </div>

            <button 
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white font-semibold py-4 rounded-2xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all duration-300 disabled:opacity-70 flex justify-center items-center gap-2 mt-8"
            >
              {submitting ? <Loader2 size={20} className="animate-spin" /> : <PlusCircle size={20} />}
              {submitting ? "Menyiapkan Toko..." : "Buka Toko Sekarang"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // UI if Store Exists
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Profile */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-cyan-500 text-white rounded-full flex items-center justify-center text-4xl font-extrabold shadow-lg shadow-blue-500/30">
            {store?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{store?.name}</h1>
              <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                store?.isActive !== false 
                  ? 'bg-green-100 text-green-700 border-green-200' 
                  : 'bg-red-100 text-red-700 border-red-200'
              }`}>
                {store?.isActive !== false ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
            <p className="text-slate-500 font-medium flex items-center gap-1.5">
              <MapPin size={16} /> {store?.city || "Belum diset"}
            </p>
          </div>
        </div>
        <Link href="/seller/products" className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all duration-300 flex items-center gap-2">
          <PlusCircle size={18} /> Tambah Produk
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-7 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl group-hover:scale-110 transition-transform">
              <Package size={24} strokeWidth={2} />
            </div>
            {totalOrders > 0 && <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2.5 py-1 rounded-full">Baru</span>}
          </div>
          <p className="text-sm font-semibold text-slate-500 mb-1">Pesanan Masuk</p>
          <h3 className="text-4xl font-extrabold text-slate-800">{totalOrders}</h3>
          <p className="text-sm text-slate-400 mt-2">{totalOrders > 0 ? "Menunggu diproses" : "Belum ada pesanan"}</p>
        </div>
        
        <div className="bg-white p-7 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl group-hover:scale-110 transition-transform">
              <TrendingUp size={24} strokeWidth={2} />
            </div>
            {totalRevenue > 0 && <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">Bulan Ini</span>}
          </div>
          <p className="text-sm font-semibold text-slate-500 mb-1">Pendapatan Kotor</p>
          <h3 className="text-4xl font-extrabold text-slate-800">Rp {totalRevenue.toLocaleString('id-ID')}</h3>
          <p className="text-sm text-emerald-500 mt-2 font-medium">{totalRevenue > 0 ? "Data dari pesanan terkini" : "Mulai jual produkmu!"}</p>
        </div>
        
        <div className="bg-white p-7 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
              <Store size={24} strokeWidth={2} />
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-500 mb-1">Total Produk</p>
          <h3 className="text-4xl font-extrabold text-slate-800">{totalProducts}</h3>
          <p className="text-sm text-blue-500 mt-2 font-medium">
            <Link href="/seller/products" className="hover:underline">Lihat etalase →</Link>
          </p>
        </div>
      </div>

      {/* Orders List / Empty State */}
      <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 mb-8">Daftar Pesanan Terkini</h3>
        
        {recentOrders.length > 0 ? (
          <div className="space-y-4">
            {recentOrders.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-800">#{order.orderNumber}</p>
                  <p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">Rp {Number(order.totalAmount || 0).toLocaleString('id-ID')}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    order.status === 'PAID' ? 'bg-emerald-100 text-emerald-600' :
                    order.status === 'PENDING_PAYMENT' ? 'bg-amber-100 text-amber-600' :
                    'bg-slate-100 text-slate-600'
                  }`}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
            <Package size={48} className="text-slate-300 mb-4" strokeWidth={1} />
            <h4 className="text-lg font-bold text-slate-700 mb-2">Belum Ada Pesanan</h4>
            <p className="text-slate-500 max-w-sm mb-6 leading-relaxed">
              Wah, tokomu masih sepi nih. Coba perbanyak variasi produk dan berikan promosi menarik agar pembeli berdatangan!
            </p>
            <Link href="/seller/products" className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl shadow-sm hover:bg-slate-50 transition-colors">
              Tambah Produk
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
