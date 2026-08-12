"use client";

import { useRouter } from "next/navigation";
import { LogOut, Bell, Menu } from "lucide-react";

export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-4 text-slate-800">
        <button className="md:hidden p-2 -ml-2 rounded-md hover:bg-gray-100 transition-colors">
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold tracking-tight hidden md:block">Administrator Panel</h1>
      </div>

      <div className="flex items-center gap-5">
        <button className="text-gray-400 hover:text-slate-800 transition-colors relative p-1 rounded-full hover:bg-gray-100">
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          <Bell className="w-5 h-5" />
        </button>

        <div className="h-6 w-px bg-gray-200"></div>

        <button 
          onClick={handleLogout}
          className="text-sm font-semibold text-gray-600 hover:text-red-600 transition-colors flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}
