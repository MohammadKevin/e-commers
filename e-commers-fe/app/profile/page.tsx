"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Header from "@/components/Header";
import { Loader2, User, Mail, Phone, MapPin, Package, LogOut, Plus, Star, Edit3, Check, X } from "lucide-react";

interface UserProfile {
  id: string; fullName: string; email: string; phone?: string;
  tier?: string; globalRole?: string; avatar?: string;
}
interface Address {
  id: string; label: string; recipient: string; phone: string;
  fullAddress: string; city: string; province: string; postalCode: string; isPrimary: boolean;
}

const TIER_CONFIG: Record<string, { color: string; icon: string }> = {
  SILVER: { color: "bg-slate-100 text-slate-600 border-slate-300", icon: "🥈" },
  GOLD: { color: "bg-yellow-100 text-yellow-700 border-yellow-300", icon: "🥇" },
  PLATINUM: { color: "bg-purple-100 text-purple-700 border-purple-300", icon: "💎" },
};

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div className={`fixed top-24 right-6 z-[100] px-5 py-3 rounded-2xl shadow-xl text-white text-sm font-semibold flex items-center gap-2
      ${type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
      {type === "success" ? "✅" : "❌"} {message}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", phone: "" });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: "", recipient: "", phone: "", fullAddress: "", city: "", province: "", postalCode: "", isPrimary: false });
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    fetchProfile();
    fetchAddresses();
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users/profile");
      setProfile(res.data);
      setFormData({ fullName: res.data.fullName || "", phone: res.data.phone || "" });
    } catch {
      showToast("Gagal memuat profil", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const res = await api.get("/users/addresses");
      setAddresses(res.data);
    } catch {} finally {
      setLoadingAddresses(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await api.patch("/users/profile", formData);
      setProfile(res.data);
      // Update localStorage
      const stored = localStorage.getItem("user");
      if (stored) {
        const user = JSON.parse(stored);
        localStorage.setItem("user", JSON.stringify({ ...user, fullName: formData.fullName }));
      }
      setEditMode(false);
      showToast("Profil berhasil diperbarui!", "success");
    } catch (e: any) {
      showToast(e.response?.data?.message || "Gagal memperbarui profil", "error");
    } finally {
      setSaving(false);
    }
  };

  const saveAddress = async () => {
    if (!newAddress.label || !newAddress.recipient || !newAddress.phone || !newAddress.fullAddress || !newAddress.city || !newAddress.province || !newAddress.postalCode) {
      showToast("Lengkapi semua field alamat", "error");
      return;
    }
    setSavingAddress(true);
    try {
      await api.post("/users/addresses", newAddress);
      showToast("Alamat berhasil ditambahkan", "success");
      setShowAddForm(false);
      setNewAddress({ label: "", recipient: "", phone: "", fullAddress: "", city: "", province: "", postalCode: "", isPrimary: false });
      await fetchAddresses();
    } catch (e: any) {
      showToast(e.response?.data?.message || "Gagal menyimpan alamat", "error");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
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

  const tierCfg = TIER_CONFIG[profile?.tier || "SILVER"] || TIER_CONFIG.SILVER;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />
      {toast && <Toast message={toast.message} type={toast.type} />}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center gap-3">
          <User className="w-7 h-7 text-cyan-600" /> Profil Saya
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            {/* Avatar & Name Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-extrabold uppercase shadow-lg">
                {profile?.fullName?.charAt(0) || "U"}
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-800 text-lg">{profile?.fullName}</p>
                <p className="text-sm text-slate-500">{profile?.email}</p>
                {profile?.tier && (
                  <span className={`inline-flex items-center gap-1 mt-2 text-xs font-bold px-3 py-1 rounded-full border ${tierCfg.color}`}>
                    {tierCfg.icon} {profile.tier}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {[
                { href: "/orders", icon: <Package className="w-4 h-4" />, label: "Pesanan Saya" },
              ].map((link) => (
                <Link key={link.href} href={link.href}
                  className="flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 transition-colors border-b border-slate-100 last:border-0">
                  <span className="text-cyan-600">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
              <button onClick={handleLogout}
                className="flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors w-full text-left">
                <LogOut className="w-4 h-4" />
                Keluar
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Profile Info */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-slate-800">Informasi Pribadi</h2>
                {!editMode ? (
                  <button onClick={() => setEditMode(true)}
                    className="flex items-center gap-1.5 text-sm text-cyan-600 font-semibold hover:bg-cyan-50 px-3 py-1.5 rounded-lg transition-colors">
                    <Edit3 className="w-4 h-4" /> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => { setEditMode(false); setFormData({ fullName: profile?.fullName || "", phone: profile?.phone || "" }); }}
                      className="flex items-center gap-1 text-sm text-slate-500 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors">
                      <X className="w-4 h-4" /> Batal
                    </button>
                    <button onClick={saveProfile} disabled={saving}
                      className="flex items-center gap-1 text-sm text-white bg-cyan-600 hover:bg-cyan-700 px-3 py-1.5 rounded-lg transition-colors font-semibold disabled:opacity-50">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Simpan
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1.5"><User className="w-3.5 h-3.5" /> Nama Lengkap</label>
                  {editMode ? (
                    <input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none text-sm" />
                  ) : (
                    <p className="text-sm font-semibold text-slate-800 bg-slate-50 px-3 py-2.5 rounded-xl">{profile?.fullName || "—"}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1.5"><Mail className="w-3.5 h-3.5" /> Email</label>
                  <p className="text-sm font-semibold text-slate-800 bg-slate-50 px-3 py-2.5 rounded-xl">{profile?.email}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1.5"><Phone className="w-3.5 h-3.5" /> Nomor HP</label>
                  {editMode ? (
                    <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="08123456789"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none text-sm" />
                  ) : (
                    <p className="text-sm font-semibold text-slate-800 bg-slate-50 px-3 py-2.5 rounded-xl">{profile?.phone || "—"}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1.5"><Star className="w-3.5 h-3.5" /> Level Member</label>
                  <div className="bg-slate-50 px-3 py-2.5 rounded-xl">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${tierCfg.color}`}>
                      {tierCfg.icon} {profile?.tier || "SILVER"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2"><MapPin className="w-5 h-5 text-cyan-600" /> Alamat Saya</h2>
                <button onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center gap-1.5 text-sm text-cyan-600 font-semibold hover:bg-cyan-50 px-3 py-1.5 rounded-lg transition-colors">
                  <Plus className="w-4 h-4" /> Tambah
                </button>
              </div>

              {loadingAddresses ? (
                <div className="flex items-center gap-2 text-slate-500"><Loader2 className="w-4 h-4 animate-spin text-cyan-500" /> Memuat...</div>
              ) : addresses.length === 0 && !showAddForm ? (
                <div className="text-center py-8 text-slate-400">
                  <MapPin className="w-10 h-10 mx-auto mb-2 text-slate-200" />
                  <p className="text-sm">Belum ada alamat tersimpan</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {addresses.map((addr) => (
                    <div key={addr.id} className={`p-4 rounded-xl border-2 transition-all ${addr.isPrimary ? "border-cyan-200 bg-cyan-50" : "border-slate-200"}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-800 text-sm">{addr.label}</span>
                        {addr.isPrimary && <span className="text-[10px] font-bold bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full">Utama</span>}
                      </div>
                      <p className="text-sm font-semibold text-slate-700">{addr.recipient} · {addr.phone}</p>
                      <p className="text-sm text-slate-500 mt-0.5">{addr.fullAddress}, {addr.city}, {addr.province} {addr.postalCode}</p>
                    </div>
                  ))}
                </div>
              )}

              {showAddForm && (
                <div className="mt-5 pt-5 border-t border-slate-100">
                  <h3 className="font-semibold text-slate-700 mb-4 text-sm">Tambah Alamat Baru</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: "label", label: "Label", placeholder: "Rumah / Kantor" },
                      { key: "recipient", label: "Nama Penerima", placeholder: "Budi Santoso" },
                      { key: "phone", label: "Nomor HP", placeholder: "08123456789" },
                      { key: "city", label: "Kota", placeholder: "Jakarta Selatan" },
                      { key: "province", label: "Provinsi", placeholder: "DKI Jakarta" },
                      { key: "postalCode", label: "Kode Pos", placeholder: "12345" },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="text-xs font-semibold text-slate-600 mb-1 block">{f.label}</label>
                        <input value={(newAddress as any)[f.key]} onChange={(e) => setNewAddress({ ...newAddress, [f.key]: e.target.value })}
                          placeholder={f.placeholder}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none text-sm" />
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-600 mb-1 block">Alamat Lengkap</label>
                      <textarea value={newAddress.fullAddress} onChange={(e) => setNewAddress({ ...newAddress, fullAddress: e.target.value })}
                        placeholder="Jl. Sudirman No. 1, RT 01 RW 02" rows={2}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none text-sm resize-none" />
                    </div>
                    <div className="sm:col-span-2 flex items-center gap-2">
                      <input type="checkbox" id="newIsPrimary" checked={newAddress.isPrimary} onChange={(e) => setNewAddress({ ...newAddress, isPrimary: e.target.checked })} className="accent-cyan-600" />
                      <label htmlFor="newIsPrimary" className="text-sm text-slate-600 cursor-pointer">Jadikan alamat utama</label>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={saveAddress} disabled={savingAddress}
                      className="px-5 py-2.5 bg-cyan-600 text-white text-sm font-bold rounded-xl hover:bg-cyan-700 transition-colors flex items-center gap-2 disabled:opacity-50">
                      {savingAddress ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Simpan
                    </button>
                    <button onClick={() => setShowAddForm(false)} className="px-5 py-2.5 bg-slate-100 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-200 transition-colors">
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
