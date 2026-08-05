"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { PlusCircle, Search, MoreVertical, PackageOpen, Loader2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  isPublished: boolean;
  images: { imageUrl: string }[];
  category: { name: string };
  variants: { price: string; stock: number }[];
}

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Dapatkan Store ID
      const storeRes = await api.get("/stores/my-stores");
      if (storeRes.data && storeRes.data.length > 0) {
        const id = storeRes.data[0].id;
        setStoreId(id);
        
        // 2. Fetch produk berdasarkan store ID
        const prodRes = await api.get(`/products?storeId=${id}&limit=50`);
        setProducts(prodRes.data.data || []);
      }
    } catch (error) {
      console.error("Gagal memuat data produk:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalStock = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.reduce((acc, curr) => acc + curr.stock, 0);
    }
    return 0;
  };

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
        <h2 className="text-xl font-bold text-slate-800 mb-2">Anda Belum Memiliki Toko</h2>
        <p className="text-slate-500 mb-6">Silakan buka toko terlebih dahulu di halaman Dashboard untuk dapat menambahkan produk.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Etalase Produk</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola stok, harga, dan informasi produk jualanmu.</p>
        </div>
        <button className="bg-blue-600 text-white font-semibold py-2.5 px-5 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all duration-300 flex items-center gap-2">
          <PlusCircle size={18} /> Tambah Produk
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama produk..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm"
            />
          </div>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 px-4">
            <PackageOpen size={64} className="text-slate-300 mb-4" strokeWidth={1} />
            <h4 className="text-lg font-bold text-slate-700 mb-2">Belum Ada Produk</h4>
            <p className="text-slate-500 max-w-sm mb-6 leading-relaxed text-sm">
              Toko kamu masih kosong. Tambahkan produk pertamamu sekarang agar pembeli bisa mulai berbelanja!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
                  <th className="p-4 pl-6 font-medium">Info Produk</th>
                  <th className="p-4 font-medium">Kategori</th>
                  <th className="p-4 font-medium">Harga</th>
                  <th className="p-4 font-medium">Stok Total</th>
                  <th className="p-4 font-medium text-center">Status</th>
                  <th className="p-4 font-medium text-right pr-6">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 text-sm">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                          {product.images && product.images.length > 0 ? (
                            <img src={product.images[0].imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <PackageOpen size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 line-clamp-2">{product.name}</p>
                          <p className="text-slate-400 text-xs mt-0.5">SKU: {product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">
                        {product.category?.name || "Uncategorized"}
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
                        product.isPublished ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${product.isPublished ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                        {product.isPublished ? "Aktif" : "Arsip"}
                      </div>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <button className="text-slate-400 hover:text-blue-600 transition-colors p-1.5 rounded-lg hover:bg-blue-50">
                        <MoreVertical size={18} />
                      </button>
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
