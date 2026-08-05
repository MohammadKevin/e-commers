import Image from "next/image";
import Link from "next/link";
import { PackageOpen } from "lucide-react";
import { FaShirt, FaMobileScreen, FaShoePrints, FaWandMagicSparkles, FaBurger, FaCar, FaPills } from "react-icons/fa6";
import Header from "../components/Header";

async function getProducts() {
  try {
    const res = await fetch("http://localhost:5000/products", { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-cyan-200">
      {/* Top bar */}
      <div className="bg-slate-100 py-1.5 px-6 text-xs text-slate-500 flex justify-between items-center hidden md:flex">
        <div className="flex gap-4">
          <a href="#" className="hover:text-cyan-600">Download sakserShop App</a>
        </div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-cyan-600">Tentang Kami</a>
          <a href="#" className="hover:text-cyan-600">Mitra</a>
          <a href="#" className="hover:text-cyan-600">Pusat Bantuan</a>
        </div>
      </div>

      {/* Main Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-8">
        
        {/* Hero Banners */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative aspect-[21/9] rounded-2xl overflow-hidden shadow-sm group cursor-pointer">
            <Image src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop" alt="Promo" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/80 to-transparent flex flex-col justify-center p-8 md:p-12">
              <h2 className="text-white text-3xl md:text-5xl font-bold mb-4 drop-shadow-md">Diskon Spesial 50%</h2>
              <p className="text-cyan-100 mb-6 max-w-md text-lg drop-shadow-sm">Temukan barang impianmu dengan harga miring hanya hari ini. Jangan sampai kehabisan!</p>
              <button className="bg-white text-cyan-700 px-8 py-3 rounded-xl font-bold w-fit shadow-lg hover:-translate-y-1 transition-transform">Belanja Sekarang</button>
            </div>
          </div>
          <div className="flex-col gap-4 hidden md:flex">
            <div className="relative flex-1 rounded-2xl overflow-hidden shadow-sm bg-cyan-100 flex items-center p-6 border border-cyan-200 cursor-pointer hover:shadow-md transition-shadow">
               <div className="z-10">
                 <h3 className="text-cyan-800 font-extrabold text-xl mb-1">Gratis Ongkir</h3>
                 <p className="text-cyan-700 text-sm">Ke seluruh Indonesia tanpa syarat</p>
               </div>
               <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-2 translate-y-2">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-28 h-28 text-cyan-600"><path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25ZM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875h.375a3 3 0 1 1 6 0h3a.75.75 0 0 0 .75-.75V15Z" /><path d="M8.25 19.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0ZM15.75 6.75a.75.75 0 0 0-.75.75v11.25c0 .087.015.17.042.248a3 3 0 0 1 5.958.468c.85-.572 1.5-1.552 1.5-2.666V13.5l-3.375-3.375H15.75m-1.5 3.375h5.25V9.664l-2.664-2.664H14.25v3.125Z" /><path d="M23.25 19.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" /></svg>
               </div>
            </div>
            <div className="relative flex-1 rounded-2xl overflow-hidden shadow-sm bg-blue-100 flex items-center p-6 border border-blue-200 cursor-pointer hover:shadow-md transition-shadow">
               <div className="z-10">
                 <h3 className="text-blue-800 font-extrabold text-xl mb-1">Cashback s/d 100rb</h3>
                 <p className="text-blue-700 text-sm">Bayar pakai dompet digital favoritmu</p>
               </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="font-bold text-lg mb-6 text-slate-800">Kategori Pilihan</h2>
          <div className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar pb-4 -mb-4">
            {[
              { name: "Pakaian", icon: <FaShirt className="w-8 h-8" />, color: "bg-blue-50 text-blue-600 border-blue-200 shadow-blue-100" },
              { name: "Elektronik", icon: <FaMobileScreen className="w-8 h-8" />, color: "bg-cyan-50 text-cyan-600 border-cyan-200 shadow-cyan-100" },
              { name: "Sepatu", icon: <FaShoePrints className="w-8 h-8" />, color: "bg-sky-50 text-sky-600 border-sky-200 shadow-sky-100" },
              { name: "Kecantikan", icon: <FaWandMagicSparkles className="w-8 h-8" />, color: "bg-pink-50 text-pink-600 border-pink-200 shadow-pink-100" },
              { name: "Makanan", icon: <FaBurger className="w-8 h-8" />, color: "bg-orange-50 text-orange-600 border-orange-200 shadow-orange-100" },
              { name: "Otomotif", icon: <FaCar className="w-8 h-8" />, color: "bg-slate-50 text-slate-600 border-slate-200 shadow-slate-100" },
              { name: "Kesehatan", icon: <FaPills className="w-8 h-8" />, color: "bg-green-50 text-green-600 border-green-200 shadow-green-100" },
            ].map((cat, i) => (
              <div key={i} className="flex flex-col items-center gap-3 cursor-pointer group">
                <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center text-3xl group-hover:-translate-y-2 transition-transform shadow-md ${cat.color}`}>
                  {cat.icon}
                </div>
                <span className="text-xs font-semibold text-slate-700 text-center w-16 leading-tight">{cat.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Flash Sale */}
        <section className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 sm:p-8 rounded-2xl shadow-lg text-white">
          <div className="flex justify-between items-end mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-extrabold flex items-center gap-2 drop-shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-yellow-400 drop-shadow-md">
                  <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z" clipRule="evenodd" />
                </svg>
                Kejar Diskon
              </h2>
              <div className="bg-red-500/90 backdrop-blur text-white font-mono font-bold px-3 py-1 rounded-lg text-sm shadow-inner flex items-center gap-2 border border-red-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                02 : 45 : 10
              </div>
            </div>
            <a href="#" className="font-semibold hover:underline text-cyan-50 text-sm hidden sm:block">Lihat Semua Promo &rarr;</a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {products.length > 0 ? products.slice(0, 6).map((prod: any) => (
              <div key={prod.id} className="bg-white text-slate-800 rounded-xl overflow-hidden hover:-translate-y-1.5 transition-transform cursor-pointer shadow-md">
                <div className="relative aspect-square bg-slate-100 flex items-center justify-center">
                  {prod.images && prod.images.length > 0 ? (
                    <Image src={prod.images[0].imageUrl} alt={prod.name} fill className="object-cover" />
                  ) : (
                    <PackageOpen className="text-slate-300 w-10 h-10" />
                  )}
                  <div className="absolute top-0 right-0 bg-red-500 text-white font-bold text-xs px-2 py-1 rounded-bl-xl shadow-sm">
                    10%
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium line-clamp-2 leading-tight mb-1">{prod.name}</h3>
                  <p className="font-extrabold text-cyan-600 text-lg">Rp {Number(prod.variants?.[0]?.price || 0).toLocaleString('id-ID')}</p>
                  <p className="text-[10px] text-slate-400 line-through mb-1">Rp {(Number(prod.variants?.[0]?.price || 0) * 1.1).toLocaleString('id-ID')}</p>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${Math.random() * 60 + 20}%` }}></div>
                  </div>
                  <p className="text-[10px] font-semibold text-red-500 mt-1">Segera Habis</p>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-10 text-center text-cyan-100 font-medium bg-white/10 rounded-xl border border-white/20">
                Promo flash sale sedang dipersiapkan...
              </div>
            )}
          </div>
        </section>

        {/* Based on Your Search */}
        <section>
          <div className="flex gap-6 mb-6 border-b border-slate-200">
            <h2 className="text-xl font-bold border-b-4 border-cyan-500 pb-2 text-slate-800 inline-block -mb-[2px]">Untukmu</h2>
            <h2 className="text-xl font-medium border-b-4 border-transparent pb-2 text-slate-400 hover:text-slate-600 cursor-pointer inline-block transition-colors -mb-[2px]">Lagi Trending</h2>
            <h2 className="text-xl font-medium border-b-4 border-transparent pb-2 text-slate-400 hover:text-slate-600 cursor-pointer inline-block transition-colors -mb-[2px]">Terlaris</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.length > 0 ? products.map((prod: any) => (
              <div key={prod.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-cyan-100 hover:border-cyan-300 transition-all cursor-pointer group flex flex-col">
                <div className="relative aspect-square bg-slate-100 overflow-hidden flex items-center justify-center">
                   {prod.images && prod.images.length > 0 ? (
                     <Image src={prod.images[0].imageUrl} alt={prod.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                   ) : (
                     <PackageOpen className="text-slate-300 w-12 h-12" />
                   )}
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <h3 className="text-sm font-medium text-slate-700 line-clamp-2 leading-snug mb-1 group-hover:text-cyan-700 transition-colors">
                    {prod.name}
                  </h3>
                  <p className="font-extrabold text-base text-slate-800 mb-1">Rp {Number(prod.variants?.[0]?.price || 0).toLocaleString('id-ID')}</p>
                  <div className="flex gap-1 items-center mb-2 flex-wrap">
                    <span className="bg-cyan-50 text-cyan-700 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm border border-cyan-100">Toko: {prod.store?.name || "Unknown"}</span>
                  </div>
                  <div className="mt-auto pt-2 border-t border-slate-50">
                    <div className="flex items-center gap-1 text-slate-500 text-xs mb-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-yellow-400">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium text-slate-600">4.9</span>
                      <span className="px-1 text-slate-300">|</span>
                      <span>Terjual {Math.floor(Math.random() * 50) + 1}</span>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-20 text-center text-slate-400 font-medium">
                Belum ada produk yang dijual di sakserShop.
              </div>
            )}
          </div>
          <div className="mt-10 flex justify-center">
             <button className="px-10 py-3 bg-white border-2 border-cyan-500 text-cyan-600 font-bold rounded-xl hover:bg-cyan-50 transition-colors shadow-sm">
               Muat Lebih Banyak
             </button>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 text-slate-600 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-extrabold text-slate-800 mb-4 text-lg">sakserShop</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-cyan-600 transition-colors font-medium">Tentang sakserShop</a></li>
              <li><a href="#" className="hover:text-cyan-600 transition-colors font-medium">Hak Kekayaan Intelektual</a></li>
              <li><a href="#" className="hover:text-cyan-600 transition-colors font-medium">Karir</a></li>
              <li><a href="#" className="hover:text-cyan-600 transition-colors font-medium">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 mb-4">Beli</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-cyan-600 transition-colors">Tagihan & Top Up</a></li>
              <li><a href="#" className="hover:text-cyan-600 transition-colors">sakserShop COD</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 mb-4">Bantuan dan Panduan</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-cyan-600 transition-colors">Syarat dan Ketentuan</a></li>
              <li><a href="#" className="hover:text-cyan-600 transition-colors">Kebijakan Privasi</a></li>
              <li><a href="#" className="hover:text-cyan-600 transition-colors">Pusat Bantuan</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 mb-4">Keamanan & Privasi</h4>
            <div className="flex gap-3">
               <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200 text-cyan-600 shadow-sm hover:border-cyan-300 transition-colors cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>
               </div>
               <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200 text-blue-600 shadow-sm hover:border-blue-300 transition-colors cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
               </div>
            </div>
            <div className="mt-8">
              <h4 className="font-bold text-slate-800 mb-3">Ikuti Kami</h4>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center hover:bg-cyan-500 hover:text-white transition-colors cursor-pointer text-slate-500">
                  f
                </div>
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center hover:bg-cyan-500 hover:text-white transition-colors cursor-pointer text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23Z" /></svg>
                </div>
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center hover:bg-cyan-500 hover:text-white transition-colors cursor-pointer text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 0 1 1.772 1.153 4.902 4.902 0 0 1 1.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 0 1-1.153 1.772 4.902 4.902 0 0 1-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 0 1-1.772-1.153 4.902 4.902 0 0 1-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 0 1 1.153-1.772A4.902 4.902 0 0 1 5.46 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 0 0-.748-1.15 3.098 3.098 0 0 0-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 1 1 0 10.27 5.135 5.135 0 0 1 0-10.27zm0 1.802a3.333 3.333 0 1 0 0 6.666 3.333 3.333 0 0 0 0-6.666zm5.338-3.205a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z" clipRule="evenodd" /></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
