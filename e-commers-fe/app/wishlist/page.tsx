"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Header from "@/components/Header";
import { Loader2, Heart, PackageOpen, ShoppingCart, Trash2, Star } from "lucide-react";

interface WishlistProduct {
  id: string; name: string; slug: string;
  images?: { imageUrl: string }[];
  variants?: { id: string; price: number; stock: number }[];
  store?: { name: string };
  averageRating?: number;
}

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div className={`fixed top-24 right-6 z-[100] px-5 py-3 rounded-2xl shadow-xl text-white text-sm font-semibold flex items-center gap-2
      ${type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
      {type === "success" ? "✅" : "❌"} {message}
    </div>
  );
}

export default function WishlistPage() {
  const router = useRouter();
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    fetchWishlist();
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await api.get("/wishlists");
      // API may return array of products or { products: [] }
      const data = Array.isArray(res.data) ? res.data : res.data.products || res.data.wishlists || [];
      setProducts(data);
    } catch {
      showToast("Gagal memuat wishlist", "error");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    setRemoving(productId);
    try {
      await api.post(`/wishlists/${productId}`); // toggle
      showToast("Dihapus dari wishlist", "success");
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch {
      showToast("Gagal menghapus dari wishlist", "error");
    } finally {
      setRemoving(null);
    }
  };

  const addToCart = async (product: WishlistProduct) => {
    const firstVariant = product.variants?.[0];
    if (!firstVariant) { showToast("Produk tidak memiliki varian", "error"); return; }
    setAddingToCart(product.id);
    try {
      await api.post("/cart/items", { variantId: firstVariant.id, quantity: 1 });
      showToast("Berhasil ditambahkan ke keranjang!", "success");
    } catch (e: any) {
      showToast(e.response?.data?.message || "Gagal menambahkan ke keranjang", "error");
    } finally {
      setAddingToCart(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />
      {toast && <Toast message={toast.message} type={toast.type} />}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-3">
            <Heart className="w-7 h-7 text-red-500 fill-red-500" /> Wishlist
            <span className="text-lg font-medium text-slate-400">({products.length})</span>
          </h1>
          {products.length > 0 && (
            <Link href="/cart" className="flex items-center gap-1.5 text-sm text-cyan-600 font-semibold hover:underline">
              <ShoppingCart className="w-4 h-4" /> Lihat Keranjang
            </Link>
          )}
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-200 gap-4">
            <Heart className="w-16 h-16 text-slate-200" />
            <p className="text-xl font-semibold text-slate-500">Wishlist kamu masih kosong</p>
            <p className="text-slate-400 text-sm">Simpan produk favoritmu di sini</p>
            <Link href="/" className="mt-2 px-6 py-3 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-700 transition-colors shadow-sm">
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((product) => {
              const price = product.variants?.[0]?.price;
              const stock = product.variants?.[0]?.stock || 0;
              const img = product.images?.[0]?.imageUrl;

              return (
                <div key={product.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-cyan-100 hover:border-cyan-300 transition-all group flex flex-col relative">
                  {/* Remove button */}
                  <button onClick={() => removeFromWishlist(product.id)} disabled={removing === product.id}
                    className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm border border-slate-200 disabled:opacity-50">
                    {removing === product.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>

                  {/* Image */}
                  <Link href={`/products/${product.slug}`} className="relative aspect-square bg-slate-100 overflow-hidden flex items-center justify-center">
                    {img ? (
                      <Image src={img} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <PackageOpen className="w-12 h-12 text-slate-300" />
                    )}
                    {stock === 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-xs font-bold bg-black/60 px-3 py-1 rounded-full">Stok Habis</span>
                      </div>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="p-3 flex flex-col flex-1">
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="text-sm font-semibold text-slate-700 line-clamp-2 leading-snug mb-1 hover:text-cyan-700 transition-colors">{product.name}</h3>
                    </Link>
                    {price !== undefined && (
                      <p className="font-extrabold text-base text-slate-800 mb-1">Rp {Number(price).toLocaleString("id-ID")}</p>
                    )}
                    {product.store && (
                      <p className="text-[10px] text-slate-400 mb-2">{product.store.name}</p>
                    )}
                    {product.averageRating && product.averageRating > 0 && (
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-medium text-slate-600">{product.averageRating.toFixed(1)}</span>
                      </div>
                    )}
                    <button onClick={() => addToCart(product)} disabled={addingToCart === product.id || stock === 0}
                      className="mt-auto w-full flex items-center justify-center gap-1.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      {addingToCart === product.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShoppingCart className="w-3.5 h-3.5" />}
                      {stock === 0 ? "Stok Habis" : "Ke Keranjang"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
