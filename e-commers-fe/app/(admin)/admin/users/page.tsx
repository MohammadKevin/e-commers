"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Users, Search, Filter, Loader2, UserCheck, UserX,
  Crown, Star, ChevronDown, RefreshCw, Mail, Phone
} from "lucide-react";

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  globalRole: string;
  tier: string;
  createdAt: string;
  isAffiliate: boolean;
}

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  USER: { label: "User", color: "text-slate-600", bg: "bg-slate-100 border-slate-200" },
  SUPER_ADMIN: { label: "Super Admin", color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
  FINANCE_ADMIN: { label: "Finance", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  MARKETING_ADMIN: { label: "Marketing", color: "text-pink-700", bg: "bg-pink-50 border-pink-200" },
  OPERATIONS_CS: { label: "Operations", color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200" },
};

const TIER_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  SILVER: { label: "Silver", color: "text-slate-500", icon: "🥈" },
  GOLD: { label: "Gold", color: "text-amber-500", icon: "🥇" },
  PLATINUM: { label: "Platinum", color: "text-cyan-500", icon: "💎" },
};

const DEMO_USERS: User[] = [
  { id: "1", fullName: "Ahmad Fauzi", email: "ahmad@example.com", phone: "081234567890", globalRole: "USER", tier: "SILVER", createdAt: new Date().toISOString(), isAffiliate: false },
  { id: "2", fullName: "Siti Rahmawati", email: "siti@example.com", phone: "082345678901", globalRole: "USER", tier: "GOLD", createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), isAffiliate: true },
  { id: "3", fullName: "Budi Santoso", email: "budi@example.com", phone: "083456789012", globalRole: "USER", tier: "PLATINUM", createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), isAffiliate: false },
  { id: "4", fullName: "Finance Manager", email: "finance@sakser.com", phone: null as any, globalRole: "FINANCE_ADMIN", tier: "SILVER", createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), isAffiliate: false },
  { id: "5", fullName: "Marketing Team", email: "marketing@sakser.com", phone: null as any, globalRole: "MARKETING_ADMIN", tier: "SILVER", createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), isAffiliate: false },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  useEffect(() => {
    const timer = setTimeout(() => {
      setUsers(DEMO_USERS);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filtered = users.filter(u => {
    const matchSearch = u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "ALL" || u.globalRole === roleFilter;
    return matchSearch && matchRole;
  });

  const roleCounts = users.reduce((acc, u) => {
    acc[u.globalRole] = (acc[u.globalRole] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-500 mb-4" />
        <p className="animate-pulse font-medium">Memuat data pengguna...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Pengguna</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola semua akun pengguna dan hak akses platform.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors text-sm font-medium">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Pengguna", value: users.length, color: "text-slate-700", bg: "bg-white", icon: Users },
          { label: "User Aktif", value: roleCounts.USER || 0, color: "text-cyan-700", bg: "bg-cyan-50", icon: UserCheck },
          { label: "Staff Admin", value: users.filter(u => u.globalRole !== "USER").length, color: "text-purple-700", bg: "bg-purple-50", icon: Crown },
          { label: "Affiliate", value: users.filter(u => u.isAffiliate).length, color: "text-amber-700", bg: "bg-amber-50", icon: Star },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center mb-3 border border-slate-100`}>
                <Icon size={18} className={item.color} />
              </div>
              <p className="text-2xl font-extrabold text-slate-800">{item.value}</p>
              <p className="text-sm text-slate-500 mt-0.5">{item.label}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50 outline-none transition-all text-sm"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50 outline-none transition-all text-sm text-slate-700 font-medium"
        >
          <option value="ALL">Semua Role</option>
          <option value="USER">User</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="FINANCE_ADMIN">Finance Admin</option>
          <option value="MARKETING_ADMIN">Marketing Admin</option>
          <option value="OPERATIONS_CS">Operations CS</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <p className="text-sm font-semibold text-slate-600">{filtered.length} pengguna ditemukan</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50/30">
                <th className="px-6 py-4 font-semibold">Pengguna</th>
                <th className="px-6 py-4 font-semibold">Kontak</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Tier</th>
                <th className="px-6 py-4 font-semibold">Bergabung</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(user => {
                const roleCfg = ROLE_CONFIG[user.globalRole] || ROLE_CONFIG.USER;
                const tierCfg = TIER_CONFIG[user.tier] || TIER_CONFIG.SILVER;
                return (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{user.fullName}</p>
                          {user.isAffiliate && (
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-100">Affiliate</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm text-slate-600 flex items-center gap-1.5">
                          <Mail size={12} className="text-slate-400" /> {user.email}
                        </p>
                        {user.phone && (
                          <p className="text-xs text-slate-400 flex items-center gap-1.5">
                            <Phone size={12} /> {user.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${roleCfg.bg} ${roleCfg.color}`}>
                        {roleCfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-semibold ${tierCfg.color}`}>
                        {tierCfg.icon} {tierCfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                        Aktif
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-400">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Tidak ada pengguna ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
}
