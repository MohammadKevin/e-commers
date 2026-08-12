"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Header from "@/components/Header";
import { Loader2, MapPin, Truck, ShoppingBag, Tag, Plus, CheckCircle2, ChevronRight, Zap, Package, Clock, Gift } from "lucide-react";

interface Address {
  id: string; label: string; recipient: string; phone: string;
  fullAddress: string; city: string; province: string; postalCode: string; isPrimary: boolean;
}
interface ShippingOption {
  courierName: string; courierService: string; serviceType: 'INSTANT'|'EXPRESS'|'REGULAR'|'CARGO';
  description: string; cost: number; estimatedDays: string; badge?: string;
}
interface CartItem {
  id: string; quantity: number;
  variant: { id: string; name: string; price: number; stock: number; product: { id: string; name: string; slug: string; store: { id: string; name: string; slug: string } } }
}
interface Voucher {
  id: string; code: string; discountPercent?: number; discountAmount?: number;
  minPurchase?: number; maxDiscount?: number; endDate: string;
}

function Toast({ message, type }: { message: string; type: "success"|"error" }) {
  return (
    <div className={`fixed top-24 right-6 z-[100] px-5 py-3 rounded-2xl shadow-xl text-white text-sm font-semibold flex items-center gap-2 animate-in slide-in-from-right-4 duration-300
      ${type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
      {type === "success" ? "✅" : "❌"} {message}
    </div>
  );
}

const SERVICE_TYPE_CONFIG = {
  INSTANT: { label: "Instan", icon: Zap, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  EXPRESS: { label: "Kilat", icon: Zap, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
  REGULAR: { label: "Reguler", icon: Truck, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  CARGO: { label: "Kargo", icon: Package, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" },
};

const STEPS = [{ id:1,label:"Alamat"},{id:2,label:"Pengiriman"},{id:3,label:"Konfirmasi"}];

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [toast, setToast] = useState<{message:string;type:"success"|"error"}|null>(null);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address|null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label:"",recipient:"",phone:"",fullAddress:"",city:"",province:"",postalCode:"",isPrimary:false });

  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption|null>(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [activeServiceType, setActiveServiceType] = useState<string>("ALL");

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(false);

  // Auto voucher
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const [autoAppliedVoucher, setAutoAppliedVoucher] = useState<Voucher|null>(null);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherResult, setVoucherResult] = useState<{discountAmount:number;finalAmount:number;voucher:Voucher}|null>(null);
  const [applyingVoucher, setApplyingVoucher] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    fetchAddresses();
    fetchCart();
    fetchVouchers();
  }, []);

  const showToast = (message: string, type: "success"|"error") => {
    setToast({message,type});
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const res = await api.get("/users/addresses");
      setAddresses(res.data);
      const primary = res.data.find((a: Address) => a.isPrimary);
      if (primary) setSelectedAddress(primary);
      else if (res.data.length > 0) setSelectedAddress(res.data[0]);
    } catch { showToast("Gagal memuat alamat","error"); }
    finally { setLoadingAddresses(false); }
  };

  const fetchCart = async () => {
    setLoadingCart(true);
    try {
      const res = await api.get("/cart");
      let items: CartItem[] = res.data.items || [];
      const selectedIds: string[] = JSON.parse(localStorage.getItem("checkoutItems") || "[]");
      if (selectedIds.length > 0) items = items.filter(i => selectedIds.includes(i.id));
      setCartItems(items);
    } catch { showToast("Gagal memuat keranjang","error"); }
    finally { setLoadingCart(false); }
  };

  // Fetch vouchers & auto-apply best one
  const fetchVouchers = async () => {
    try {
      const res = await api.get("/vouchers");
      const vouchers: Voucher[] = res.data || [];
      setAvailableVouchers(vouchers);
    } catch {}
  };

  // Auto-apply best voucher after cart is loaded
  useEffect(() => {
    if (cartItems.length === 0 || availableVouchers.length === 0) return;
    const subtotal = cartItems.reduce((s, i) => s + Number(i.variant.price) * i.quantity, 0);
    // Find best voucher (highest discount value)
    let bestVoucher: Voucher | null = null;
    let bestDiscount = 0;
    for (const v of availableVouchers) {
      const minPurchase = v.minPurchase ? Number(v.minPurchase) : 0;
      if (subtotal < minPurchase) continue;
      let d = 0;
      if (v.discountPercent) {
        d = Math.round(subtotal * v.discountPercent / 100);
        if (v.maxDiscount) d = Math.min(d, Number(v.maxDiscount));
      } else if (v.discountAmount) {
        d = Math.min(Number(v.discountAmount), subtotal);
      }
      if (d > bestDiscount) { bestDiscount = d; bestVoucher = v; }
    }
    if (bestVoucher) {
      setAutoAppliedVoucher(bestVoucher);
      setVoucherResult({ discountAmount: bestDiscount, finalAmount: subtotal - bestDiscount, voucher: bestVoucher });
    }
  }, [cartItems, availableVouchers]);

  const saveAddress = async () => {
    if (!newAddress.label||!newAddress.recipient||!newAddress.phone||!newAddress.fullAddress||!newAddress.city||!newAddress.province||!newAddress.postalCode) {
      showToast("Lengkapi semua field alamat","error"); return;
    }
    setSavingAddress(true);
    try {
      await api.post("/users/addresses", newAddress);
      showToast("Alamat berhasil disimpan","success");
      setShowAddForm(false);
      setNewAddress({label:"",recipient:"",phone:"",fullAddress:"",city:"",province:"",postalCode:"",isPrimary:false});
      await fetchAddresses();
    } catch(e:any) { showToast(e.response?.data?.message||"Gagal menyimpan alamat","error"); }
    finally { setSavingAddress(false); }
  };

  const fetchShipping = async (address: Address) => {
    setLoadingShipping(true);
    try {
      const totalWeight = cartItems.reduce((sum, item) => sum + item.quantity * 500, 0) || 1000;
      const res = await api.post("/shipping/calculate", { originCity:"Jakarta Selatan", destinationCity:address.city, weightInGrams:totalWeight });
      setShippingOptions(res.data.options || []);
    } catch { showToast("Gagal memuat opsi pengiriman","error"); }
    finally { setLoadingShipping(false); }
  };

  const goToStep2 = () => {
    if (!selectedAddress) { showToast("Pilih alamat pengiriman","error"); return; }
    setStep(2); fetchShipping(selectedAddress);
  };
  const goToStep3 = () => {
    if (!selectedShipping) { showToast("Pilih metode pengiriman","error"); return; }
    setStep(3);
  };

  const applyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setApplyingVoucher(true);
    try {
      const subtotal = cartItems.reduce((s,i) => s + Number(i.variant.price)*i.quantity, 0);
      const res = await api.post("/vouchers/apply", { code:voucherCode, purchaseAmount:subtotal });
      setVoucherResult(res.data);
      setAutoAppliedVoucher(null);
      showToast("Voucher berhasil diterapkan!","success");
    } catch(e:any) { showToast(e.response?.data?.message||"Voucher tidak valid","error"); }
    finally { setApplyingVoucher(false); }
  };

  const placeOrder = async () => {
    if (!selectedAddress||!selectedShipping) { showToast("Lengkapi data pengiriman","error"); return; }
    if (cartItems.length===0) { showToast("Keranjang kosong","error"); return; }
    setPlacingOrder(true);
    try {
      const storeMap = new Map<string, CartItem[]>();
      for (const item of cartItems) {
        const sid = item.variant.product.store.id;
        if (!storeMap.has(sid)) storeMap.set(sid, []);
        storeMap.get(sid)!.push(item);
      }
      const orderIds: string[] = [];
      for (const [storeId, items] of storeMap.entries()) {
        const payload: any = {
          storeId, addressId:selectedAddress.id, shippingCost:selectedShipping.cost,
          items: items.map(i => ({ variantId:i.variant.id, quantity:i.quantity })),
        };
        if (voucherResult?.voucher?.id) payload.voucherId = voucherResult.voucher.id;
        const res = await api.post("/orders", payload);
        orderIds.push(res.data.id || res.data.order?.id);
      }
      localStorage.removeItem("checkoutItems");
      showToast("Pesanan berhasil dibuat!","success");
      setTimeout(() => router.push(`/payment/${orderIds[0]}`), 800);
    } catch(e:any) { showToast(e.response?.data?.message||"Gagal membuat pesanan","error"); }
    finally { setPlacingOrder(false); }
  };

  const subtotal = cartItems.reduce((s,i) => s + Number(i.variant.price)*i.quantity, 0);
  const shippingCost = selectedShipping?.cost || 0;
  const discount = voucherResult?.discountAmount || 0;
  const total = subtotal + shippingCost - discount;

  const groupedShipping = shippingOptions.reduce((acc, opt) => {
    const t = opt.serviceType || "REGULAR";
    if (!acc[t]) acc[t] = [];
    acc[t].push(opt);
    return acc;
  }, {} as Record<string, ShippingOption[]>);
  const serviceTypes = Object.keys(groupedShipping);
  const filteredShipping = activeServiceType === "ALL" ? shippingOptions : (groupedShipping[activeServiceType] || []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />
      {toast && <Toast message={toast.message} type={toast.type} />}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-extrabold text-slate-800 mb-8 flex items-center gap-3">
          <ShoppingBag className="w-7 h-7 text-cyan-600" /> Checkout
        </h1>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center gap-2 ${i < STEPS.length - 1 ? "flex-1" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 shrink-0 transition-all
                  ${step > s.id ? "bg-emerald-500 border-emerald-500 text-white" : step === s.id ? "bg-cyan-600 border-cyan-600 text-white" : "bg-white border-slate-300 text-slate-400"}`}>
                  {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                </div>
                <span className={`text-sm font-semibold hidden sm:block ${step === s.id ? "text-cyan-700" : step > s.id ? "text-emerald-600" : "text-slate-400"}`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${step > s.id ? "bg-emerald-400" : "bg-slate-200"} hidden sm:block`} />}
              {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-slate-300 sm:hidden shrink-0" />}
            </div>
          ))}
        </div>

        {/* STEP 1: Address */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><MapPin className="w-5 h-5 text-cyan-600" /> Alamat Pengiriman</h2>
                <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-1.5 text-sm text-cyan-600 font-semibold hover:bg-cyan-50 px-3 py-1.5 rounded-lg transition-colors">
                  <Plus className="w-4 h-4" /> Tambah Alamat
                </button>
              </div>

              {loadingAddresses ? (
                <div className="flex items-center gap-2 text-slate-500"><Loader2 className="w-5 h-5 animate-spin text-cyan-500" /> Memuat alamat...</div>
              ) : addresses.length === 0 && !showAddForm ? (
                <div className="text-center py-8 text-slate-400">
                  <MapPin className="w-10 h-10 mx-auto mb-2 text-slate-200" />
                  <p>Belum ada alamat tersimpan. Tambahkan alamat baru.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {addresses.map((addr) => (
                    <label key={addr.id} className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                      ${selectedAddress?.id === addr.id ? "border-cyan-500 bg-cyan-50" : "border-slate-200 hover:border-cyan-200"}`}>
                      <input type="radio" name="address" checked={selectedAddress?.id === addr.id} onChange={() => setSelectedAddress(addr)} className="mt-1 accent-cyan-600" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-800 text-sm">{addr.label}</span>
                          {addr.isPrimary && <span className="text-[10px] font-bold bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full">Utama</span>}
                        </div>
                        <p className="text-sm font-semibold text-slate-700">{addr.recipient} · {addr.phone}</p>
                        <p className="text-sm text-slate-500 mt-0.5">{addr.fullAddress}, {addr.city}, {addr.province} {addr.postalCode}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* Add Address Form */}
              {showAddForm && (
                <div className="mt-5 pt-5 border-t border-slate-100">
                  <h3 className="font-semibold text-slate-700 mb-4 text-sm">Tambah Alamat Baru</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: "label", label: "Label (Rumah, Kantor, dll)", placeholder: "Rumah" },
                      { key: "recipient", label: "Nama Penerima", placeholder: "Budi Santoso" },
                      { key: "phone", label: "Nomor HP", placeholder: "08123456789" },
                      { key: "city", label: "Kota/Kabupaten", placeholder: "Jakarta Selatan" },
                      { key: "province", label: "Provinsi", placeholder: "DKI Jakarta" },
                      { key: "postalCode", label: "Kode Pos", placeholder: "12345" },
                    ].map((field) => (
                      <div key={field.key}>
                        <label className="text-xs font-semibold text-slate-600 mb-1 block">{field.label}</label>
                        <input value={(newAddress as any)[field.key]} onChange={(e) => setNewAddress({ ...newAddress, [field.key]: e.target.value })}
                          placeholder={field.placeholder}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none text-sm" />
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-600 mb-1 block">Alamat Lengkap</label>
                      <textarea value={newAddress.fullAddress} onChange={(e) => setNewAddress({ ...newAddress, fullAddress: e.target.value })}
                        placeholder="Jl. Sudirman No. 1, RT 01 RW 02"
                        rows={2}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none text-sm resize-none" />
                    </div>
                    <div className="sm:col-span-2 flex items-center gap-2">
                      <input type="checkbox" id="isPrimary" checked={newAddress.isPrimary} onChange={(e) => setNewAddress({ ...newAddress, isPrimary: e.target.checked })} className="accent-cyan-600" />
                      <label htmlFor="isPrimary" className="text-sm text-slate-600 cursor-pointer">Jadikan alamat utama</label>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={saveAddress} disabled={savingAddress}
                      className="px-5 py-2.5 bg-cyan-600 text-white text-sm font-bold rounded-xl hover:bg-cyan-700 transition-colors flex items-center gap-2 disabled:opacity-50">
                      {savingAddress ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Simpan Alamat
                    </button>
                    <button onClick={() => setShowAddForm(false)} className="px-5 py-2.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-200 transition-colors">
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button onClick={goToStep2} disabled={!selectedAddress}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-2xl hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/30 disabled:opacity-50 text-base">
              Lanjut ke Pilih Pengiriman →
            </button>
          </div>
        )}

        {/* STEP 2: Shipping */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-cyan-600" />
                <span className="text-sm font-semibold text-slate-700">Dikirim ke: <span className="text-slate-500 font-normal">{selectedAddress?.city}, {selectedAddress?.province}</span></span>
              </div>
              <button onClick={() => setStep(1)} className="text-xs text-cyan-600 font-medium hover:underline">Ubah Alamat</button>
            </div>

            {/* Auto voucher banner */}
            {autoAppliedVoucher && (
              <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                  <Gift className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-emerald-800">🎉 Diskon Otomatis Diterapkan!</p>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    Voucher <span className="font-mono font-bold">{autoAppliedVoucher.code}</span> 
                    {autoAppliedVoucher.discountPercent ? ` — ${autoAppliedVoucher.discountPercent}% off` : ` — hemat Rp ${Number(autoAppliedVoucher.discountAmount).toLocaleString("id-ID")}`}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-extrabold text-emerald-700">-Rp {(voucherResult?.discountAmount || 0).toLocaleString("id-ID")}</p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-5">
                <Truck className="w-5 h-5 text-cyan-600" /> Pilih Metode Pengiriman
              </h2>

              {loadingShipping ? (
                <div className="flex items-center gap-2 text-slate-500 py-4"><Loader2 className="w-5 h-5 animate-spin text-cyan-500" /> Mencari kurir terbaik...</div>
              ) : shippingOptions.length === 0 ? (
                <div className="text-slate-400 text-sm py-4 text-center">Tidak ada opsi pengiriman tersedia.</div>
              ) : (
                <>
                  {/* Service type tabs */}
                  <div className="flex gap-2 mb-5 overflow-x-auto pb-1 no-scrollbar">
                    {["ALL", ...serviceTypes].map((type) => {
                      const cfg = SERVICE_TYPE_CONFIG[type as keyof typeof SERVICE_TYPE_CONFIG];
                      const count = type === "ALL" ? shippingOptions.length : (groupedShipping[type]?.length || 0);
                      return (
                        <button key={type} onClick={() => setActiveServiceType(type)}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 border transition-all
                            ${activeServiceType === type
                              ? "bg-cyan-600 text-white border-cyan-600 shadow-sm"
                              : "bg-white text-slate-600 border-slate-200 hover:border-cyan-200"
                            }`}>
                          {type === "ALL" ? "🚚 Semua" : (
                            <>{type === "INSTANT" ? "⚡" : type === "EXPRESS" ? "🚀" : type === "CARGO" ? "📦" : "🔵"} {cfg?.label || type}</>
                          )}
                          <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${activeServiceType === type ? "bg-white/20" : "bg-slate-100 text-slate-400"}`}>{count}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Description per type */}
                  {activeServiceType !== "ALL" && (
                    <div className={`mb-4 p-3 rounded-xl text-xs font-medium border ${SERVICE_TYPE_CONFIG[activeServiceType as keyof typeof SERVICE_TYPE_CONFIG]?.bg} ${SERVICE_TYPE_CONFIG[activeServiceType as keyof typeof SERVICE_TYPE_CONFIG]?.color} ${SERVICE_TYPE_CONFIG[activeServiceType as keyof typeof SERVICE_TYPE_CONFIG]?.border}`}>
                      {activeServiceType === "INSTANT" && "⚡ Pengiriman instan untuk kota yang sama — barang sampai dalam hitungan jam!"}
                      {activeServiceType === "EXPRESS" && "🚀 Pengiriman kilat prioritas — tiba 1-2 hari kerja dengan jaminan ketepatan waktu."}
                      {activeServiceType === "REGULAR" && "🔵 Pengiriman reguler — pilihan terpercaya dengan harga terjangkau, estimasi 2-4 hari."}
                      {activeServiceType === "CARGO" && "📦 Pengiriman kargo — solusi paling hemat untuk barang berat, estimasi 5-7 hari."}
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    {filteredShipping.map((opt, i) => {
                      const isSelected = selectedShipping?.courierService === opt.courierService && selectedShipping?.courierName === opt.courierName;
                      const typeColor = opt.serviceType === "INSTANT" ? "border-orange-400 bg-orange-50"
                        : opt.serviceType === "EXPRESS" ? "border-purple-400 bg-purple-50"
                        : opt.serviceType === "CARGO" ? "border-slate-400 bg-slate-50"
                        : "border-blue-400 bg-blue-50";
                      return (
                        <label key={i} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                          ${isSelected ? "border-cyan-500 bg-cyan-50 shadow-sm" : "border-slate-200 hover:border-cyan-200"}`}>
                          <input type="radio" name="shipping"
                            checked={isSelected}
                            onChange={() => setSelectedShipping(opt)}
                            className="accent-cyan-600 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800 text-sm">{opt.courierName}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeColor}`}>{opt.courierService}</span>
                                {opt.badge && <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{opt.badge}</span>}
                              </div>
                              <span className="font-extrabold text-cyan-700">Rp {Number(opt.cost).toLocaleString("id-ID")}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">{opt.description}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span className="text-xs font-medium text-slate-600">Estimasi: <strong>{opt.estimatedDays}</strong></span>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="px-5 py-3 border-2 border-slate-300 text-slate-600 font-semibold rounded-2xl hover:bg-slate-50 transition-colors">← Kembali</button>
              <button onClick={goToStep3} disabled={!selectedShipping}
                className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-2xl hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/30 disabled:opacity-50">
                Lanjut ke Konfirmasi →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Summary */}
        {step === 3 && (
          <div className="flex flex-col gap-5">

            {/* Auto voucher banner */}
            {autoAppliedVoucher && (
              <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                  <Gift className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-emerald-800">🎉 Diskon Terbaik Diterapkan Otomatis!</p>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    <span className="font-mono font-bold">{autoAppliedVoucher.code}</span>
                    {autoAppliedVoucher.discountPercent ? ` — ${autoAppliedVoucher.discountPercent}%` : ` — Rp ${Number(autoAppliedVoucher.discountAmount).toLocaleString("id-ID")}`}
                    {" "}off dari total belanja
                  </p>
                </div>
                <p className="text-lg font-extrabold text-emerald-700 shrink-0">-Rp {(voucherResult?.discountAmount||0).toLocaleString("id-ID")}</p>
              </div>
            )}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3"><MapPin className="w-4 h-4 text-cyan-600" /> Alamat Pengiriman</h3>
              <p className="text-sm font-semibold text-slate-800">{selectedAddress?.recipient} · {selectedAddress?.phone}</p>
              <p className="text-sm text-slate-500">{selectedAddress?.fullAddress}, {selectedAddress?.city}, {selectedAddress?.province} {selectedAddress?.postalCode}</p>
            </div>

            {/* Shipping Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3"><Truck className="w-4 h-4 text-cyan-600" /> Pengiriman</h3>
              <div className="flex justify-between text-sm">
                <span className="text-slate-700 font-semibold">{selectedShipping?.courierName} {selectedShipping?.courierService}</span>
                <span className="font-bold text-cyan-700">Rp {Number(selectedShipping?.cost || 0).toLocaleString("id-ID")}</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Estimasi {selectedShipping?.estimatedDays} hari</p>
            </div>

            {/* Items Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-3">Produk Dipesan</h3>
              {loadingCart ? (
                <Loader2 className="w-5 h-5 animate-spin text-cyan-500" />
              ) : (
                <div className="flex flex-col gap-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div>
                        <p className="font-medium text-slate-700 line-clamp-1">{item.variant.product.name}</p>
                        <p className="text-xs text-slate-400">Varian: {item.variant.name} × {item.quantity}</p>
                      </div>
                      <span className="font-bold text-slate-800 ml-4 shrink-0">Rp {(Number(item.variant.price) * item.quantity).toLocaleString("id-ID")}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Voucher */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3"><Tag className="w-4 h-4 text-cyan-600" /> Voucher</h3>
              <div className="flex gap-3">
                <input value={voucherCode} onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  placeholder="Masukkan kode voucher"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none text-sm font-mono" />
                <button onClick={applyVoucher} disabled={applyingVoucher || !voucherCode.trim()}
                  className="px-4 py-2.5 bg-cyan-600 text-white text-sm font-bold rounded-xl hover:bg-cyan-700 transition-colors flex items-center gap-2 disabled:opacity-50">
                  {applyingVoucher ? <Loader2 className="w-4 h-4 animate-spin" /> : "Pakai"}
                </button>
              </div>
              {voucherResult && (
                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium flex justify-between">
                  <span>✅ Diskon voucher</span>
                  <span>-Rp {Number(voucherResult.discountAmount).toLocaleString("id-ID")}</span>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex flex-col gap-2 text-sm text-slate-600">
                <div className="flex justify-between"><span>Subtotal Produk</span><span>Rp {subtotal.toLocaleString("id-ID")}</span></div>
                <div className="flex justify-between"><span>Ongkos Kirim</span><span>Rp {shippingCost.toLocaleString("id-ID")}</span></div>
                {discount > 0 && <div className="flex justify-between text-emerald-600"><span>Diskon Voucher</span><span>-Rp {discount.toLocaleString("id-ID")}</span></div>}
                <div className="flex justify-between text-lg font-extrabold text-slate-800 pt-2 border-t border-slate-100 mt-1">
                  <span>Total</span>
                  <span className="text-cyan-700">Rp {total.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="px-5 py-3 border-2 border-slate-300 text-slate-600 font-semibold rounded-2xl hover:bg-slate-50 transition-colors">← Kembali</button>
              <button onClick={placeOrder} disabled={placingOrder}
                className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-2xl hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/30 disabled:opacity-50 flex items-center justify-center gap-2">
                {placingOrder ? <Loader2 className="w-5 h-5 animate-spin" /> : "🎉"} Buat Pesanan
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
