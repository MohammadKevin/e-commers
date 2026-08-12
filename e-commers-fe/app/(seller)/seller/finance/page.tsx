"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Wallet, TrendingUp, ArrowDownToLine, Clock, CheckCircle2,
  Loader2, AlertCircle, DollarSign, BarChart3
} from "lucide-react";

interface FinanceStats {
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  totalOrders: number;
  deliveredOrders: number;
}

export default function SellerFinancePage() {
  const [stats, setStats] = useState<FinanceStats>({
    totalRevenue: 0,
    paidRevenue: 0,
    pendingRevenue: 0,
    totalOrders: 0,
    deliveredOrders: 0,
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const storeRes = await api.get("/stores/my-stores");
      if (storeRes.data?.length > 0) {
        const storeId = storeRes.data[0].id;
        const orderRes = await api.get(`/orders/store/${storeId}`);
        const allOrders = orderRes.data?.data || orderRes.data || [];
        setOrders(allOrders);

        const totalRevenue = allOrders.reduce((acc: number, o: any) => acc + Number(o.totalAmount || 0), 0);
        const paidRevenue = allOrders
          .filter((o: any) => ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(o.status))
          .reduce((acc: number, o: any) => acc + Number(o.totalAmount || 0), 0);
        const pendingRevenue = allOrders
          .filter((o: any) => o.status === "PENDING_PAYMENT")
          .reduce((acc: number, o: any) => acc + Number(o.totalAmount || 0), 0);

        setStats({
          totalRevenue,
          paidRevenue,
          pendingRevenue,
          totalOrders: allOrders.length,
          deliveredOrders: allOrders.filter((o: any) => o.status === "DELIVERED").length,
        });
      }
    } catch (err) {
      console.error("Gagal memuat data keuangan:", err);
    } finally {
      setLoading(false);
    }
  };

  const availableBalance = stats.paidRevenue * 0.95; // Simulate 5% platform fee

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="font-medium animate-pulse">Memuat data keuangan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800">Saldo & Keuangan</h1>
        <p className="text-slate-500 text-sm mt-1">Pantau pendapatan dan kelola pencairan saldo tokomu.</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg shadow-blue-600/20">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute right-16 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 opacity-80">
            <Wallet size={18} />
            <span className="text-sm font-medium">Saldo Tersedia</span>
          </div>
          <p className="text-5xl font-extrabold tracking-tight mb-1">
            Rp {availableBalance.toLocaleString("id-ID")}
          </p>
          <p className="text-blue-200 text-sm">Setelah potongan biaya layanan 5%</p>
          <button
            onClick={() => setShowWithdrawForm(!showWithdrawForm)}
            className="mt-6 bg-white text-blue-700 font-bold py-3 px-8 rounded-2xl hover:bg-blue-50 transition-colors shadow-md flex items-center gap-2"
          >
            <ArrowDownToLine size={18} />
            Tarik Saldo
          </button>
        </div>
      </div>

      {/* Withdrawal Form */}
      {showWithdrawForm && (
        <div className="bg-white rounded-3xl p-6 border border-blue-100 shadow-sm animate-in slide-in-from-top-4 duration-300">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ArrowDownToLine size={18} className="text-blue-600" />
            Form Penarikan Saldo
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Jumlah Penarikan</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-slate-500 text-sm">Rp</span>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-slate-800"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">Maksimal: Rp {availableBalance.toLocaleString("id-ID")}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Rekening Tujuan</label>
              <select className="w-full px-4 py-3.5 border border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-slate-800 bg-white">
                <option>BCA - **** 1234 (Default)</option>
                <option>Tambah rekening baru...</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowWithdrawForm(false); alert("Fitur penarikan akan segera tersedia!"); }}
                className="flex-1 bg-blue-600 text-white font-semibold py-3.5 rounded-2xl hover:bg-blue-700 transition-colors"
              >
                Ajukan Penarikan
              </button>
              <button
                onClick={() => setShowWithdrawForm(false)}
                className="px-6 bg-slate-100 text-slate-600 font-semibold py-3.5 rounded-2xl hover:bg-slate-200 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Omset", value: `Rp ${stats.totalRevenue.toLocaleString("id-ID")}`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Sudah Dibayar", value: `Rp ${stats.paidRevenue.toLocaleString("id-ID")}`, icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Menunggu Bayar", value: `Rp ${stats.pendingRevenue.toLocaleString("id-ID")}`, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Pesanan Selesai", value: stats.deliveredOrders.toString(), icon: BarChart3, color: "text-indigo-600", bg: "bg-indigo-50" },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={20} className={item.color} />
              </div>
              <p className="text-xs font-semibold text-slate-500 mb-1">{item.label}</p>
              <p className="font-bold text-slate-800 text-lg leading-tight">{item.value}</p>
            </div>
          );
        })}
      </div>

      {/* Fee Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
        <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-800 text-sm">Informasi Biaya Layanan</p>
          <p className="text-amber-700 text-sm mt-0.5">
            sakserShop mengenakan biaya layanan sebesar <strong>5%</strong> dari setiap transaksi berhasil. 
            Saldo yang dapat ditarik adalah pendapatan bersih setelah potongan.
          </p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-5 text-lg">Riwayat Transaksi</h3>
        {orders.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <DollarSign size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Belum ada transaksi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 10).map(order => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status)
                      ? "bg-emerald-100"
                      : "bg-amber-100"
                  }`}>
                    {["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status) ? (
                      <CheckCircle2 size={18} className="text-emerald-600" />
                    ) : (
                      <Clock size={18} className="text-amber-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">#{order.orderNumber}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">Rp {Number(order.totalAmount).toLocaleString("id-ID")}</p>
                  <p className={`text-xs font-semibold ${
                    ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status)
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }`}>{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
