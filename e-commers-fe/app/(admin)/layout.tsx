"use client";

import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({
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

    try {
      // Decode JWT payload (Base64)
      const payloadBase64 = token.split(".")[1];
      const decodedJson = atob(payloadBase64);
      const payload = JSON.parse(decodedJson);

      const allowedRoles = ["SUPER_ADMIN", "FINANCE_ADMIN", "MARKETING_ADMIN", "OPERATIONS_CS"];
      if (!allowedRoles.includes(payload.globalRole)) {
        router.push("/"); // Not authorized for admin area
        return;
      }

      setIsAuthorized(true);
    } catch (err) {
      localStorage.removeItem("token");
      router.push("/login");
    }
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6F9] text-slate-500">
        Memverifikasi akses...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex font-sans selection:bg-blue-200">
      <Sidebar />
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
