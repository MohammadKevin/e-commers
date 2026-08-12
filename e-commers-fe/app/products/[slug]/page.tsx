"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";
import Header from "@/components/Header";
import {
  Loader2, ShoppingCart, Zap, Star, ChevronLeft, ChevronRight,
  Heart, Share2, Store, Package, Shield, Truck, PackageOpen,
} from "lucide-react";

interface Variant { id: string; name: string; price: number; stock: number; }
interface Review { id: string; rating: number; comment: string; user: { fullName: string } }
interface Product {
  id: string; name: string; slug: string; description: string;
  images: { id: string; imageUrl: string }[];
  variants: Variant[];
  reviews: Review[];
  store: { id: string; name: string; slug: string };
  category?: { name: string };
}

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div className={`fixed top-24 right-6 z-[100] px-5 py-3 rounded-2xl shadow-xl text-white text-sm font-semibold flex items-center gap-2 animate-bounce-once transition-all
      ${type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
      {type === "success" ? "✅" : "❌"} {message}
    </div>
  );
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const s = size === "lg" ? "w-5 h-5" : "w-4 h-4";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${s} ${i <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-slate-300 fill-slate-200"}`} />
      ))}
    </div>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<"desc" | "review">("desc");
  const [addingToCart, setAddingToCart] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    if (slug) fetchProduct();
  }, [slug]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products/${slug}`);
      const p = res.data;
      setProduct(p);
      if (p.variants?.length > 0) setSelectedVariant(p.variants[0]);
      // Fetch reviews
      const revRes = await api.get(`/reviews/product/${p.id}`);
      setReviews(revRes.data.reviews || []);
      setAverageRating(revRes.data.averageRating || 0);
      setTotalReviews(revRes.data.totalReviews || 0);
    } catch (e: any) {
      setError("Produk tidak ditemukan atau terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (buyNow = false) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/login");
      return;
    }
    if (!selectedVariant) {
      showToast("Pilih varian produk terlebih dahulu", "error");
      return;
    }
    setAddingToCart(true);
    try {
      await api.post("/cart/items", { variantId: selectedVariant.id, quantity });
      showToast("Berhasil ditambahkan ke keranjang!", "success");
      if (buyNow) {
        setTimeout(() => router.push("/cart"), 500);
      }
    } catch (e: any) {
      const msg = e.response?.data?.message || "Gagal menambahkan ke keranjang";
      showToast(msg, "error");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) { router.push("/login"); return; }
    if (!product) return;
    try {
      await api.post(`/wishlists/${product.id}`);
      setWishlisted(!wishlisted);
      showToast(wishlisted ? "Dihapus dari wishlist" : "Ditambahkan ke wishlist!", "success");
    } catch {
      showToast("Gagal mengubah wishlist", "error");
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

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <PackageOpen className="w-16 h-16 text-slate-300" />
          <p className="text-slate-500 text-lg">{error || "Produk tidak ditemukan"}</p>
          <Link href="/" className="text-cyan-600 font-medium hover:underline">Kembali ke Beranda</Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [];
  const currentImg = images[activeImage]?.imageUrl;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />
      {toast && <Toast message={toast.message} type={toast.type} />}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-cyan-600">Beranda</Link>
          <ChevronRight className="w-4 h-4" />
          {product.category && <><span className="hover:text-cyan-600 cursor-pointer">{product.category.name}</span><ChevronRight className="w-4 h-4" /></>}
          <span className="text-slate-800 font-medium line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Image Gallery */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
              {currentImg ? (
                <Image src={currentImg} alt={product.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <PackageOpen className="w-20 h-20 text-slate-200" />
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={() => setActiveImage(Math.max(0, activeImage - 1))} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 shadow-md rounded-full p-2 hover:bg-white transition-colors">
                    <ChevronLeft className="w-5 h-5 text-slate-700" />
                  </button>
                  <button onClick={() => setActiveImage(Math.min(images.length - 1, activeImage + 1))} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 shadow-md rounded-full p-2 hover:bg-white transition-colors">
                    <ChevronRight className="w-5 h-5 text-slate-700" />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={img.id} onClick={() => setActiveImage(i)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${i === activeImage ? "border-cyan-500 shadow-md" : "border-slate-200 hover:border-cyan-300"}`}>
                    <Image src={img.imageUrl} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-5">
            {product.category && (
              <span className="text-xs font-semibold text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full w-fit border border-cyan-100">{product.category.name}</span>
            )}
            <h1 className="text-2xl font-bold text-slate-800 leading-snug">{product.name}</h1>

            {/* Rating Row */}
            <div className="flex items-center gap-3">
              <StarRating rating={averageRating} />
              <span className="text-sm font-semibold text-slate-700">{averageRating.toFixed(1)}</span>
              <span className="text-sm text-slate-400">({totalReviews} ulasan)</span>
            </div>

            {/* Price */}
            {selectedVariant && (
              <div className="bg-cyan-50 border border-cyan-100 rounded-2xl px-5 py-4">
                <p className="text-3xl font-extrabold text-cyan-700">
                  Rp {Number(selectedVariant.price).toLocaleString("id-ID")}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Stok: <span className={`font-semibold ${selectedVariant.stock > 5 ? "text-emerald-600" : "text-red-500"}`}>{selectedVariant.stock} tersisa</span>
                </p>
              </div>
            )}

            {/* Store Badge */}
            <Link href={`/store/${product.store?.slug}`} className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3 hover:border-cyan-300 hover:bg-cyan-50 transition-all w-fit">
              <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                <Store className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{product.store?.name}</p>
                <p className="text-xs text-cyan-600">Lihat Toko</p>
              </div>
            </Link>

            {/* Variant Selector */}
            {product.variants?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">Pilih Varian:</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button key={v.id} onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${selectedVariant?.id === v.id
                        ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                        : "border-slate-200 text-slate-600 hover:border-cyan-300 hover:bg-slate-50"} ${v.stock === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
                      disabled={v.stock === 0}>
                      {v.name}
                      {v.stock === 0 && <span className="ml-1 text-[10px] text-red-400">(Habis)</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Jumlah:</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-xl border-2 border-slate-200 flex items-center justify-center text-slate-600 hover:border-cyan-400 hover:bg-cyan-50 transition-all font-bold text-lg">−</button>
                <span className="w-12 text-center font-bold text-slate-800 text-lg">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(selectedVariant?.stock || 1, quantity + 1))}
                  className="w-10 h-10 rounded-xl border-2 border-slate-200 flex items-center justify-center text-slate-600 hover:border-cyan-400 hover:bg-cyan-50 transition-all font-bold text-lg">+</button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-2">
              <button onClick={() => handleAddToCart(false)} disabled={addingToCart || !selectedVariant || selectedVariant.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 border-2 border-cyan-500 text-cyan-600 font-bold rounded-2xl hover:bg-cyan-50 transition-all disabled:opacity-50">
                {addingToCart ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
                Tambah ke Keranjang
              </button>
              <button onClick={() => handleAddToCart(true)} disabled={addingToCart || !selectedVariant || selectedVariant.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-2xl hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/30 disabled:opacity-50">
                <Zap className="w-5 h-5" />
                Beli Sekarang
              </button>
            </div>

            {/* Wishlist & Share */}
            <div className="flex gap-3">
              <button onClick={handleToggleWishlist}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${wishlisted ? "border-red-200 bg-red-50 text-red-500" : "border-slate-200 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-500"}`}>
                <Heart className={`w-4 h-4 ${wishlisted ? "fill-red-400" : ""}`} />
                {wishlisted ? "Tersimpan" : "Simpan"}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 transition-all">
                <Share2 className="w-4 h-4" />
                Bagikan
              </button>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-3 mt-2">
              {[
                { icon: <Shield className="w-5 h-5 text-cyan-600" />, label: "Produk Asli" },
                { icon: <Truck className="w-5 h-5 text-cyan-600" />, label: "Gratis Ongkir" },
                { icon: <Package className="w-5 h-5 text-cyan-600" />, label: "Garansi Toko" },
              ].map((g, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
                  {g.icon}
                  <span className="text-[11px] font-medium text-slate-600">{g.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs: Deskripsi | Ulasan */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-200">
            {[
              { key: "desc", label: "Deskripsi Produk" },
              { key: "review", label: `Ulasan (${totalReviews})` },
            ].map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key as "desc" | "review")}
                className={`px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === tab.key
                  ? "border-cyan-500 text-cyan-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === "desc" ? (
              <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                {product.description || "Tidak ada deskripsi untuk produk ini."}
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {/* Summary */}
                <div className="flex items-center gap-6 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-center">
                    <p className="text-5xl font-extrabold text-slate-800">{averageRating.toFixed(1)}</p>
                    <StarRating rating={averageRating} size="lg" />
                    <p className="text-sm text-slate-500 mt-1">{totalReviews} ulasan</p>
                  </div>
                </div>

                {reviews.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    <Star className="w-10 h-10 mx-auto mb-3 text-slate-200 fill-slate-200" />
                    <p>Belum ada ulasan untuk produk ini.</p>
                  </div>
                ) : (
                  reviews.map((r) => (
                    <div key={r.id} className="flex gap-4 pb-5 border-b border-slate-100 last:border-0">
                      <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-700 font-bold shrink-0 uppercase">
                        {r.user?.fullName?.charAt(0) || "U"}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-slate-800">{r.user?.fullName || "Pengguna"}</p>
                          <StarRating rating={r.rating} />
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{r.comment || "—"}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
