"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, DollarSign, Megaphone, Ticket, Settings2,
  Users, Store, ShieldCheck, BarChart3, LogOut, ChevronDown
} from "lucide-react";

const allMenuItems = [
  {
    group: "Utama",
    items: [
      { name: "Ringkasan Sistem", href: "/admin", icon: LayoutDashboard, roles: ["SUPER_ADMIN"] },
    ],
  },
  {
    group: "Keuangan",
    items: [
      { name: "Dashboard Keuangan", href: "/finance", icon: DollarSign, roles: ["SUPER_ADMIN", "FINANCE_ADMIN"] },
    ],
  },
  {
    group: "Pemasaran",
    items: [
      { name: "Kampanye Marketing", href: "/marketing", icon: Megaphone, roles: ["SUPER_ADMIN", "MARKETING_ADMIN"] },
      { name: "Voucher Global", href: "/marketing/vouchers", icon: Ticket, roles: ["SUPER_ADMIN", "MARKETING_ADMIN"] },
    ],
  },
  {
    group: "Operasional",
    items: [
      { name: "Pusat Operasional", href: "/operations", icon: Settings2, roles: ["SUPER_ADMIN", "OPERATIONS_CS"] },
      { name: "Tiket & Bantuan", href: "/operations/tickets", icon: ShieldCheck, roles: ["SUPER_ADMIN", "OPERATIONS_CS"] },
    ],
  },
  {
    group: "Super Admin",
    items: [
      { name: "Manajemen Pengguna", href: "/admin/users", icon: Users, roles: ["SUPER_ADMIN"] },
      { name: "Manajemen Toko", href: "/admin/stores", icon: Store, roles: ["SUPER_ADMIN"] },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState("SUPER_ADMIN");
  const [userName, setUserName] = useState("Admin");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.globalRole) setRole(payload.globalRole);
      } catch {}
    }
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.fullName) setUserName(u.fullName);
      } catch {}
    }
  }, []);

  const ROLE_LABEL: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    FINANCE_ADMIN: "Finance Admin",
    MARKETING_ADMIN: "Marketing Admin",
    OPERATIONS_CS: "Operations CS",
  };

  const ROLE_COLOR: Record<string, string> = {
    SUPER_ADMIN: "from-cyan-500 to-blue-600",
    FINANCE_ADMIN: "from-emerald-500 to-teal-600",
    MARKETING_ADMIN: "from-pink-500 to-rose-600",
    OPERATIONS_CS: "from-indigo-500 to-violet-600",
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col hidden md:flex border-r border-slate-800/60">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-slate-800/60 shrink-0">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-md shadow-cyan-500/30">
            <BarChart3 size={16} className="text-white" />
          </div>
          <span className="text-lg font-extrabold text-white tracking-tight">sakserShop</span>
        </Link>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
        {allMenuItems.map(group => {
          const visibleItems = group.items.filter(item => item.roles.includes(role));
          if (visibleItems.length === 0) return null;
          return (
            <div key={group.group}>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">{group.group}</p>
              <nav className="space-y-0.5">
                {visibleItems.map(item => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm ${
                        isActive
                          ? "bg-white/10 text-white shadow-sm"
                          : "hover:bg-white/5 hover:text-slate-100 text-slate-400"
                      }`}
                    >
                      <Icon size={17} className={isActive ? "text-cyan-400" : ""} />
                      {item.name}
                      {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400"></div>}
                    </Link>
                  );
                })}
              </nav>
            </div>
          );
        })}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-800/60 shrink-0">
        <div className="flex items-center gap-3 bg-slate-800/60 p-3 rounded-2xl">
          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${ROLE_COLOR[role] || "from-cyan-500 to-blue-600"} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm`}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-semibold text-white truncate">{userName}</p>
            <p className="text-xs text-slate-400 truncate">{ROLE_LABEL[role] || role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
