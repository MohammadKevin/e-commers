"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import Header from "@/components/Header";
import { Loader2, CreditCard, CheckCircle2, XCircle, Clock, AlertTriangle, Copy, Check } from "lucide-react";

interface Order {
  id: string; orderNumber?: string; totalAmount: number; status: string;
  store?: { name: string };
  payment?: { id: string; status: string; referenceId?: string };
}
interface Payment {
  id: string; snapToken?: string; referenceId?: string; status: string; paymentMethod?: string; amount?: number;
}

const PAYMENT_METHODS = [
  { id: "BCA_VA", label: "BCA Virtual Account", icon: "🏦", color: "bg-blue-50 border-blue-200 text-blue-700" },
  { id: "MANDIRI_VA", label: "Mandiri Virtual Account", icon: "🏛️", color: "bg-yellow-50 border-yellow-200 text-yellow-700" },
  { id: "BNI_VA", label: "BNI Virtual Account", icon: "🏢", color: "bg-orange-50 border-orange-200 text-orange-700" },
  { id: "QRIS", label: "QRIS", icon: "📱", color: "bg-purple-50 border-purple-200 text-purple-700" },
  { id: "GOPAY", label: "GoPay", icon: "💚", color: "bg-green-50 border-green-200 text-green-700" },
  { id: "SHOPEEPAY", label: "ShopeePay", icon: "🧡", color: "bg-orange-50 border-orange-200 text-orange-700" },
  { id: "DANA", label: "DANA", icon: "💙", color: "bg-sky-50 border-sky-200 text-sky-700" },
  { id: "CREDIT_CARD", label: "Kartu Kredit/Debit", icon: "💳", color: "bg-slate-50 border-slate-200 text-slate-700" },
];

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div className={`fixed top-24 right-6 z-[100] px-5 py-3 rounded-2xl shadow-xl text-white text-sm font-semibold flex items-center gap-2
      ${type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
      {type === "success" ? "✅" : "❌"} {message}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" title="Salin">
      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
    </button>
  );
}

export default function PaymentPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState("BCA_VA");
  const [paying, setPaying] = useState(false);
  const [simulating, setSimulating] = useState<"SUCCESS" | "FAILED" | null>(null);
  const [countdown, setCountdown] = useState(30); // 30s demo countdown
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    fetchOrder();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [orderId]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/orders/${orderId}`);
      setOrder(res.data);
      // If payment already exists, set it
      if (res.data.payment) {
        setPayment(res.data.payment);
        if (res.data.payment.paymentMethod) setSelectedMethod(res.data.payment.paymentMethod);
        startCountdown();
      }
    } catch {
      showToast("Gagal memuat data pesanan", "error");
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = () => {
    setCountdown(30);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handlePay = async () => {
    setPaying(true);
    try {
      const res = await api.post("/payments", { orderId, paymentMethod: selectedMethod });
      setPayment(res.data);
      showToast("Pembayaran dibuat! Selesaikan pembayaran dalam 30 detik.", "success");
      startCountdown();
      await fetchOrder();
    } catch (e: any) {
      showToast(e.response?.data?.message || "Gagal membuat pembayaran", "error");
    } finally {
      setPaying(false);
    }
  };

  const simulatePayment = async (status: "SUCCESS" | "FAILED") => {
    if (!payment) return;
    setSimulating(status);
    try {
      await api.post("/payments/webhook", {
        orderId,
        referenceId: payment.referenceId || payment.id,
        status,
      });
      if (status === "SUCCESS") {
        showToast("Pembayaran berhasil! Mengalihkan ke pesanan...", "success");
        setTimeout(() => router.push("/orders"), 1500);
      } else {
        showToast("Simulasi pembayaran gagal.", "error");
        await fetchOrder();
      }
    } catch (e: any) {
      showToast(e.response?.data?.message || "Gagal simulasi pembayaran", "error");
    } finally {
      setSimulating(null);
    }
  };

  const fakeAccountNumber = () => {
    if (!payment) return "—";
    const base = parseInt(orderId?.slice(0, 6) || "100000", 16) % 900000 + 100000;
    return `8808 ${String(base).padStart(6, "0")} ${String(base * 2).slice(0, 6)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <AlertTriangle className="w-14 h-14 text-yellow-400" />
          <p className="text-slate-500 text-lg">Pesanan tidak ditemukan.</p>
          <Link href="/orders" className="text-cyan-600 font-medium hover:underline">Lihat Semua Pesanan</Link>
        </div>
      </div>
    );
  }

  const isVA = ["BCA_VA", "MANDIRI_VA", "BNI_VA"].includes(payment?.paymentMethod || selectedMethod);
  const isQRIS = ["QRIS", "GOPAY", "SHOPEEPAY", "DANA"].includes(payment?.paymentMethod || selectedMethod);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />
      {toast && <Toast message={toast.message} type={toast.type} />}

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center gap-3">
          <CreditCard className="w-7 h-7 text-cyan-600" /> Pembayaran
        </h1>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-700">Ringkasan Pesanan</h2>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${order.status === "PENDING_PAYMENT" ? "bg-amber-100 text-amber-700" : order.status === "PAID" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
              {order.status?.replace("_", " ")}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-slate-400 text-xs mb-0.5">No. Pesanan</p>
              <div className="flex items-center gap-1">
                <p className="font-mono font-semibold text-slate-800 text-xs">{order.orderNumber || orderId?.slice(0, 12).toUpperCase()}</p>
                <CopyButton text={order.orderNumber || orderId || ""} />
              </div>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-0.5">Toko</p>
              <p className="font-semibold text-slate-800">{order.store?.name || "—"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-slate-400 text-xs mb-0.5">Total Pembayaran</p>
              <p className="text-2xl font-extrabold text-cyan-700">Rp {Number(order.totalAmount).toLocaleString("id-ID")}</p>
            </div>
          </div>
        </div>

        {!payment ? (
          /* Payment Method Selection */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-slate-800 mb-5">Pilih Metode Pembayaran</h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {PAYMENT_METHODS.map((m) => (
                <label key={m.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                  ${selectedMethod === m.id ? "border-cyan-500 bg-cyan-50" : "border-slate-200 hover:border-cyan-200 hover:bg-slate-50"}`}>
                  <input type="radio" name="payMethod" checked={selectedMethod === m.id} onChange={() => setSelectedMethod(m.id)} className="accent-cyan-600" />
                  <span className="text-xl">{m.icon}</span>
                  <span className="text-sm font-semibold text-slate-700 leading-tight">{m.label}</span>
                </label>
              ))}
            </div>
            <button onClick={handlePay} disabled={paying}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-2xl hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 text-base disabled:opacity-50">
              {paying ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
              Bayar Sekarang
            </button>
          </div>
        ) : (
          /* Payment Simulation UI */
          <div className="flex flex-col gap-5">
            {/* Countdown */}
            <div className={`bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 ${countdown === 0 ? "opacity-50" : ""}`}>
              <Clock className={`w-5 h-5 ${countdown === 0 ? "text-red-500" : "text-amber-500"} shrink-0`} />
              <div>
                <p className="text-sm font-bold text-amber-800">
                  {countdown > 0 ? `Selesaikan pembayaran dalam: ${String(Math.floor(countdown / 60)).padStart(2, "0")}:${String(countdown % 60).padStart(2, "0")}` : "Waktu pembayaran habis!"}
                </p>
                <p className="text-xs text-amber-600">{countdown > 0 ? "Demo — 30 detik (mewakili 24 jam)" : "Hubungi CS untuk bantuan"}</p>
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-slate-800">
                  {PAYMENT_METHODS.find(m => m.id === (payment.paymentMethod || selectedMethod))?.icon}{" "}
                  {PAYMENT_METHODS.find(m => m.id === (payment.paymentMethod || selectedMethod))?.label}
                </h2>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${payment.status === "PENDING" ? "bg-amber-100 text-amber-700" : payment.status === "SUCCESS" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                  {payment.status}
                </span>
              </div>

              {isVA && (
                <div className="bg-slate-50 rounded-xl p-5 mb-5 border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">Nomor Virtual Account</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-mono font-extrabold text-slate-800 tracking-wider">{fakeAccountNumber()}</p>
                    <CopyButton text={fakeAccountNumber()} />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Transfer tepat sampai digit terakhir</p>
                </div>
              )}

              {isQRIS && (
                <div className="flex flex-col items-center gap-3 bg-slate-50 rounded-xl p-6 mb-5 border border-slate-200">
                  <div className="w-40 h-40 bg-white rounded-xl border-2 border-slate-300 flex items-center justify-center text-6xl shadow-sm">📱</div>
                  <p className="text-sm font-semibold text-slate-700">Scan QR Code untuk bayar</p>
                  <p className="text-xs text-slate-400">Berlaku 30 detik (demo)</p>
                </div>
              )}

              {payment.snapToken && (
                <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200">
                  <p className="text-xs text-slate-400 mb-1">Snap Token</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-mono text-slate-600 truncate">{payment.snapToken}</p>
                    <CopyButton text={payment.snapToken} />
                  </div>
                </div>
              )}

              {payment.referenceId && (
                <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200">
                  <p className="text-xs text-slate-400 mb-1">Reference ID</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono font-semibold text-slate-700">{payment.referenceId}</p>
                    <CopyButton text={payment.referenceId} />
                  </div>
                </div>
              )}

              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-xs font-bold text-blue-700 mb-2">📋 Cara Pembayaran</p>
                <ol className="text-xs text-blue-600 space-y-1 list-decimal list-inside">
                  {isVA ? (
                    <>
                      <li>Buka aplikasi mobile banking atau ATM</li>
                      <li>Pilih Transfer ke Virtual Account</li>
                      <li>Masukkan nomor VA di atas</li>
                      <li>Konfirmasi nominal: <strong>Rp {Number(order.totalAmount).toLocaleString("id-ID")}</strong></li>
                      <li>Selesaikan transaksi</li>
                    </>
                  ) : isQRIS ? (
                    <>
                      <li>Buka aplikasi e-wallet kamu</li>
                      <li>Pilih menu bayar / scan QR</li>
                      <li>Arahkan kamera ke QR Code</li>
                      <li>Konfirmasi nominal: <strong>Rp {Number(order.totalAmount).toLocaleString("id-ID")}</strong></li>
                      <li>Masukkan PIN dan selesaikan</li>
                    </>
                  ) : (
                    <>
                      <li>Masukkan data kartu kredit/debit</li>
                      <li>Verifikasi dengan OTP</li>
                      <li>Konfirmasi pembayaran</li>
                    </>
                  )}
                </ol>
              </div>
            </div>

            {/* Simulation Buttons */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
              <p className="text-sm font-bold text-yellow-800 mb-1 flex items-center gap-2">⚠️ Mode Simulasi</p>
              <p className="text-xs text-yellow-600 mb-4">Gunakan tombol di bawah untuk mensimulasikan hasil pembayaran (mode demo tanpa Midtrans).</p>
              <div className="flex gap-3">
                <button onClick={() => simulatePayment("SUCCESS")} disabled={!!simulating || countdown === 0}
                  className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm">
                  {simulating === "SUCCESS" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  ✅ Simulasi Bayar Berhasil
                </button>
                <button onClick={() => simulatePayment("FAILED")} disabled={!!simulating}
                  className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm">
                  {simulating === "FAILED" ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-5 h-5" />}
                  ❌ Simulasi Bayar Gagal
                </button>
              </div>
            </div>

            <Link href="/orders" className="text-center text-sm text-cyan-600 font-medium hover:underline">
              Lihat Semua Pesanan →
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
