"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Package, ShoppingBag, Wallet, Settings,
  BarChart3, ChevronRight
} from "lucide-react";

const menuItems = [
  { name: "Dashboard Toko", href: "/seller", icon: LayoutDashboard, exact: true },
  { name: "Pesanan Masuk", href: "/seller/orders", icon: ShoppingBag },
  { name: "Produk Saya", href: "/seller/products", icon: Package },
  { name: "Saldo & Keuangan", href: "/seller/finance", icon: Wallet },
  { name: "Pengaturan Toko", href: "/seller/settings", icon: Settings },
];

export default function SidebarSeller() {
  const pathname = usePathname();
  const [storeName, setStoreName] = useState("Toko Saya");
  const [userName, setUserName] = useState("Seller");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        if (u.fullName) setUserName(u.fullName);
      } catch {}
    }
  }, []);

  return (
    <aside className="w-64 bg-white text-slate-700 min-h-screen flex flex-col hidden md:flex border-r border-slate-200/80 shadow-sm">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-slate-200/80 shrink-0">
        <Link href="/seller" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm shadow-blue-500/30">
            <BarChart3 size={16} className="text-white" />
          </div>
          <div>
            <span className="text-base font-extrabold text-slate-800 tracking-tight block leading-none">Seller Center</span>
            <span className="text-[10px] text-slate-400 font-medium">sakserShop</span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-5 px-3">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Menu</p>
        <nav className="space-y-0.5">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "hover:bg-slate-50 hover:text-slate-900 text-slate-600"
                }`}
              >
                <Icon size={17} className={isActive ? "text-blue-600" : "text-slate-400"} />
                {item.name}
                {isActive && <ChevronRight size={14} className="ml-auto text-blue-400" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-200/80 shrink-0">
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-semibold text-slate-800 truncate">{userName}</p>
            <p className="text-xs text-slate-400 truncate">Seller</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
