"use client";

import { useEffect, useRef } from "react";
import { Copy, Shield, Truck, Package, CheckCircle2, Clock } from "lucide-react";

interface TrackingMapProps {
  originCity: string;
  destCity: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  shippedAt?: string;
  orderNumber?: string;
  courierName?: string;
}

/* ── city lat/lng (Indonesia) — lengkap ──────────────── */
const CITIES: Record<string, [number, number]> = {
  // Jakarta
  "jakarta": [-6.2088, 106.8456], "jakarta selatan": [-6.2615, 106.8106],
  "jakarta utara": [-6.1381, 106.8451], "jakarta barat": [-6.1688, 106.7645],
  "jakarta timur": [-6.2250, 106.9004], "jakarta pusat": [-6.1862, 106.8345],
  // Jawa Barat
  "bandung": [-6.9175, 107.6191], "bogor": [-6.5971, 106.8060],
  "depok": [-6.4025, 106.7942], "bekasi": [-6.2349, 106.9896],
  "tangerang": [-6.1781, 106.6297], "tangerang selatan": [-6.2890, 106.6715],
  "cirebon": [-6.7320, 108.5523], "sukabumi": [-6.9201, 106.9306],
  "tasikmalaya": [-7.3274, 108.2207], "garut": [-7.2119, 107.9063],
  "cianjur": [-6.8222, 107.1361], "karawang": [-6.3211, 107.3378],
  "subang": [-6.5709, 107.7627], "purwakarta": [-6.5561, 107.4379],
  "kuningan": [-6.9766, 108.4853], "majalengka": [-6.8312, 108.2291],
  "indramayu": [-6.3263, 108.3242], "ciamis": [-7.3294, 108.3528],
  // Jawa Tengah
  "semarang": [-6.9932, 110.4203], "solo": [-7.5755, 110.8243],
  "yogyakarta": [-7.7956, 110.3695], "purwokerto": [-7.4244, 109.2317],
  "tegal": [-6.8694, 109.1402], "pekalongan": [-6.8886, 109.6753],
  "magelang": [-7.4701, 110.2178], "salatiga": [-7.3305, 110.5084],
  "kudus": [-6.8048, 110.8409], "jepara": [-6.5888, 110.6680],
  "demak": [-6.8942, 110.6377], "kendal": [-6.9230, 110.2024],
  "brebes": [-6.8720, 108.9540], "cilacap": [-7.7298, 109.0164],
  "kebumen": [-7.6671, 109.6534], "purworejo": [-7.7161, 110.0175],
  "wonosobo": [-7.3620, 109.9003], "klaten": [-7.7047, 110.6093],
  "boyolali": [-7.5316, 110.5987], "wonogiri": [-7.8156, 110.9250],
  "sragen": [-7.4249, 111.0284], "blora": [-6.9618, 111.4065],
  "rembang": [-6.7049, 111.3417], "pati": [-6.7491, 111.0363],
  // Jawa Timur — LENGKAP
  "surabaya": [-7.2575, 112.7521], "malang": [-7.9666, 112.6326],
  "mojokerto": [-7.4700, 112.4337], "sidoarjo": [-7.4478, 112.7183],
  "gresik": [-7.1562, 112.6520], "pasuruan": [-7.6461, 112.9080],
  "probolinggo": [-7.7512, 113.2155], "jember": [-8.1720, 113.7000],
  "banyuwangi": [-8.2190, 114.3691], "lumajang": [-8.1296, 113.2227],
  "kediri": [-7.8166, 112.0110], "blitar": [-8.0951, 112.1608],
  "tulungagung": [-8.0654, 111.9029], "trenggalek": [-8.0501, 111.7088],
  "ponorogo": [-7.8615, 111.4633], "magetan": [-7.6528, 111.3275],
  "ngawi": [-7.4068, 111.4467], "bojonegoro": [-7.1517, 111.8812],
  "tuban": [-6.8990, 112.0521], "lamongan": [-7.1179, 112.4147],
  "bangkalan": [-6.9036, 112.7347], "sampang": [-7.1955, 113.2467],
  "pamekasan": [-7.1584, 113.4726], "sumenep": [-6.9667, 113.8620],
  "jombang": [-7.5500, 112.2430], "nganjuk": [-7.6045, 111.8999],
  "madiun": [-7.6298, 111.5234], "pacitan": [-8.1975, 111.1053],
  "situbondo": [-7.7062, 114.0104], "bondowoso": [-7.9144, 113.8193],
  "batu": [-7.8692, 112.5267], "kota mojokerto": [-7.4700, 112.4337],
  "mojokerto city": [-7.4700, 112.4337],
  // Bali & NTB/NTT
  "denpasar": [-8.6705, 115.2126], "bali": [-8.6705, 115.2126],
  "mataram": [-8.5833, 116.1167], "lombok": [-8.6505, 116.3241],
  "kupang": [-10.1771, 123.6070],
  // Sumatera
  "medan": [3.5952, 98.6722], "palembang": [-2.9761, 104.7754],
  "pekanbaru": [0.5335, 101.4474], "padang": [-0.9492, 100.3543],
  "aceh": [5.5483, 95.3238], "banda aceh": [5.5483, 95.3238],
  "batam": [1.0457, 104.0305], "jambi": [-1.6101, 103.6131],
  "bengkulu": [-3.7928, 102.2608], "bandar lampung": [-5.3971, 105.2668],
  "lampung": [-5.3971, 105.2668],
  // Kalimantan
  "balikpapan": [-1.2654, 116.8312], "samarinda": [-0.5022, 117.1536],
  "pontianak": [-0.0263, 109.3425], "banjarmasin": [-3.3194, 114.5908],
  "palangkaraya": [-2.2136, 113.9108],
  // Sulawesi
  "makassar": [-5.1477, 119.4327], "manado": [1.4748, 124.8421],
  "kendari": [-3.9985, 122.5129], "palu": [-0.8917, 119.8707],
  // Papua & Maluku
  "ambon": [-3.6954, 128.1814], "sorong": [-0.8617, 131.2520],
  "jayapura": [-2.5337, 140.7181],
  // Fallback
  "gudang pengirim": [-6.2088, 106.8456],
  "default": [-7.2575, 112.7521], // Surabaya (Jawa Timur tengah)
};
function coord(city: string): [number, number] {
  const key = city.toLowerCase().trim();
  // 1. exact match
  if (CITIES[key]) return CITIES[key];
  // 2. partial match — cari kota yang mengandung kata kunci
  const found = Object.keys(CITIES).find(k => k !== "default" && k !== "gudang pengirim" && (key.includes(k) || k.includes(key)));
  if (found) return CITIES[found];
  // 3. fallback
  return CITIES["default"];
}

/* ── interpolate truck position ─────────────────────── */
const PROGRESS: Record<string, number> = {
  PENDING_PAYMENT: 0, PAID: 0.08, PROCESSING: 0.25, SHIPPED: 0.62, DELIVERED: 1,
};
function lerp(a: [number, number], b: [number, number], t: number): [number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

/* ── format date ─────────────────────────────────────── */
function fmtDate(d?: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function etaDate(createdAt: string, status: string) {
  const days = status === "DELIVERED" ? 0 : status === "SHIPPED" ? 2 : status === "PROCESSING" ? 3 : 4;
  const d = new Date(new Date(createdAt).getTime() + days * 86_400_000);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export default function TrackingMap({
  originCity, destCity, status, createdAt, updatedAt, shippedAt, orderNumber, courierName,
}: TrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj = useRef<any>(null);

  const pct   = PROGRESS[status] ?? 0;
  const oCoord = coord(originCity);
  const dCoord = coord(destCity);
  const tCoord = lerp(oCoord, dCoord, pct);
  const isDone = status === "DELIVERED";
  const isShipping = status === "SHIPPED";

  /* ── build Leaflet map with OSRM real routing ─────── */
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;
    import("leaflet").then(async (L) => {
      /* fix icon paths */
      (L.Icon.Default.prototype as any)._getIconUrl && delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      /* destroy previous */
      if (mapObj.current) { mapObj.current.remove(); mapObj.current = null; }

      const clat = (oCoord[0] + dCoord[0]) / 2;
      const clng = (oCoord[1] + dCoord[1]) / 2;
      const diff = Math.max(Math.abs(oCoord[0] - dCoord[0]), Math.abs(oCoord[1] - dCoord[1]));
      const zoom = diff < 0.5 ? 12 : diff < 2 ? 10 : diff < 4 ? 9 : diff < 8 ? 8 : 7;

      const map = L.map(mapRef.current!, {
        center: [clat, clng], zoom,
        zoomControl: true, attributionControl: true, scrollWheelZoom: false,
      });
      mapObj.current = map;

      /* tile */
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19, attribution: "© OpenStreetMap",
      }).addTo(map);

      /* ── Fetch real road route from OSRM ─────────── */
      // OSRM public API: lng,lat order
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/`
        + `${oCoord[1]},${oCoord[0]};${dCoord[1]},${dCoord[0]}`
        + `?overview=full&geometries=geojson&steps=false`;

      let routeCoords: [number, number][] = [oCoord, dCoord]; // fallback straight line

      try {
        const res = await fetch(osrmUrl, { signal: AbortSignal.timeout(6000) });
        if (res.ok) {
          const data = await res.json();
          if (data.routes?.[0]?.geometry?.coordinates) {
            // OSRM returns [lng, lat] — convert to [lat, lng] for Leaflet
            routeCoords = data.routes[0].geometry.coordinates.map(
              ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
            );
          }
        }
      } catch {
        // silently use straight line fallback
      }

      /* total route point count for progress slicing */
      const totalPts = routeCoords.length;
      const progressIdx = Math.floor(pct * (totalPts - 1));
      const doneCoords   = routeCoords.slice(0, progressIdx + 1);
      const remainCoords = routeCoords.slice(progressIdx);
      const truckPos     = doneCoords[doneCoords.length - 1] ?? oCoord;

      /* remaining route — grey dashed */
      if (remainCoords.length > 1) {
        L.polyline(remainCoords, {
          color: "#94a3b8", weight: 4, dashArray: "10 6", opacity: 0.45,
        }).addTo(map);
      }

      /* completed route — red solid (like Shopee) */
      if (doneCoords.length > 1 && pct > 0) {
        L.polyline(doneCoords, {
          color: "#ef4444", weight: 5, opacity: 0.9, lineCap: "round", lineJoin: "round",
        }).addTo(map);
      }

      /* ── origin marker (green / gudang) ── */
      const originIcon = L.divIcon({
        className: "",
        iconSize: [36, 36], iconAnchor: [18, 36],
        html: `<div style="position:relative">
          <div style="width:36px;height:36px;background:#22c55e;border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);border:3px solid #fff;
            box-shadow:0 3px 10px rgba(34,197,94,.5);
            display:flex;align-items:center;justify-content:center">
            <span style="transform:rotate(45deg);font-size:16px">🏭</span>
          </div>
        </div>`,
      });
      L.marker(oCoord, { icon: originIcon }).addTo(map)
        .bindPopup(`<b style="color:#22c55e">📦 Asal</b><br><small>${originCity}</small>`);

      /* ── dest marker (red pin — like Google/Shopee) ── */
      const destIcon = L.divIcon({
        className: "",
        iconSize: [36, 42], iconAnchor: [18, 42],
        html: `<div>
          <div style="width:36px;height:36px;background:${isDone ? "#10b981" : "#ef4444"};
            border-radius:50% 50% 50% 0;transform:rotate(-45deg);
            border:3px solid #fff;box-shadow:0 3px 10px rgba(239,68,68,.5);
            display:flex;align-items:center;justify-content:center">
            <span style="transform:rotate(45deg);font-size:16px">${isDone ? "✅" : "🏠"}</span>
          </div>
          <div style="width:2px;height:8px;background:${isDone ? "#10b981" : "#ef4444"};margin:0 auto"></div>
        </div>`,
      });
      L.marker(dCoord, { icon: destIcon }).addTo(map)
        .bindPopup(`<b style="color:${isDone ? "#10b981" : "#ef4444"}">${isDone ? "✅ Diterima" : "🏠 Tujuan"}</b><br><small>${destCity}</small>`);

      /* ── truck / current position ── */
      if (pct > 0 && pct < 1) {
        const truckIcon = L.divIcon({
          className: "",
          iconSize: [44, 44], iconAnchor: [22, 22],
          html: `<div style="position:relative">
            <div style="
              width:44px;height:44px;background:#0ea5e9;border-radius:12px;
              border:3px solid #fff;box-shadow:0 4px 16px rgba(14,165,233,.6);
              display:flex;align-items:center;justify-content:center;
              font-size:22px;${isShipping ? "animation:pkpulse 1.5s infinite" : ""}">
              🚚
            </div>
            ${isShipping ? `<div style="
              position:absolute;top:-28px;left:50%;transform:translateX(-50%);
              background:#0ea5e9;color:#fff;font-size:10px;font-weight:700;
              padding:3px 8px;border-radius:20px;white-space:nowrap;
              box-shadow:0 2px 8px rgba(14,165,233,.4)">Sedang diproses</div>` : ""}
          </div>
          <style>
            @keyframes pkpulse{0%,100%{box-shadow:0 4px 16px rgba(14,165,233,.6)}
              50%{box-shadow:0 4px 24px rgba(14,165,233,1)}}
          </style>`,
        });
        L.marker(tCoord, { icon: truckIcon }).addTo(map)
          .bindPopup(`<b style="color:#0ea5e9">🚚 Posisi Paket</b><br><small>${Math.round(pct * 100)}% menuju tujuan</small>`)
          .openPopup();
      }

      /* fit bounds */
      map.fitBounds([oCoord, dCoord], { padding: [48, 48] });
    });

    return () => { if (mapObj.current) { mapObj.current.remove(); mapObj.current = null; } };
  }, [status, originCity, destCity]);

  /* ── timeline steps ──────────────────────────────── */
  const steps = [
    { icon: "📋", label: "Dijemput Kurir",       active: ["PAID","PROCESSING","SHIPPED","DELIVERED"].includes(status) },
    { icon: "🚚", label: "Dalam Perjalanan",      active: ["SHIPPED","DELIVERED"].includes(status) },
    { icon: "✅", label: "Pesanan Tiba",           active: status === "DELIVERED" },
  ];

  const events = [
    status === "DELIVERED"   && { dot: "green",  time: fmtDate(updatedAt),  text: `Paket diterima di ${destCity}` },
    ["SHIPPED","DELIVERED"].includes(status) && { dot: "blue", time: fmtDate(shippedAt), text: `Paket dalam perjalanan menuju ${destCity}` },
    ["PROCESSING","SHIPPED","DELIVERED"].includes(status) && { dot: "blue", time: fmtDate(updatedAt), text: `Pesanan diproses di lokasi sortir ${originCity.toUpperCase()}` },
    ["PAID","PROCESSING","SHIPPED","DELIVERED"].includes(status) && { dot: "grey", time: fmtDate(updatedAt), text: `Pesanan tiba di lokasi transit ${originCity.toUpperCase()}` },
    { dot: "grey", time: fmtDate(createdAt), text: "Pesanan dibuat" },
  ].filter(Boolean) as { dot: string; time: string | null; text: string }[];

  const trackingNo = orderNumber ? `SKSR${orderNumber.replace(/\D/g, "").padStart(12, "0")}` : "SKSR000000000001";
  const courier    = courierName || "SPX Standard";

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm font-sans">

      {/* ── header bar ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-2">
          <span className="text-base">←</span>
          <span className="font-bold text-slate-800 text-sm">Dijemput Kurir</span>
        </div>
        <div className="flex items-center gap-2">
          {!isDone && (
            <span className="text-[11px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full animate-pulse">
              🔔 Live
            </span>
          )}
        </div>
      </div>

      {/* ── Leaflet map ── */}
      <div ref={mapRef} style={{ height: 260, width: "100%" }} className="z-0" />

      {/* ── ETA bar ── */}
      <div className="px-4 py-3 border-t border-slate-100 bg-white">
        <p className="text-emerald-600 font-bold text-sm">
          Estimasi tiba: {isDone ? "✅ Sudah diterima" : etaDate(createdAt, status)}
        </p>

        {/* step pills */}
        <div className="flex items-center gap-1 mt-3">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-1 flex-1">
              <div className={`flex flex-col items-center flex-1`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-all
                  ${s.active ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-300 text-slate-400"}`}>
                  {s.icon}
                </div>
                <p className={`text-[9px] font-semibold mt-1 text-center leading-tight
                  ${s.active ? "text-emerald-600" : "text-slate-400"}`}>{s.label}</p>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-0.5 flex-1 mb-4 ${steps[i + 1].active ? "bg-emerald-400" : "bg-slate-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── guarantee banner ── */}
      {!isDone && (
        <div className="mx-4 mb-3 flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
          <Shield className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600">
            <span className="font-semibold text-blue-700">Garansi Tiba:</span>{" "}
            Dapatkan voucher Rp 10.000 jika pesanan belum tiba sesuai estimasi.{" "}
            <span className="text-blue-600 font-semibold cursor-pointer underline">Selengkapnya</span>
          </p>
        </div>
      )}

      {/* ── courier & resi ── */}
      <div className="mx-4 mb-3 flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-200 rounded-lg flex items-center justify-center text-lg">🚚</div>
          <div>
            <p className="text-xs font-bold text-slate-800">{courier}</p>
            <p className="text-[11px] text-slate-500 font-mono">{trackingNo}</p>
          </div>
        </div>
        <button
          onClick={() => { navigator.clipboard?.writeText(trackingNo); }}
          className="flex items-center gap-1 text-xs font-semibold text-cyan-600 hover:text-cyan-700 bg-cyan-50 border border-cyan-200 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <Copy className="w-3 h-3" /> Salin
        </button>
      </div>

      {/* ── event timeline ── */}
      <div className="px-4 pb-4">
        {events.map((ev, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center shrink-0">
              <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                ev.dot === "green" ? "bg-emerald-500" :
                ev.dot === "blue"  ? "bg-blue-500" :
                "bg-slate-300"
              }`} />
              {i < events.length - 1 && <div className="w-px flex-1 my-1 bg-slate-200" />}
            </div>
            <div className="pb-3 flex-1">
              <p className="text-[11px] text-slate-400 font-medium">{ev.time || "—"}</p>
              <p className={`text-xs font-semibold mt-0.5 ${i === 0 ? "text-emerald-700" : i === 1 ? "text-blue-700" : "text-slate-600"}`}>
                {ev.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
