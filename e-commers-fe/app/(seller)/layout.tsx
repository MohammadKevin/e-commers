"use client";

import SidebarSeller from "@/components/seller/SidebarSeller";
import Header from "@/components/admin/Header";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Loader2, Store } from "lucide-react";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "authorized" | "no-store">("loading");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    // Decode JWT
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const role = payload.globalRole;
      // Admin roles tidak boleh akses seller
      if (["SUPER_ADMIN","FINANCE_ADMIN","MARKETING_ADMIN","OPERATIONS_CS"].includes(role)) {
        router.push("/admin");
        return;
      }
    } catch { router.push("/login"); return; }

    // Cek apakah punya toko
    api.get("/stores/my-stores")
      .then(res => {
        if (res.data && res.data.length > 0) {
          setStatus("authorized");
        } else {
          // Buyer yang belum punya toko → tampilkan opsi buka toko
          setStatus("no-store");
        }
      })
      .catch(() => setStatus("authorized")); // fallback: izinkan masuk, seller/page.tsx akan handle
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          <p className="font-medium text-sm">Memverifikasi akses seller...</p>
        </div>
      </div>
    );
  }

  if (status === "no-store") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Store className="w-10 h-10 text-blue-600" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Buka Toko Dulu</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Kamu belum terdaftar sebagai seller. Buka toko sekarang secara gratis dan mulai berjualan di sakserShop!
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setStatus("authorized")}
              className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-2xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all"
            >
              🛍️ Buka Toko Sekarang
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full bg-slate-100 text-slate-600 font-semibold py-3.5 rounded-2xl hover:bg-slate-200 transition-all"
            >
              ← Kembali Belanja
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans selection:bg-blue-200">
      <SidebarSeller />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
