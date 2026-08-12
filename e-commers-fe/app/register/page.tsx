"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Store, CheckCircle2, Loader2, Eye, EyeOff } from "lucide-react";

type AccountType = "buyer" | "seller";

export default function RegisterPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType>("buyer");
  const [step, setStep] = useState<1 | 2>(1); // step 1 = pilih tipe, step 2 = isi form

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeCity, setStoreCity] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload: any = {
        fullName,
        email,
        password,
        isSeller: accountType === "seller",
      };
      if (phone) payload.phone = phone;
      if (accountType === "seller") {
        if (!storeName.trim()) { setError("Nama toko wajib diisi"); setLoading(false); return; }
        if (!storeCity.trim()) { setError("Kota toko wajib diisi"); setLoading(false); return; }
        payload.storeName = storeName.trim();
        payload.storeCity = storeCity.trim();
      }

      const res = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(Array.isArray(data.message) ? data.message[0] : data.message || "Gagal registrasi");

      // Auto-login setelah daftar
      if (data.accessToken) {
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));

        if (accountType === "seller") {
          router.push("/seller");
        } else {
          router.push("/");
        }
      } else {
        router.push("/login");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl">

        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-extrabold text-cyan-600 tracking-tight">
            sakserShop
          </Link>
          <p className="text-slate-500 mt-2 text-sm">Buat akun baru — gratis!</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="md:flex">

            {/* Left panel */}
            <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-cyan-500 to-blue-600 p-10 flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: "url(https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop)", backgroundSize: "cover", backgroundPosition: "center" }} />
              <div className="relative z-10">
                <h2 className="text-white text-3xl font-bold leading-tight mb-4">
                  {accountType === "seller" ? "Mulai Berjualan\ndi sakserShop" : "Belanja Lebih\nMudah & Hemat"}
                </h2>
                <p className="text-cyan-100 text-sm leading-relaxed">
                  {accountType === "seller"
                    ? "Jangkau jutaan pembeli, kelola produk dan pesanan dengan mudah. Bebas biaya pendaftaran!"
                    : "Temukan jutaan produk dengan penawaran terbaik, pengiriman cepat, dan diskon setiap hari."}
                </p>
              </div>

              <div className="relative z-10 space-y-3">
                {(accountType === "seller" ? [
                  "Buka toko gratis tanpa biaya",
                  "Kelola produk & pesanan mudah",
                  "Terima pembayaran instan",
                  "Analitik penjualan lengkap",
                ] : [
                  "Diskon & promo setiap hari",
                  "Pengiriman ke seluruh Indonesia",
                  "Pembayaran aman & terpercaya",
                  "Kembalikan barang mudah",
                ]).map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-200 shrink-0" />
                    <span className="text-cyan-50 text-sm">{item}</span>
                  </div>
                ))}
              </div>

              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-tl-full" />
            </div>

            {/* Right panel — Form */}
            <div className="flex-1 p-8 md:p-10">
              <button onClick={() => router.push("/")} className="text-slate-400 hover:text-cyan-600 text-sm font-medium flex items-center gap-1 mb-6 transition-colors">
                ← Kembali ke beranda
              </button>

              <h3 className="text-xl font-bold text-slate-800 mb-1">Buat Akun Baru</h3>
              <p className="text-slate-500 text-sm mb-6">
                Sudah punya akun?{" "}
                <Link href="/login" className="text-cyan-600 font-semibold hover:underline">Masuk di sini</Link>
              </p>

              {/* Account type selector */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setAccountType("buyer")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all text-center
                    ${accountType === "buyer"
                      ? "border-cyan-500 bg-cyan-50 shadow-sm shadow-cyan-100"
                      : "border-slate-200 hover:border-cyan-200 hover:bg-slate-50"}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accountType === "buyer" ? "bg-cyan-500" : "bg-slate-100"}`}>
                    <ShoppingBag className={`w-5 h-5 ${accountType === "buyer" ? "text-white" : "text-slate-400"}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${accountType === "buyer" ? "text-cyan-700" : "text-slate-600"}`}>Pembeli</p>
                    <p className="text-[11px] text-slate-400 leading-tight mt-0.5">Belanja produk favorit</p>
                  </div>
                  {accountType === "buyer" && (
                    <CheckCircle2 className="w-4 h-4 text-cyan-500 absolute top-2 right-2" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setAccountType("seller")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all text-center relative
                    ${accountType === "seller"
                      ? "border-blue-500 bg-blue-50 shadow-sm shadow-blue-100"
                      : "border-slate-200 hover:border-blue-200 hover:bg-slate-50"}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accountType === "seller" ? "bg-blue-500" : "bg-slate-100"}`}>
                    <Store className={`w-5 h-5 ${accountType === "seller" ? "text-white" : "text-slate-400"}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${accountType === "seller" ? "text-blue-700" : "text-slate-600"}`}>Penjual</p>
                    <p className="text-[11px] text-slate-400 leading-tight mt-0.5">Buka & kelola toko</p>
                  </div>
                  {accountType === "seller" && (
                    <CheckCircle2 className="w-4 h-4 text-blue-500 absolute top-2 right-2" />
                  )}
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Basic fields */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Lengkap *</label>
                  <input
                    type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                    placeholder="Budi Santoso" required
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email *</label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="nama@email.com" required
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nomor HP <span className="text-slate-400 font-normal">(opsional)</span></label>
                  <input
                    type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Minimal 6 karakter" required minLength={6}
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none text-sm transition-all"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Seller-only fields */}
                {accountType === "seller" && (
                  <div className="pt-2 pb-1 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5" /> Info Toko
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Toko *</label>
                        <input
                          type="text" value={storeName} onChange={e => setStoreName(e.target.value)}
                          placeholder="Contoh: Elektronik Jaya Store" required={accountType === "seller"}
                          className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all bg-blue-50/30"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Kota Toko *</label>
                        <input
                          type="text" value={storeCity} onChange={e => setStoreCity(e.target.value)}
                          placeholder="Contoh: Jakarta Selatan" required={accountType === "seller"}
                          className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all bg-blue-50/30"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-slate-400 pt-1">
                  Dengan mendaftar, kamu menyetujui{" "}
                  <a href="#" className="text-cyan-600 hover:underline">Syarat & Ketentuan</a> dan{" "}
                  <a href="#" className="text-cyan-600 hover:underline">Kebijakan Privasi</a> sakserShop.
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 font-bold rounded-2xl transition-all shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 text-white
                    ${accountType === "seller"
                      ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 hover:shadow-blue-600/30"
                      : "bg-cyan-600 hover:bg-cyan-700 shadow-cyan-600/20 hover:shadow-cyan-600/30"}`}
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Mendaftarkan akun...</>
                  ) : accountType === "seller" ? (
                    <><Store className="w-5 h-5" /> Daftar & Buka Toko Sekarang</>
                  ) : (
                    <><ShoppingBag className="w-5 h-5" /> Daftar Sebagai Pembeli</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
