"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState("ADMIN");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payloadBase64 = token.split(".")[1];
        const payload = JSON.parse(atob(payloadBase64));
        if (payload.globalRole) setRole(payload.globalRole);
      } catch (err) {}
    }
  }, []);

  const allMenuItems = [
    { name: "Dashboard Utama", href: "/admin", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", roles: ["SUPER_ADMIN"] },
    
    // Finance
    { name: "Keuangan", href: "/finance", icon: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z", roles: ["SUPER_ADMIN", "FINANCE_ADMIN"] },
    
    // Marketing
    { name: "Pemasaran", href: "/marketing", icon: "M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z", roles: ["SUPER_ADMIN", "MARKETING_ADMIN"] },
    { name: "Voucher Global", href: "/marketing/vouchers", icon: "M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z", roles: ["SUPER_ADMIN", "MARKETING_ADMIN"] },
    
    // Operations
    { name: "Operasional", href: "/operations", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z", roles: ["SUPER_ADMIN", "OPERATIONS_CS"] },
    { name: "Tiket & Bantuan", href: "/operations/tickets", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", roles: ["SUPER_ADMIN", "OPERATIONS_CS"] },

    // Super Admin Specific
    { name: "Pengguna", href: "/admin/users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", roles: ["SUPER_ADMIN"] },
    { name: "Toko", href: "/admin/stores", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", roles: ["SUPER_ADMIN"] },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col hidden md:flex border-r border-slate-800">
      <div className="h-16 flex items-center px-6 border-b border-slate-800 shrink-0">
        <Link href="/admin" className="text-xl font-extrabold text-cyan-400 tracking-tight">
          sakserShop Admin
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm ${
                  isActive 
                    ? "bg-cyan-500/10 text-cyan-400" 
                    : "hover:bg-slate-800 hover:text-white"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="p-4 border-t border-slate-800 shrink-0">
        <div className="flex items-center gap-3 bg-slate-800 p-3 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold shrink-0 text-xs">
            {role.substring(0, 2)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{role.replace('_', ' ')}</p>
            <p className="text-xs text-slate-400 truncate">Staff Internal</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
