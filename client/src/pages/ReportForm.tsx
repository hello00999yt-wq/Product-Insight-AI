import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Upload, Star, ShieldCheck, AlertTriangle, CheckCircle2, XCircle, FileImage, Video, Receipt, Package } from "lucide-react";

interface Report {
  id: number;
  shopName: string;
  productName: string;
  complaintReason: string;
  description: string;
  rating: number;
  lat: number;
  lng: number;
  timestamp: string;
}

interface ShopStats {
  shopName: string;
  productName: string;
  reports: Report[];
  trustScore: number;
  totalReports: number;
  positiveRatings: number;
  markerColor: "green" | "yellow" | "red";
}

const COMPLAINT_REASONS = [
  "Fake Product",
  "Overpricing",
  "Wrong MRP",
  "Expired Product",
  "Poor Quality",
  "Other",
];

const EVIDENCE_TYPES = [
  { id: "photo", label: "Product Photo", icon: FileImage, accept: "image/*" },
  { id: "bill", label: "Bill / Receipt", icon: Receipt, accept: "image/*,application/pdf" },
  { id: "packaging", label: "Packaging Photo", icon: Package, accept: "image/*" },
  { id: "video", label: "Short Video", icon: Video, accept: "video/*" },
];

const reportsDB: Report[] = [];
const shopStatsMap: Record<string, ShopStats> = {};

function calcTrustScore(reports: Report[]): number {
  if (reports.length === 0) return 100;
  const positive = reports.filter((r) => r.rating >= 4).length;
  return Math.round((positive / reports.length) * 100);
}

function getMarkerColor(score: number): "green" | "yellow" | "red" {
  if (score >= 80) return "green";
  if (score >= 50) return "yellow";
  return "red";
}

const MARKER_SVG: Record<string, string> = {
  green: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="#22c55e" stroke="#166534" stroke-width="1.5"/><circle cx="12" cy="12" r="5" fill="white"/></svg>`,
  yellow: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="#eab308" stroke="#854d0e" stroke-width="1.5"/><circle cx="12" cy="12" r="5" fill="white"/></svg>`,
  red: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="#ef4444" stroke="#991b1b" stroke-width="1.5"/><circle cx="12" cy="12" r="5" fill="white"/></svg>`,
};

export default function ReportForm() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const tempMarkerRef = useRef<any>(null);

  const [shopName, setShopName] = useState("");
  const [productName, setProductName] = useState("");
  const [complaintReason, setComplaintReason] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({});
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [submittedReports, setSubmittedReports] = useState<Report[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    import("leaflet").then((L) => {
      const map = L.map(mapRef.current!, {
        center: [20.5937, 78.9629],
        zoom: 5,
        zoomControl: true,
      });

      L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
        attribution: '© <a href="https://maps.google.com">Google Maps</a>',
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      leafletMapRef.current = map;

      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        setSelectedLat(parseFloat(lat.toFixed(4)));
        setSelectedLng(parseFloat(lng.toFixed(4)));

        if (tempMarkerRef.current) {
          map.removeLayer(tempMarkerRef.current);
        }

        const svgIcon = L.divIcon({
          html: `<div style="filter: drop-shadow(0 2px 6px rgba(0,255,135,0.6))">${MARKER_SVG.green}</div>`,
          className: "",
          iconSize: [24, 36],
          iconAnchor: [12, 36],
        });

        tempMarkerRef.current = L.marker([lat, lng], { icon: svgIcon })
          .addTo(map)
          .bindPopup(`<div style="font-family:sans-serif;font-size:12px;color:#111"><b>Selected Location</b><br/>Lat: ${lat.toFixed(4)}<br/>Lng: ${lng.toFixed(4)}</div>`)
          .openPopup();
      });
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  const addMarkerToMap = (report: Report, stats: ShopStats) => {
    import("leaflet").then((L) => {
      if (!markersLayerRef.current) return;

      const color = stats.markerColor;
      const svgIcon = L.divIcon({
        html: `<div style="filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4))">${MARKER_SVG[color]}</div>`,
        className: "",
        iconSize: [24, 36],
        iconAnchor: [12, 36],
      });

      const avgRating = (stats.reports.reduce((a, r) => a + r.rating, 0) / stats.reports.length).toFixed(1);
      const badgeHtml =
        stats.trustScore >= 80
          ? `<div style="background:#22c55e;color:white;padding:2px 6px;border-radius:4px;font-size:11px;margin-top:4px;display:inline-block">⭐ Trusted Seller · 🟢 Verified Shop</div>`
          : "";

      const popupHtml = `
        <div style="font-family:sans-serif;min-width:180px;padding:4px">
          <div style="font-weight:700;font-size:14px;color:#111;margin-bottom:4px">🏪 ${stats.shopName}</div>
          <div style="font-size:12px;color:#444;margin-bottom:2px">📦 ${stats.productName}</div>
          <div style="font-size:12px;color:#444">Trust Score: <b style="color:${color === "green" ? "#16a34a" : color === "yellow" ? "#ca8a04" : "#dc2626"}">${stats.trustScore}%</b></div>
          <div style="font-size:12px;color:#444">Reports: <b>${stats.totalReports}</b></div>
          <div style="font-size:12px;color:#444">Avg Rating: <b>${avgRating} ★</b></div>
          ${badgeHtml}
        </div>`;

      L.marker([report.lat, report.lng], { icon: svgIcon })
        .addTo(markersLayerRef.current)
        .bindPopup(popupHtml);
    });
  };

  const validateReport = (): { valid: boolean; message: string } => {
    if (!shopName.trim()) return { valid: false, message: "Shop name is required." };
    if (!productName.trim()) return { valid: false, message: "Product name is required." };
    if (!complaintReason) return { valid: false, message: "Please select a complaint reason." };
    if (!description.trim() || description.trim().length < 10)
      return { valid: false, message: "Description must be at least 10 characters." };
    if (rating < 1 || rating > 5) return { valid: false, message: "Please provide a rating (1–5 stars)." };
    if (selectedLat === null || selectedLng === null)
      return { valid: false, message: "Please select the shop location on the map." };
    return { valid: true, message: "" };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    await new Promise((r) => setTimeout(r, 800));

    const validation = validateReport();
    if (!validation.valid) {
      setSubmitStatus("error");
      setSubmitMessage(`Report rejected due to incomplete or suspicious data. ${validation.message}`);
      setIsSubmitting(false);
      return;
    }

    const newReport: Report = {
      id: Date.now(),
      shopName: shopName.trim(),
      productName: productName.trim(),
      complaintReason,
      description: description.trim(),
      rating,
      lat: selectedLat!,
      lng: selectedLng!,
      timestamp: new Date().toLocaleString(),
    };

    reportsDB.push(newReport);

    const key = shopName.trim().toLowerCase();
    if (!shopStatsMap[key]) {
      shopStatsMap[key] = {
        shopName: shopName.trim(),
        productName: productName.trim(),
        reports: [],
        trustScore: 100,
        totalReports: 0,
        positiveRatings: 0,
        markerColor: "green",
      };
    }

    shopStatsMap[key].reports.push(newReport);
    shopStatsMap[key].totalReports = shopStatsMap[key].reports.length;
    shopStatsMap[key].positiveRatings = shopStatsMap[key].reports.filter((r) => r.rating >= 4).length;
    shopStatsMap[key].trustScore = calcTrustScore(shopStatsMap[key].reports);
    shopStatsMap[key].markerColor = getMarkerColor(shopStatsMap[key].trustScore);

    addMarkerToMap(newReport, shopStatsMap[key]);

    if (tempMarkerRef.current && leafletMapRef.current) {
      leafletMapRef.current.removeLayer(tempMarkerRef.current);
      tempMarkerRef.current = null;
    }

    setSubmittedReports([newReport, ...submittedReports]);
    setSubmitStatus("success");

    const ts = shopStatsMap[key].trustScore;
    const badge = ts >= 80 ? " — ⭐ Trusted Seller · 🟢 Verified Shop" : "";
    setSubmitMessage(
      `Report submitted successfully! Trust Score for "${shopName}": ${ts}%${badge}`
    );

    setShopName("");
    setProductName("");
    setComplaintReason("");
    setDescription("");
    setRating(0);
    setSelectedLat(null);
    setSelectedLng(null);
    setUploadedFiles({});
    setIsSubmitting(false);
  };

  const handleFileChange = (typeId: string, file: File | null) => {
    setUploadedFiles((prev) => ({ ...prev, [typeId]: file }));
  };

  return (
    <div className="min-h-screen bg-[#070d14] text-white" style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>
      {/* Inline Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />

      {/* Hero Banner */}
      <div className="relative overflow-hidden border-b border-[#00ff87]/20 bg-gradient-to-b from-[#0a1a0f] to-[#070d14]">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #00ff87 0%, transparent 50%), radial-gradient(circle at 80% 50%, #00ccff 0%, transparent 50%)",
          }}
        />
        <div className="relative container max-w-4xl mx-auto px-4 py-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00ff87]/40 bg-[#00ff87]/10 text-[#00ff87] text-xs font-semibold mb-4 tracking-widest uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              AI-Powered Consumer Protection
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
              Report Fake Products &{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #00ff87, #00ccff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Shops
              </span>
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base">
              Help protect consumers across India. Submit evidence, pin the location, and
              our AI will validate and update the shop's Trust Score in real time.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-10 space-y-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ── Section 1: Report Details ── */}
          <Section title="Submit a Shop or Product Report" icon="📋">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Shop Name" required>
                <input
                  data-testid="input-shop-name"
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g. Sharma Electronics"
                  className={inputCls}
                />
              </Field>
              <Field label="Product Name" required>
                <input
                  data-testid="input-product-name"
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Realme 12 Pro"
                  className={inputCls}
                />
              </Field>
              <Field label="Complaint Reason" required>
                <select
                  data-testid="select-complaint-reason"
                  value={complaintReason}
                  onChange={(e) => setComplaintReason(e.target.value)}
                  className={inputCls}
                >
                  <option value="" disabled>
                    Select a reason...
                  </option>
                  {COMPLAINT_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Rating (1–5 Stars)" required>
                <div className="flex items-center gap-1 pt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      data-testid={`button-star-${s}`}
                      onClick={() => setRating(s)}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className="w-7 h-7"
                        fill={s <= (hoverRating || rating) ? "#00ff87" : "none"}
                        stroke={s <= (hoverRating || rating) ? "#00ff87" : "#4b5563"}
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-2 text-sm text-[#00ff87] font-semibold">
                      {["", "Poor", "Fair", "Average", "Good", "Excellent"][rating]}
                    </span>
                  )}
                </div>
              </Field>
            </div>
            <Field label="Complaint Description" required className="mt-5">
              <textarea
                data-testid="textarea-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe the issue in detail (minimum 10 characters)..."
                className={inputCls + " resize-none"}
              />
            </Field>
          </Section>

          {/* ── Section 2: Evidence Upload ── */}
          <Section title="Evidence Upload (Optional)" icon="📎">
            <p className="text-gray-500 text-sm mb-4">
              Attach supporting evidence to strengthen your report. All uploads are optional.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {EVIDENCE_TYPES.map(({ id, label, icon: Icon, accept }) => {
                const file = uploadedFiles[id];
                return (
                  <label
                    key={id}
                    data-testid={`upload-${id}`}
                    className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#1a2f1a] bg-[#0d1a0d] hover:border-[#00ff87]/50 hover:bg-[#00ff87]/5 cursor-pointer transition-all p-5 text-center group"
                  >
                    <input
                      type="file"
                      accept={accept}
                      className="hidden"
                      onChange={(e) => handleFileChange(id, e.target.files?.[0] ?? null)}
                    />
                    <div
                      className="w-10 h-10 rounded-full bg-[#00ff87]/10 flex items-center justify-center group-hover:bg-[#00ff87]/20 transition-colors"
                    >
                      <Icon className="w-5 h-5 text-[#00ff87]" />
                    </div>
                    <span className="text-sm font-semibold text-gray-300">{label}</span>
                    {file ? (
                      <span className="text-xs text-[#00ff87] truncate max-w-[160px]">{file.name}</span>
                    ) : (
                      <span className="text-xs text-gray-600">Click to upload</span>
                    )}
                  </label>
                );
              })}
            </div>
          </Section>

          {/* ── Section 3: Map ── */}
          <Section title="Select Shop Location on India Map" icon="📍">
            <p className="text-gray-500 text-sm mb-4">
              Click anywhere on the map to drop a pin at the shop's location.
            </p>
            <div
              ref={mapRef}
              data-testid="map-india"
              className="w-full rounded-xl overflow-hidden border border-[#1a2f1a]"
              style={{ height: "400px", zIndex: 1 }}
            />
            <AnimatePresence>
              {selectedLat !== null && selectedLng !== null ? (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#00ff87]/10 border border-[#00ff87]/30"
                >
                  <MapPin className="w-4 h-4 text-[#00ff87] shrink-0" />
                  <div className="text-sm">
                    <span className="text-gray-400 mr-2">Selected Location</span>
                    <span className="text-[#00ff87] font-mono font-semibold">
                      Lat: {selectedLat} &nbsp; Lng: {selectedLng}
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a1a0a] border border-yellow-500/20 text-yellow-400 text-sm"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  No location selected — tap on the map above
                </motion.div>
              )}
            </AnimatePresence>
          </Section>

          {/* ── Submit Button ── */}
          <div className="flex flex-col items-center gap-4">
            <motion.button
              type="submit"
              data-testid="button-submit-report"
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className="relative w-full md:w-auto px-12 py-4 rounded-2xl font-bold text-base text-[#070d14] overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
              style={{
                background: isSubmitting
                  ? "#1a2f1a"
                  : "linear-gradient(90deg, #00ff87, #00ccff)",
                boxShadow: isSubmitting ? "none" : "0 0 24px rgba(0,255,135,0.35)",
                color: isSubmitting ? "#00ff87" : "#070d14",
              }}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                  </svg>
                  Validating Report...
                </span>
              ) : (
                "Submit Report"
              )}
            </motion.button>

            <AnimatePresence>
              {submitStatus !== "idle" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className={`w-full flex items-start gap-3 px-5 py-4 rounded-2xl border text-sm font-medium ${
                    submitStatus === "success"
                      ? "bg-[#00ff87]/10 border-[#00ff87]/40 text-[#00ff87]"
                      : "bg-red-500/10 border-red-500/40 text-red-400"
                  }`}
                >
                  {submitStatus === "success" ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  )}
                  <span>{submitMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>

        {/* ── Recent Reports ── */}
        <AnimatePresence>
          {submittedReports.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Section title="Recently Submitted Reports" icon="📊">
                <div className="space-y-3">
                  {submittedReports.map((r) => {
                    const key = r.shopName.toLowerCase();
                    const stats = shopStatsMap[key];
                    const ts = stats?.trustScore ?? 100;
                    const color = getMarkerColor(ts);
                    const colorMap = { green: "#22c55e", yellow: "#eab308", red: "#ef4444" };
                    return (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-[#1a2f1a] bg-[#0d1a0d]"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                            style={{ backgroundColor: colorMap[color] }}
                          />
                          <div>
                            <p className="font-semibold text-sm text-white">{r.shopName}</p>
                            <p className="text-xs text-gray-500">{r.productName} · {r.complaintReason}</p>
                            <p className="text-xs text-gray-600 mt-0.5">{r.timestamp}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 sm:shrink-0">
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Trust Score</p>
                            <p className="font-bold text-sm" style={{ color: colorMap[color] }}>
                              {ts}%
                            </p>
                          </div>
                          {ts >= 80 && (
                            <div className="px-2.5 py-1 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] text-xs font-semibold whitespace-nowrap">
                              ⭐ Trusted Seller
                            </div>
                          )}
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className="w-3.5 h-3.5"
                                fill={i < r.rating ? "#00ff87" : "none"}
                                stroke={i < r.rating ? "#00ff87" : "#374151"}
                                strokeWidth={1.5}
                              />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </Section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Trust Score Legend ── */}
        <Section title="Trust Score Legend" icon="🔰">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { color: "#22c55e", border: "#16a34a", label: "Trusted Shop", range: "80–100%", icon: "🟢", desc: "Verified & reliable" },
              { color: "#eab308", border: "#ca8a04", label: "Average Shop", range: "50–79%", icon: "🟡", desc: "Some complaints" },
              { color: "#ef4444", border: "#dc2626", label: "Complaint Shop", range: "0–49%", icon: "🔴", desc: "High risk, avoid" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                style={{ borderColor: item.border + "44", background: item.color + "10" }}
              >
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="font-semibold text-sm" style={{ color: item.color }}>
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.range} · {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

// ── Helpers ──

const inputCls =
  "w-full bg-[#0d1a0d] border border-[#1a3a1a] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00ff87]/60 focus:ring-1 focus:ring-[#00ff87]/30 transition-colors";

function Section({
  title,
  icon,
  children,
  className = "",
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-2xl border border-[#1a2f1a] bg-[#0a150a] p-6 ${className}`}
      style={{ boxShadow: "0 0 40px rgba(0,255,135,0.03)" }}
    >
      <h2 className="flex items-center gap-2 text-base md:text-lg font-bold text-white mb-5 pb-4 border-b border-[#1a2f1a]">
        <span className="text-lg">{icon}</span>
        <span
          style={{
            background: "linear-gradient(90deg, #ffffff, #00ff87)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {title}
        </span>
      </h2>
      {children}
    </motion.div>
  );
}

function Field({
  label,
  required,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {label}
        {required && <span className="text-[#00ff87] ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
