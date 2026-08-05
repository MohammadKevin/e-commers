"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal melakukan login");
      }

      // Simpan token ke localStorage atau cookies jika perlu
      if (data.accessToken || data.access_token) {
        localStorage.setItem("token", data.accessToken || data.access_token);
      }
      
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      
      // Redirect berdasarkan role
      const role = data.user?.globalRole;
      if (role === "SUPER_ADMIN") {
        router.push("/admin");
      } else if (role === "FINANCE_ADMIN") {
        router.push("/finance");
      } else if (role === "MARKETING_ADMIN") {
        router.push("/marketing");
      } else if (role === "OPERATIONS_CS") {
        router.push("/operations");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8 font-sans selection:bg-cyan-200">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl shadow-cyan-900/5 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side - Banner */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-cyan-500 to-blue-600 p-12 text-white flex flex-col justify-between hidden md:flex relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
          
          <div className="relative z-10">
            <Link href="/" className="text-3xl font-extrabold tracking-tight hover:opacity-80 transition-opacity">
              sakserShop
            </Link>
          </div>
          
          <div className="relative z-10 mt-20 mb-10">
            <h1 className="text-4xl font-bold mb-4 leading-tight">Belanja Lebigh Mudah & Hemat.</h1>
            <p className="text-cyan-100 text-lg max-w-sm">Temukan jutaan produk impianmu dengan penawaran terbaik setiap harinya.</p>
          </div>
          
          <div className="relative z-10 flex gap-4 text-sm font-medium text-cyan-100">
            <span>Aman</span>
            <span>•</span>
            <span>Terpercaya</span>
            <span>•</span>
            <span>Cepat</span>
          </div>
          
          {/* Decorative circles */}
          <div className="absolute -bottom-24 -right-24 w-64 h-64 border-[30px] border-white/10 rounded-full"></div>
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white">
          
          <button 
            onClick={() => router.push("/")} 
            className="self-start mb-6 md:mb-8 text-slate-400 hover:text-cyan-600 transition-colors flex items-center gap-1 text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
            </svg>
            Kembali
          </button>

          <div className="md:hidden mb-8 text-center">
             <Link href="/" className="text-3xl font-extrabold text-cyan-600 tracking-tight">
               sakserShop
             </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Masuk</h2>
            <p className="text-slate-500">Belum punya akun? <Link href="/register" className="text-cyan-600 font-semibold hover:underline">Daftar di sini</Link></p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="email">Email</label>
              <input 
                id="email"
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all bg-slate-50 focus:bg-white text-slate-900"
                required
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-slate-700" htmlFor="password">Password</label>
                <a href="#" className="text-sm font-medium text-cyan-600 hover:underline">Lupa Password?</a>
              </div>
              <input 
                id="password"
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all bg-slate-50 focus:bg-white text-slate-900"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-70 text-white font-bold rounded-xl transition-all shadow-md shadow-cyan-600/20 hover:shadow-lg hover:-translate-y-0.5 mt-2 flex justify-center items-center gap-2"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-sm font-medium text-slate-400">Atau masuk dengan</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          <div className="mt-6 flex gap-4">
            <button className="flex-1 py-2.5 px-4 border border-slate-300 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors font-medium text-slate-700">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
              </svg>
              Google
            </button>
            <button className="flex-1 py-2.5 px-4 border border-slate-300 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors font-medium text-slate-700">
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-5 h-5 text-[#1877F2]" viewBox="0 0 24 24">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
              </svg>
              Facebook
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
