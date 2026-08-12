"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  PlusCircle, Search, PackageOpen, Loader2, X, Save,
  Plus, Trash2, AlertCircle, CheckCircle2, Edit2, Eye,
  EyeOff, Package
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  isPublished: boolean;
  images: { imageUrl: string }[];
  category: { name: string };
  variants: { id: string; name: string; price: string; stock: number; sku: string }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface VariantForm {
  name: string;
  price: string;
  stock: string;
  sku: string;
}

const EMPTY_FORM = {
  name: "",
  description: "",
  categoryId: "",
  imageUrls: [""],
  variants: [{ name: "Standard", price: "", stock: "", sku: "" }] as VariantForm[],
};

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const storeRes = await api.get("/stores/my-stores");
      if (storeRes.data?.length > 0) {
        const id = storeRes.data[0].id;
        setStoreId(id);
        const prodRes = await api.get(`/products?storeId=${id}&limit=50`);
        setProducts(prodRes.data.data || []);
      }
    } catch (err) {
      console.error("Gagal memuat produk:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/products/categories");
      setCategories(res.data || []);
    } catch (err) {}
  };

  const calculateTotalStock = (product: Product) => {
    if (product.variants?.length > 0) {
      return product.variants.reduce((acc, v) => acc + v.stock, 0);
    }
    return 0;
  };

  const addVariant = () => {
    setForm(f => ({ ...f, variants: [...f.variants, { name: "", price: "", stock: "", sku: "" }] }));
  };

  const removeVariant = (i: number) => {
    setForm(f => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }));
  };

  const updateVariant = (i: number, field: keyof VariantForm, value: string) => {
    setForm(f => ({
      ...f,
      variants: f.variants.map((v, idx) => idx === i ? { ...v, [field]: value } : v),
    }));
  };

  const addImageUrl = () => {
    setForm(f => ({ ...f, imageUrls: [...f.imageUrls, ""] }));
  };

  const removeImageUrl = (i: number) => {
    setForm(f => ({ ...f, imageUrls: f.imageUrls.filter((_, idx) => idx !== i) }));
  };

  const updateImageUrl = (i: number, value: string) => {
    setForm(f => ({ ...f, imageUrls: f.imageUrls.map((u, idx) => idx === i ? value : u) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) return;
    setSaving(true);
    setError("");

    try {
      // Auto-generate slug: nama → lowercase → hapus karakter aneh → spasi jadi dash → + timestamp unik
      const slug = form.name
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")   // hapus aksen
        .replace(/[^a-z0-9\s-]/g, "")                        // hapus karakter non-alphanumeric
        .trim()
        .replace(/\s+/g, "-")                                  // spasi → dash
        .replace(/-+/g, "-")                                   // double dash → single
        + "-" + Date.now().toString().slice(-7);              // tambah timestamp 7 digit
      const payload = {
        storeId,
        name: form.name,
        slug,
        description: form.description || "Tidak ada deskripsi",
        categoryId: form.categoryId || (categories[0]?.id ?? ""),
        images: form.imageUrls.filter(Boolean),
        variants: form.variants.map((v, i) => ({
          name: v.name || "Standard",
          sku: v.sku || `SKU-${Date.now()}-${i}`,
          price: Number(v.price),
          stock: Number(v.stock) || 0,
        })),
      };

      await api.post("/products", payload);
      setSuccess("Produk berhasil ditambahkan!");
      setShowForm(false);
      setForm(EMPTY_FORM);
      await fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menambahkan produk");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Hapus produk ini?")) return;
    try {
      await api.delete(`/products/${productId}`);
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      alert("Gagal menghapus produk");
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-400 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="font-medium animate-pulse">Memuat produk...</p>
      </div>
    );
  }

  if (!storeId) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center py-20">
        <Package size={56} className="text-slate-300 mx-auto mb-4" strokeWidth={1} />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Anda Belum Memiliki Toko</h2>
        <p className="text-slate-500 mb-6">Silakan buka toko terlebih dahulu di halaman Dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Etalase Produk</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola stok, harga, dan informasi produk jualanmu.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white font-semibold py-2.5 px-5 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all duration-300 flex items-center gap-2"
        >
          <PlusCircle size={18} /> Tambah Produk
        </button>
      </div>

      {/* Notification */}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
          <CheckCircle2 size={18} />
          <p className="font-medium text-sm">{success}</p>
        </div>
      )}

      {/* Create Product Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white p-6 border-b border-slate-100 flex justify-between items-center z-10 rounded-t-3xl">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <PlusCircle size={20} className="text-blue-600" />
                Tambah Produk Baru
              </h2>
              <button onClick={() => { setShowForm(false); setError(""); }} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Informasi Dasar</h3>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Produk *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Contoh: Kemeja Batik Premium"
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Kategori *</label>
                  <select
                    value={form.categoryId}
                    onChange={e => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none text-sm bg-white"
                  >
                    <option value="">Pilih kategori...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Deskripsi Produk</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Deskripsikan produk Anda secara detail..."
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none text-sm resize-none"
                  />
                </div>
              </div>

              {/* Images */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Foto Produk</h3>
                  <button type="button" onClick={addImageUrl} className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                    <Plus size={14} /> Tambah Foto
                  </button>
                </div>
                {form.imageUrls.map((url, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="url"
                      value={url}
                      onChange={e => updateImageUrl(i, e.target.value)}
                      placeholder="https://example.com/gambar.jpg"
                      className="flex-1 px-4 py-3 border border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none text-sm"
                    />
                    {form.imageUrls.length > 1 && (
                      <button type="button" onClick={() => removeImageUrl(i)} className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-colors">
                        <Trash2 size={16} />
                      </button>
                    )}
                    {url && (
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                        <img src={url} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = "none")} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Variants */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Varian & Harga *</h3>
                  <button type="button" onClick={addVariant} className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                    <Plus size={14} /> Tambah Varian
                  </button>
                </div>
                {form.variants.map((variant, i) => (
                  <div key={i} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500 uppercase">Varian {i + 1}</span>
                      {form.variants.length > 1 && (
                        <button type="button" onClick={() => removeVariant(i)} className="text-red-400 hover:text-red-600 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Varian</label>
                        <input
                          type="text"
                          value={variant.name}
                          onChange={e => updateVariant(i, "name", e.target.value)}
                          placeholder="Standard / Merah / XL"
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">SKU (opsional)</label>
                        <input
                          type="text"
                          value={variant.sku}
                          onChange={e => updateVariant(i, "sku", e.target.value)}
                          placeholder="SKU-001"
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Harga (Rp) *</label>
                        <input
                          type="number"
                          min={0}
                          value={variant.price}
                          onChange={e => updateVariant(i, "price", e.target.value)}
                          placeholder="50000"
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-sm bg-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Stok *</label>
                        <input
                          type="number"
                          min={0}
                          value={variant.stock}
                          onChange={e => updateVariant(i, "stock", e.target.value)}
                          placeholder="100"
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-sm bg-white"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {saving ? "Menyimpan Produk..." : "Simpan Produk"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Cari nama produk..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm"
            />
          </div>
          <span className="text-sm text-slate-400 hidden sm:block">{filtered.length} produk</span>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 px-4">
            <PackageOpen size={64} className="text-slate-300 mb-4" strokeWidth={1} />
            <h4 className="text-lg font-bold text-slate-700 mb-2">Belum Ada Produk</h4>
            <p className="text-slate-500 max-w-sm mb-6 leading-relaxed text-sm">
              Toko kamu masih kosong. Tambahkan produk pertamamu sekarang!
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-2xl hover:bg-blue-700 transition-colors"
            >
              Tambah Produk Pertama
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
                  <th className="p-4 pl-6 font-semibold">Info Produk</th>
                  <th className="p-4 font-semibold">Kategori</th>
                  <th className="p-4 font-semibold">Harga</th>
                  <th className="p-4 font-semibold">Stok</th>
                  <th className="p-4 font-semibold text-center">Status</th>
                  <th className="p-4 font-semibold text-right pr-6">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 text-sm">
                {filtered.map(product => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                          {product.images?.[0] ? (
                            <img src={product.images[0].imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <PackageOpen size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 line-clamp-2">{product.name}</p>
                          <p className="text-slate-400 text-xs mt-0.5">{product.variants?.length || 0} varian</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">
                        {product.category?.name || "—"}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-800">
                      Rp {Number(product.variants?.[0]?.price || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="p-4">
                      {calculateTotalStock(product) > 0 ? (
                        <span className="text-slate-700 font-medium">{calculateTotalStock(product)} pcs</span>
                      ) : (
                        <span className="text-red-500 font-semibold bg-red-50 px-2 py-0.5 rounded-md text-xs">Habis</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        product.isPublished
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${product.isPublished ? "bg-emerald-500" : "bg-slate-400"}`}></div>
                        {product.isPublished ? "Aktif" : "Arsip"}
                      </div>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                          title="Hapus produk"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
