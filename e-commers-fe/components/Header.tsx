"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { ShoppingCart, User, Heart, Package, Store, LogOut, ChevronDown } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (mounted && user) {
      fetchCartCount();
    }
  }, [mounted, user]);

  const fetchCartCount = async () => {
    try {
      const res = await api.get("/cart");
      setCartCount(res.data.totalItems || 0);
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setCartCount(0);
    setDropdownOpen(false);
    router.push("/login");
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center gap-4 md:gap-8">
        {/* Logo */}
        <Link href="/" className="text-3xl font-extrabold text-cyan-600 tracking-tight shrink-0 flex items-center gap-1">
          sakserShop
        </Link>

        {/* Search Bar */}
        <div className="flex-1 flex items-center">
          <div className="w-full flex bg-white border-2 border-cyan-500/30 hover:border-cyan-500 rounded-xl overflow-hidden transition-colors shadow-inner">
            <input
              type="text"
              placeholder="Cari di sakserShop..."
              className="w-full px-4 py-2.5 outline-none text-sm bg-transparent"
            />
            <button className="bg-cyan-50 px-5 text-cyan-600 flex items-center justify-center hover:bg-cyan-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-3 md:gap-4 shrink-0 text-slate-600">
          {/* Wishlist */}
          {mounted && user && (
            <Link href="/wishlist" className="p-2 hover:bg-slate-100 rounded-full transition-colors relative hidden md:flex items-center justify-center" title="Wishlist">
              <Heart className="w-6 h-6" />
            </Link>
          )}

          {/* Cart */}
          <Link href="/cart" className="p-2 hover:bg-slate-100 rounded-full transition-colors relative flex items-center justify-center">
            <ShoppingCart className="w-6 h-6" />
            {mounted && cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 border-2 border-white text-white text-[10px] font-bold">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          <div className="w-px h-6 bg-slate-200 hidden md:block"></div>

          {mounted && user ? (
            <div className="hidden md:flex items-center gap-2 relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 px-2 py-1.5 rounded-xl transition-colors"
              >
                <div className="w-9 h-9 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-700 font-bold border-2 border-cyan-200 uppercase shrink-0">
                  {user.fullName ? user.fullName.charAt(0) : "U"}
                </div>
                <div className="text-sm font-medium text-slate-700 max-w-[100px] truncate">
                  {user.fullName || "User"}
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-800 truncate">{user.fullName}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                  <Link href="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 transition-colors">
                    <User className="w-4 h-4" />
                    Profil Saya
                  </Link>
                  <Link href="/orders" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 transition-colors">
                    <Package className="w-4 h-4" />
                    Pesananku
                  </Link>
                  <Link href="/wishlist" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 transition-colors">
                    <Heart className="w-4 h-4" />
                    Wishlist
                  </Link>
                  <Link href="/seller" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 transition-colors">
                    <Store className="w-4 h-4" />
                    Jadi Penjual
                  </Link>
                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left">
                      <LogOut className="w-4 h-4" />
                      Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : mounted ? (
            <>
              <Link href="/login" className="hidden md:flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-xl transition-colors shadow-sm shadow-cyan-600/30">
                Masuk
              </Link>
              <Link href="/register" className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border-2 border-cyan-600 text-cyan-600 hover:bg-cyan-50 font-medium rounded-xl transition-colors">
                Daftar
              </Link>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 opacity-0">Loading...</div>
          )}
        </div>
      </div>

      {/* Category Nav */}
      <div className="max-w-7xl mx-auto px-6 pb-3 flex gap-6 text-sm text-slate-600 overflow-x-auto no-scrollbar whitespace-nowrap">
        <a href="#" className="hover:text-cyan-600 flex items-center gap-1 font-medium">
          Kategori
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
        </a>
        <a href="#" className="hover:text-cyan-600">Kesehatan</a>
        <a href="#" className="hover:text-cyan-600">Komputer & Laptop</a>
        <a href="#" className="hover:text-cyan-600">Pakaian Pria</a>
        <a href="#" className="hover:text-cyan-600">Pakaian Wanita</a>
        <a href="#" className="hover:text-cyan-600">Otomotif</a>
        <a href="#" className="hover:text-cyan-600">Buku & Alat Tulis</a>
      </div>
    </header>
  );
}
