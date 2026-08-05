"use client";

import SidebarSeller from "@/components/seller/SidebarSeller";
import Header from "@/components/admin/Header"; // Reusing the top header for simplicity
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SellerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    
    // For now we just verify they are logged in. 
    // Real implementation would verify they have a Store context.
    setIsAuthorized(true);
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        Memuat Seller Center...
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
