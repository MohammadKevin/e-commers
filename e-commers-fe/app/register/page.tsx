"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload: any = { fullName, email, password };
      if (phone) payload.phone = phone;

      const res = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal melakukan registrasi");
      }

      // Berhasil daftar, arahkan ke halaman login
      router.push("/login");
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
        <div className="w-full md:w-1/2 bg-gradient-to-tr from-cyan-600 to-blue-500 p-12 text-white flex flex-col justify-between hidden md:flex relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
          
          <div className="relative z-10">
            <Link href="/" className="text-3xl font-extrabold tracking-tight hover:opacity-80 transition-opacity">
              sakserShop
            </Link>
          </div>
          
          <div className="relative z-10 mt-10 mb-10">
            <h1 className="text-4xl font-bold mb-4 leading-tight">Gabung Bersama Kami.</h1>
            <p className="text-cyan-100 text-lg max-w-sm">Mulai pengalaman belanja online yang aman, nyaman, dan penuh kejutan diskon setiap hari.</p>
          </div>
          
          <div className="relative z-10">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-2xl">
               <p className="text-sm text-cyan-50 italic">"sakserShop benar-benar mengubah cara saya berbelanja, sangat mudah dan banyak promo menarik!"</p>
               <p className="text-xs font-bold mt-2">- Pengguna Setia</p>
            </div>
          </div>
          
          {/* Decorative shapes */}
          <div className="absolute top-1/4 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 border-[20px] border-white/10 rounded-3xl rotate-12"></div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:px-12 lg:px-16 py-10 flex flex-col justify-center bg-white">
          
          <button 
            onClick={() => router.push("/")} 
            className="self-start mb-6 md:mb-8 text-slate-400 hover:text-cyan-600 transition-colors flex items-center gap-1 text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
            </svg>
            Kembali
          </button>

          <div className="md:hidden mb-6 text-center">
             <Link href="/" className="text-3xl font-extrabold text-cyan-600 tracking-tight">
               sakserShop
             </Link>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Daftar Akun Baru</h2>
            <p className="text-slate-500">Sudah punya akun? <Link href="/login" className="text-cyan-600 font-semibold hover:underline">Masuk di sini</Link></p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="fullName">Nama Lengkap</label>
              <input 
                id="fullName"
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Budi Santoso"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all bg-slate-50 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">Email</label>
              <input 
                id="email"
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all bg-slate-50 focus:bg-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="phone">Nomor Telepon <span className="text-slate-400 font-normal">(Opsional)</span></label>
              <input 
                id="phone"
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="081234567890"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all bg-slate-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">Password</label>
              <input 
                id="password"
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all bg-slate-50 focus:bg-white"
                required
              />
            </div>

            <p className="text-xs text-slate-500 mt-1">
              Dengan mendaftar, Anda menyetujui <a href="#" className="text-cyan-600 hover:underline">Syarat & Ketentuan</a> serta <a href="#" className="text-cyan-600 hover:underline">Kebijakan Privasi</a> sakserShop.
            </p>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-70 text-white font-bold rounded-xl transition-all shadow-md shadow-cyan-600/20 hover:shadow-lg hover:-translate-y-0.5 mt-2 flex justify-center items-center gap-2"
            >
              {loading ? "Memproses..." : "Daftar Sekarang"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
