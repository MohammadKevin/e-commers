"use client";

import { useState } from "react";
import {
  MessageSquare, Search, Filter, Clock, CheckCircle2,
  AlertTriangle, Loader2, User, Tag, ChevronDown,
  X, Send, RefreshCw
} from "lucide-react";

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  category: string;
  userName: string;
  userEmail: string;
  createdAt: string;
  updatedAt: string;
  messages: { sender: string; content: string; createdAt: string }[];
}

const STATUS_CONFIG = {
  OPEN: { label: "Terbuka", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  IN_PROGRESS: { label: "Diproses", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  RESOLVED: { label: "Terselesaikan", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  CLOSED: { label: "Ditutup", color: "text-slate-600", bg: "bg-slate-100 border-slate-200" },
};

const PRIORITY_CONFIG = {
  LOW: { label: "Rendah", color: "text-slate-600", dot: "bg-slate-400" },
  MEDIUM: { label: "Sedang", color: "text-blue-600", dot: "bg-blue-500" },
  HIGH: { label: "Tinggi", color: "text-orange-600", dot: "bg-orange-500" },
  URGENT: { label: "Mendesak", color: "text-red-600", dot: "bg-red-500" },
};

const DEMO_TICKETS: Ticket[] = [
  {
    id: "1", ticketNumber: "TKT-001", subject: "Pesanan tidak sampai setelah 7 hari",
    description: "Saya sudah order tanggal 25 Juli tapi sampai sekarang barang belum datang. Nomor resi juga tidak bisa dilacak.",
    status: "OPEN", priority: "HIGH", category: "Pengiriman",
    userName: "Ahmad Fauzi", userEmail: "ahmad@example.com",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    messages: [
      { sender: "Ahmad Fauzi", content: "Saya sudah order tanggal 25 Juli tapi sampai sekarang barang belum datang.", createdAt: new Date(Date.now() - 3600000 * 2).toISOString() }
    ]
  },
  {
    id: "2", ticketNumber: "TKT-002", subject: "Barang yang diterima tidak sesuai foto produk",
    description: "Warna produk yang saya terima berbeda dengan yang ditampilkan di foto. Saya minta refund.",
    status: "IN_PROGRESS", priority: "MEDIUM", category: "Produk",
    userName: "Siti Rahmawati", userEmail: "siti@example.com",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    messages: [
      { sender: "Siti Rahmawati", content: "Warna produk berbeda dengan foto.", createdAt: new Date(Date.now() - 3600000 * 5).toISOString() },
      { sender: "CS Agent", content: "Kami sedang memproses keluhan Anda. Mohon kirim foto produk yang diterima.", createdAt: new Date(Date.now() - 3600000 * 1).toISOString() }
    ]
  },
  {
    id: "3", ticketNumber: "TKT-003", subject: "Akun tidak bisa login",
    description: "Setelah ganti password, akun saya tidak bisa diakses lagi.",
    status: "RESOLVED", priority: "LOW", category: "Akun",
    userName: "Budi Santoso", userEmail: "budi@example.com",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    messages: [
      { sender: "Budi Santoso", content: "Akun tidak bisa login setelah ganti password.", createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
      { sender: "CS Agent", content: "Masalah sudah diselesaikan. Silakan coba reset password melalui email.", createdAt: new Date(Date.now() - 3600000 * 3).toISOString() }
    ]
  },
  {
    id: "4", ticketNumber: "TKT-004", subject: "Pembayaran berhasil tapi pesanan tidak muncul",
    description: "Saya sudah bayar via transfer bank tapi status pesanan masih pending.",
    status: "OPEN", priority: "URGENT", category: "Pembayaran",
    userName: "Diana Putri", userEmail: "diana@example.com",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    messages: [
      { sender: "Diana Putri", content: "Sudah bayar tapi status masih pending.", createdAt: new Date(Date.now() - 1800000).toISOString() }
    ]
  },
];

export default function OperationsTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>(DEMO_TICKETS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState("");

  const filtered = tickets.filter(t => {
    const matchSearch = t.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.userName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleReply = () => {
    if (!replyText.trim() || !selectedTicket) return;
    const newMsg = { sender: "CS Agent", content: replyText, createdAt: new Date().toISOString() };
    const updatedTickets = tickets.map(t =>
      t.id === selectedTicket.id
        ? { ...t, status: "IN_PROGRESS" as const, messages: [...t.messages, newMsg], updatedAt: new Date().toISOString() }
        : t
    );
    setTickets(updatedTickets);
    const updated = updatedTickets.find(t => t.id === selectedTicket.id)!;
    setSelectedTicket(updated);
    setReplyText("");
  };

  const handleResolve = (ticketId: string) => {
    const updated = tickets.map(t => t.id === ticketId ? { ...t, status: "RESOLVED" as const } : t);
    setTickets(updated);
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(updated.find(t => t.id === ticketId) || null);
    }
  };

  const statusCounts = tickets.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tiket & Bantuan</h1>
          <p className="text-slate-500 text-sm mt-1">Tangani keluhan dan pertanyaan dari pelanggan dengan cepat.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Terbuka", value: statusCounts.OPEN || 0, color: "text-amber-600", bg: "bg-amber-50", icon: AlertTriangle },
          { label: "Diproses", value: statusCounts.IN_PROGRESS || 0, color: "text-blue-600", bg: "bg-blue-50", icon: Clock },
          { label: "Terselesaikan", value: statusCounts.RESOLVED || 0, color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 },
          { label: "Total Tiket", value: tickets.length, color: "text-slate-600", bg: "bg-slate-50", icon: MessageSquare },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={18} className={item.color} />
              </div>
              <p className="text-2xl font-extrabold text-slate-800">{item.value}</p>
              <p className="text-sm text-slate-500 mt-0.5">{item.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Ticket List */}
        <div className="lg:col-span-2 space-y-3">
          {/* Search & Filter */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Cari tiket..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 outline-none text-sm"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === s ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {s === "ALL" ? "Semua" : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tickets */}
          {filtered.map(ticket => {
            const statusCfg = STATUS_CONFIG[ticket.status];
            const priorityCfg = PRIORITY_CONFIG[ticket.priority];
            return (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`w-full text-left bg-white rounded-2xl border shadow-sm p-4 hover:shadow-md transition-all ${
                  selectedTicket?.id === ticket.id ? "border-indigo-300 ring-2 ring-indigo-100" : "border-slate-100 hover:border-indigo-200"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="font-bold text-slate-700 text-sm">{ticket.ticketNumber}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.color}`}>
                    {statusCfg.label}
                  </span>
                </div>
                <p className="text-sm text-slate-800 font-medium line-clamp-1 mb-1">{ticket.subject}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <User size={11} /> {ticket.userName}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <span className={`w-2 h-2 rounded-full ${priorityCfg.dot}`}></span>
                    <span className={priorityCfg.color}>{priorityCfg.label}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-1.5">
                  {new Date(ticket.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 text-slate-400">
              <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">Tidak ada tiket</p>
            </div>
          )}
        </div>

        {/* Ticket Detail */}
        <div className="lg:col-span-3">
          {selectedTicket ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-full flex flex-col">
              {/* Ticket Header */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-slate-700">{selectedTicket.ticketNumber}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_CONFIG[selectedTicket.status].bg} ${STATUS_CONFIG[selectedTicket.status].color}`}>
                        {STATUS_CONFIG[selectedTicket.status].label}
                      </span>
                      <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        {selectedTicket.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg">{selectedTicket.subject}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Dari: {selectedTicket.userName} ({selectedTicket.userEmail})
                    </p>
                  </div>
                  <button onClick={() => setSelectedTicket(null)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                    <X size={16} className="text-slate-400" />
                  </button>
                </div>
                {selectedTicket.status !== "RESOLVED" && (
                  <button
                    onClick={() => handleResolve(selectedTicket.id)}
                    className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition-colors"
                  >
                    <CheckCircle2 size={14} /> Tandai Terselesaikan
                  </button>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[400px]">
                {selectedTicket.messages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.sender === "CS Agent" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                      msg.sender === "CS Agent" ? "bg-indigo-500" : "bg-slate-400"
                    }`}>
                      {msg.sender.charAt(0)}
                    </div>
                    <div className={`max-w-xs lg:max-w-sm ${msg.sender === "CS Agent" ? "items-end" : ""} flex flex-col`}>
                      <div className={`px-4 py-3 rounded-2xl text-sm ${
                        msg.sender === "CS Agent"
                          ? "bg-indigo-600 text-white rounded-tr-sm"
                          : "bg-slate-100 text-slate-800 rounded-tl-sm"
                      }`}>
                        {msg.content}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 px-1">
                        {msg.sender} • {new Date(msg.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              {selectedTicket.status !== "CLOSED" && (
                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                  <div className="flex gap-2">
                    <textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Tulis balasan kepada pelanggan..."
                      rows={2}
                      className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-sm resize-none"
                    />
                    <button
                      onClick={handleReply}
                      disabled={!replyText.trim()}
                      className="px-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-colors disabled:opacity-40 flex items-center justify-center"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm h-64 flex flex-col items-center justify-center text-slate-400">
              <MessageSquare size={48} className="mb-3 opacity-20" strokeWidth={1} />
              <p className="font-medium">Pilih tiket untuk melihat detail</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
