"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.refresh(); // Refresh page to ensure server components update if needed
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
        <div className="flex items-center gap-3 md:gap-5 shrink-0 text-slate-600">
          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-red-500 border border-white"></span>
          </button>
          <div className="w-px h-6 bg-slate-200 hidden md:block"></div>
          
          {mounted && user ? (
            <div className="hidden md:flex items-center gap-3 relative group">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-9 h-9 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-700 font-bold border-2 border-cyan-200 uppercase">
                  {user.fullName ? user.fullName.charAt(0) : "U"}
                </div>
                <div className="text-sm font-medium text-slate-700">
                  {user.fullName || "User"}
                </div>
              </div>
              <button onClick={handleLogout} className="text-sm text-red-500 font-medium hover:underline ml-2">
                Keluar
              </button>
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
        <a href="#" className="hover:text-cyan-600 flex items-center gap-1 font-medium">Kategori <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg></a>
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
