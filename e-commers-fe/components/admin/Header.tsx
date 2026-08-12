"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, LogOut, Menu, ChevronRight } from "lucide-react";

const BREADCRUMB_MAP: Record<string, string> = {
  admin: "Dashboard Utama",
  finance: "Keuangan",
  marketing: "Pemasaran",
  operations: "Operasional",
  seller: "Dashboard Toko",
  products: "Produk",
  orders: "Pesanan",
  settings: "Pengaturan",
  users: "Pengguna",
  stores: "Toko",
  vouchers: "Voucher",
  tickets: "Tiket & Bantuan",
  finance: "Keuangan Toko",
};

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState("User");
  const [role, setRole] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        if (u.fullName) setUserName(u.fullName);
        if (u.globalRole) setRole(u.globalRole);
      } catch {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const segments = pathname?.split("/").filter(Boolean) || [];
  const breadcrumbs = segments.map(seg => BREADCRUMB_MAP[seg] || seg.replace(/-/g, " "));

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <button className="md:hidden p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
          <Menu size={20} className="text-slate-600" />
        </button>
        <div className="hidden sm:flex items-center gap-1.5">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight size={14} className="text-slate-300" />}
              <span className={i === breadcrumbs.length - 1 ? "font-semibold text-slate-800 capitalize" : "capitalize"}>
                {crumb}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Notification */}
        <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-7 w-px bg-slate-200 mx-1"></div>

        {/* User Info */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="hidden sm:block text-sm font-medium text-slate-700">{userName}</span>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}
