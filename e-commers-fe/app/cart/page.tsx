"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Header from "@/components/Header";
import { Loader2, Trash2, ShoppingCart, PackageOpen, Plus, Minus, Store } from "lucide-react";

interface CartVariant {
  id: string; name: string; price: number; stock: number;
  product: { id: string; name: string; slug: string; images?: { imageUrl: string }[]; store: { id: string; name: string; slug: string } }
}
interface CartItem { id: string; quantity: number; variant: CartVariant; }
interface Cart { cartId: string; items: CartItem[]; subtotal: number; totalItems: number; }

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div className={`fixed top-24 right-6 z-[100] px-5 py-3 rounded-2xl shadow-xl text-white text-sm font-semibold flex items-center gap-2
      ${type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
      {type === "success" ? "✅" : "❌"} {message}
    </div>
  );
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    fetchCart();
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await api.get("/cart");
      setCart(res.data);
      // Select all items by default
      const allIds = new Set<string>((res.data.items || []).map((item: CartItem) => item.id));
      setSelectedItems(allIds);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQty: number, stock: number) => {
    if (newQty < 1 || newQty > stock) return;
    setUpdating(itemId);
    try {
      await api.patch(`/cart/items/${itemId}`, { quantity: newQty });
      await fetchCart();
    } catch {
      showToast("Gagal mengubah jumlah", "error");
    } finally {
      setUpdating(null);
    }
  };

  const deleteItem = async (itemId: string) => {
    setUpdating(itemId);
    try {
      await api.delete(`/cart/items/${itemId}`);
      showToast("Item dihapus dari keranjang", "success");
      await fetchCart();
    } catch {
      showToast("Gagal menghapus item", "error");
    } finally {
      setUpdating(null);
    }
  };

  const clearCart = async () => {
    if (!confirm("Hapus semua item dari keranjang?")) return;
    setClearing(true);
    try {
      await api.delete("/cart/clear");
      showToast("Keranjang dikosongkan", "success");
      await fetchCart();
    } catch {
      showToast("Gagal mengosongkan keranjang", "error");
    } finally {
      setClearing(false);
    }
  };

  const toggleItem = (id: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (!cart) return;
    if (selectedItems.size === cart.items.length) setSelectedItems(new Set());
    else setSelectedItems(new Set(cart.items.map(i => i.id)));
  };

  // Group by store
  const groupedByStore = () => {
    if (!cart?.items) return [];
    const map = new Map<string, { storeName: string; storeSlug: string; items: CartItem[] }>();
    for (const item of cart.items) {
      const sid = item.variant.product.store.id;
      if (!map.has(sid)) map.set(sid, { storeName: item.variant.product.store.name, storeSlug: item.variant.product.store.slug, items: [] });
      map.get(sid)!.items.push(item);
    }
    return Array.from(map.values());
  };

  const selectedTotal = () => {
    if (!cart?.items) return 0;
    return cart.items.filter(i => selectedItems.has(i.id)).reduce((sum, i) => sum + Number(i.variant.price) * i.quantity, 0);
  };

  const selectedCount = () => {
    if (!cart?.items) return 0;
    return cart.items.filter(i => selectedItems.has(i.id)).reduce((sum, i) => sum + i.quantity, 0);
  };

  const handleCheckout = () => {
    if (selectedItems.size === 0) { showToast("Pilih minimal 1 item untuk checkout", "error"); return; }
    // Store selected item ids for checkout
    localStorage.setItem("checkoutItems", JSON.stringify(Array.from(selectedItems)));
    router.push("/checkout");
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

  const groups = groupedByStore();

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />
      {toast && <Toast message={toast.message} type={toast.type} />}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center gap-3">
          <ShoppingCart className="w-7 h-7 text-cyan-600" /> Keranjang Belanja
        </h1>

        {!cart || cart.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-3xl border border-slate-200">
            <PackageOpen className="w-20 h-20 text-slate-200" />
            <p className="text-xl font-semibold text-slate-500">Keranjangmu masih kosong</p>
            <p className="text-slate-400 text-sm">Yuk, mulai belanja produk favoritmu!</p>
            <Link href="/" className="mt-2 px-6 py-3 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-700 transition-colors shadow-sm">
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {/* Select All + Clear */}
              <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-sm">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={selectedItems.size === cart.items.length && cart.items.length > 0}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded accent-cyan-600 cursor-pointer" />
                  <span className="text-sm font-semibold text-slate-700">Pilih Semua ({cart.items.length} produk)</span>
                </label>
                <button onClick={clearCart} disabled={clearing}
                  className="flex items-center gap-1.5 text-sm text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors font-medium disabled:opacity-50">
                  {clearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Hapus Semua
                </button>
              </div>

              {groups.map((group) => (
                <div key={group.storeSlug} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  {/* Store Header */}
                  <div className="flex items-center gap-2 px-5 py-3 bg-slate-50 border-b border-slate-100">
                    <Store className="w-4 h-4 text-cyan-600" />
                    <span className="text-sm font-bold text-slate-700">{group.storeName}</span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {group.items.map((item) => (
                      <div key={item.id} className="flex items-start gap-4 p-5">
                        {/* Checkbox */}
                        <input type="checkbox" checked={selectedItems.has(item.id)} onChange={() => toggleItem(item.id)}
                          className="mt-1 w-4 h-4 rounded accent-cyan-600 cursor-pointer shrink-0" />

                        {/* Image */}
                        <Link href={`/products/${item.variant.product.slug}`} className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 hover:border-cyan-300 transition-colors">
                          {item.variant.product.images?.[0]?.imageUrl ? (
                            <Image src={item.variant.product.images[0].imageUrl} alt={item.variant.product.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <PackageOpen className="w-8 h-8 text-slate-300" />
                            </div>
                          )}
                        </Link>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <Link href={`/products/${item.variant.product.slug}`} className="text-sm font-semibold text-slate-800 hover:text-cyan-700 line-clamp-2 transition-colors">
                            {item.variant.product.name}
                          </Link>
                          <p className="text-xs text-slate-500 mt-0.5">Varian: {item.variant.name}</p>
                          <p className="text-base font-extrabold text-cyan-700 mt-1.5">
                            Rp {Number(item.variant.price).toLocaleString("id-ID")}
                          </p>

                          <div className="flex items-center justify-between mt-3">
                            {/* Qty Controls */}
                            <div className="flex items-center gap-2">
                              <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant.stock)}
                                disabled={updating === item.id || item.quantity <= 1}
                                className="w-8 h-8 rounded-lg border-2 border-slate-200 flex items-center justify-center text-slate-600 hover:border-cyan-400 hover:bg-cyan-50 transition-all disabled:opacity-40">
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-8 text-center font-bold text-sm">
                                {updating === item.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto text-cyan-500" /> : item.quantity}
                              </span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant.stock)}
                                disabled={updating === item.id || item.quantity >= item.variant.stock}
                                className="w-8 h-8 rounded-lg border-2 border-slate-200 flex items-center justify-center text-slate-600 hover:border-cyan-400 hover:bg-cyan-50 transition-all disabled:opacity-40">
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-xs text-slate-400 ml-1">Stok: {item.variant.stock}</span>
                            </div>

                            {/* Delete */}
                            <button onClick={() => deleteItem(item.id)} disabled={updating === item.id}
                              className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors disabled:opacity-40">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-28">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Ringkasan Belanja</h2>
                <div className="flex flex-col gap-3 pb-4 border-b border-slate-100">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Total Harga ({selectedCount()} item)</span>
                    <span className="font-semibold">Rp {selectedTotal().toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Ongkos Kirim</span>
                    <span className="text-emerald-600 font-semibold">Dihitung di checkout</span>
                  </div>
                </div>
                <div className="flex justify-between text-lg font-extrabold text-slate-800 mt-4 mb-6">
                  <span>Subtotal</span>
                  <span className="text-cyan-700">Rp {selectedTotal().toLocaleString("id-ID")}</span>
                </div>
                <button onClick={handleCheckout}
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-2xl hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/30 text-base">
                  Lanjut ke Checkout ({selectedItems.size} dipilih)
                </button>
                <Link href="/" className="block text-center mt-3 text-sm text-cyan-600 font-medium hover:underline">
                  Lanjut Belanja
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
