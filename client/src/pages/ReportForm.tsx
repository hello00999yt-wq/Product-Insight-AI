import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ShieldCheck, CheckCircle2, XCircle, FileImage, Video, Receipt, Package, ExternalLink } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

interface Report {
  id: number;
  shopName: string;
  productName: string;
  complaintReason: string;
  description: string;
  rating: number;
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

// English keys — used as GOVT_LINKS keys and stored in state
const COMPLAINT_REASONS = [
  "Fake Product / Duplicate Brand Product",
  "Expired Food Product / Unsafe Food",
  "Overcharging / MRP Violation",
  "Online Shopping Fraud",
  "Poor Product Quality",
  "Wrong Product Information",
  "Misleading Advertisement",
  "Other",
];

// Maps each reason to its translation key
const REASON_KEY_MAP: Record<string, string> = {
  "Fake Product / Duplicate Brand Product": "rf.reason.1",
  "Expired Food Product / Unsafe Food":     "rf.reason.2",
  "Overcharging / MRP Violation":           "rf.reason.3",
  "Online Shopping Fraud":                  "rf.reason.4",
  "Poor Product Quality":                   "rf.reason.5",
  "Wrong Product Information":              "rf.reason.6",
  "Misleading Advertisement":               "rf.reason.7",
  "Other":                                  "rf.reason.8",
};

const GOVT_LINKS: Record<string, { url: string; authority: string; icon: string }> = {
  "Fake Product / Duplicate Brand Product": {
    url: "https://consumerhelpline.gov.in",
    authority: "National Consumer Helpline",
    icon: "🏛️",
  },
  "Expired Food Product / Unsafe Food": {
    url: "https://foscos.fssai.gov.in",
    authority: "FSSAI Food Safety Portal",
    icon: "🍽️",
  },
  "Overcharging / MRP Violation": {
    url: "https://consumeraffairs.nic.in",
    authority: "Ministry of Consumer Affairs",
    icon: "⚖️",
  },
  "Online Shopping Fraud": {
    url: "https://cybercrime.gov.in",
    authority: "National Cyber Crime Reporting Portal",
    icon: "🔐",
  },
  "Poor Product Quality": {
    url: "https://consumerhelpline.gov.in",
    authority: "National Consumer Helpline",
    icon: "🏛️",
  },
  "Wrong Product Information": {
    url: "https://consumerhelpline.gov.in",
    authority: "National Consumer Helpline",
    icon: "🏛️",
  },
  "Misleading Advertisement": {
    url: "https://consumerhelpline.gov.in",
    authority: "National Consumer Helpline",
    icon: "🏛️",
  },
};

const EVIDENCE_TYPE_DEFS = [
  { id: "photo",     labelKey: "rf.ev.photo",     icon: FileImage, accept: "image/*" },
  { id: "bill",      labelKey: "rf.ev.bill",      icon: Receipt,   accept: "image/*,application/pdf" },
  { id: "packaging", labelKey: "rf.ev.packaging", icon: Package,   accept: "image/*" },
  { id: "video",     labelKey: "rf.ev.video",     icon: Video,     accept: "video/*" },
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

export default function ReportForm() {
  const [, navigate] = useLocation();
  const { t } = useLang();

  const [shopName, setShopName] = useState("");
  const [productName, setProductName] = useState("");
  const [complaintReason, setComplaintReason] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({});
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [submittedReports, setSubmittedReports] = useState<Report[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const validateReport = (): { valid: boolean; message: string } => {
    if (!shopName.trim()) return { valid: false, message: t("rf.err.shop") };
    if (!productName.trim()) return { valid: false, message: t("rf.err.product") };
    if (!complaintReason) return { valid: false, message: t("rf.err.reason") };
    if (!description.trim() || description.trim().length < 10)
      return { valid: false, message: t("rf.err.desc") };
    if (rating < 1 || rating > 5) return { valid: false, message: t("rf.err.rating") };
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
      setSubmitMessage(`${t("rf.err.prefix")} ${validation.message}`);
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

    setSubmittedReports([newReport, ...submittedReports]);
    setSubmitStatus("success");
    setShowSuccessPopup(true);

    const ts = shopStatsMap[key].trustScore;
    const badge = ts >= 80 ? ` — ${t("rf.trusted")}` : "";
    setSubmitMessage(
      `${t("rf.success.msg")} "${shopName}": ${ts}%${badge}`
    );

    setShopName("");
    setProductName("");
    setComplaintReason("");
    setDescription("");
    setRating(0);
    setUploadedFiles({});
    setIsSubmitting(false);
  };

  const handleFileChange = (typeId: string, file: File | null) => {
    setUploadedFiles((prev) => ({ ...prev, [typeId]: file }));
  };

  return (
    <div className="min-h-screen text-white" style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>

      {/* Hero Banner */}
      <div className="relative overflow-hidden border-b border-[#8b5cf6]/20 bg-gradient-to-b from-[#120b2e] to-[#0d0b1e]">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #8b5cf6 0%, transparent 50%), radial-gradient(circle at 80% 50%, #3b82f6 0%, transparent 50%)",
          }}
        />
        <div className="relative container max-w-4xl mx-auto px-4 py-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#8b5cf6]/40 bg-[#8b5cf6]/10 text-[#a78bfa] text-xs font-semibold mb-4 tracking-widest uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t("rf.badge")}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
              {t("rf.hero.title1")}{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #a78bfa, #60a5fa)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {t("rf.hero.title2")}
              </span>
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base">
              {t("rf.hero.sub")}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-10 space-y-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ── Section 1: Report Details ── */}
          <Section title={t("rf.sec1.title")} icon="📋">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label={t("rf.field.shop")} required>
                <input
                  data-testid="input-shop-name"
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder={t("rf.field.shop.ph")}
                  className={inputCls}
                />
              </Field>
              <Field label={t("rf.field.product")} required>
                <input
                  data-testid="input-product-name"
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder={t("rf.field.product.ph")}
                  className={inputCls}
                />
              </Field>
              <Field label={t("rf.field.reason")} required>
                <select
                  data-testid="select-complaint-reason"
                  value={complaintReason}
                  onChange={(e) => setComplaintReason(e.target.value)}
                  className={inputCls}
                >
                  <option value="" disabled>
                    {t("rf.field.reason.ph")}
                  </option>
                  {COMPLAINT_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {t(REASON_KEY_MAP[r])}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t("rf.field.rating")} required>
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
                        fill={s <= (hoverRating || rating) ? "#a78bfa" : "none"}
                        stroke={s <= (hoverRating || rating) ? "#a78bfa" : "#4b5563"}
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-2 text-sm text-[#a78bfa] font-semibold">
                      {t(`rf.rating.${rating}`)}
                    </span>
                  )}
                </div>
              </Field>
            </div>
            <Field label={t("rf.field.desc")} required className="mt-5">
              <textarea
                data-testid="textarea-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder={t("rf.field.desc.ph")}
                className={inputCls + " resize-none"}
              />
            </Field>
          </Section>

          {/* ── Section 2: Evidence Upload ── */}
          <Section title={t("rf.sec2.title")} icon="📎">
            <p className="text-gray-500 text-sm mb-4">
              {t("rf.sec2.desc")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {EVIDENCE_TYPE_DEFS.map(({ id, labelKey, icon: Icon, accept }) => {
                const file = uploadedFiles[id];
                return (
                  <label
                    key={id}
                    data-testid={`upload-${id}`}
                    className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#1e1844] bg-[#120e30] hover:border-[#8b5cf6]/50 hover:bg-[#8b5cf6]/5 cursor-pointer transition-all p-5 text-center group"
                  >
                    <input
                      type="file"
                      accept={accept}
                      className="hidden"
                      onChange={(e) => handleFileChange(id, e.target.files?.[0] ?? null)}
                    />
                    <div
                      className="w-10 h-10 rounded-full bg-[#8b5cf6]/10 flex items-center justify-center group-hover:bg-[#8b5cf6]/20 transition-colors"
                    >
                      <Icon className="w-5 h-5 text-[#a78bfa]" />
                    </div>
                    <span className="text-sm font-semibold text-gray-300">{t(labelKey)}</span>
                    {file ? (
                      <span className="text-xs text-[#a78bfa] truncate max-w-[160px]">{file.name}</span>
                    ) : (
                      <span className="text-xs text-gray-600">{t("rf.ev.upload")}</span>
                    )}
                  </label>
                );
              })}
            </div>
          </Section>

          {/* ── Submit Button ── */}
          <div className="flex flex-col items-center gap-4">
            <motion.button
              type="submit"
              data-testid="button-submit-report"
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className="relative w-full md:w-auto px-12 py-4 rounded-2xl font-bold text-base overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
              style={{
                background: isSubmitting
                  ? "#1a1535"
                  : "linear-gradient(90deg, #8b5cf6, #3b82f6)",
                boxShadow: isSubmitting ? "none" : "0 0 24px rgba(139,92,246,0.4)",
                color: isSubmitting ? "#a78bfa" : "#ffffff",
              }}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                  </svg>
                  {t("rf.submitting")}
                </span>
              ) : (
                t("rf.submit")
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
                      ? "bg-[#8b5cf6]/10 border-[#8b5cf6]/40 text-[#a78bfa]"
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

        {/* ── Government Complaint Section ── */}
        <AnimatePresence>
          {complaintReason && GOVT_LINKS[complaintReason] && (
            <motion.div
              key={complaintReason}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ type: "spring", damping: 24, stiffness: 260 }}
              className="rounded-2xl overflow-hidden"
              style={{
                border: "1px solid rgba(251,191,36,0.35)",
                boxShadow: "0 0 32px rgba(251,191,36,0.08), 0 0 0 1px rgba(251,191,36,0.06)",
              }}
            >
              {/* Amber top strip */}
              <div
                className="h-1 w-full"
                style={{ background: "linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)" }}
              />

              <div className="bg-[#0d0b1e]/90 backdrop-blur-sm px-6 py-6">
                {/* Icon + heading row */}
                <div className="flex items-start gap-4 mb-5">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                    style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.3)" }}
                  >
                    ⚠️
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base mb-0.5" style={{ color: "#fbbf24" }}>
                      {t("rf.govt.title")}
                    </h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {t("rf.govt.desc")}
                    </p>
                  </div>
                </div>

                {/* Authority info pill */}
                <div
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-5"
                  style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.18)" }}
                >
                  <span className="text-base">{GOVT_LINKS[complaintReason].icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{t("rf.govt.authority")}</p>
                    <p className="text-sm font-semibold text-white truncate">{GOVT_LINKS[complaintReason].authority}</p>
                  </div>
                  <div
                    className="text-xs px-2.5 py-1 rounded-lg font-semibold flex-shrink-0"
                    style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}
                  >
                    {t("rf.govt.official")}
                  </div>
                </div>

                {/* CTA button */}
                <motion.a
                  href={GOVT_LINKS[complaintReason].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="button-govt-complaint"
                  whileHover={{ scale: 1.025 }}
                  whileTap={{ scale: 0.975 }}
                  className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all"
                  style={{
                    background: "linear-gradient(90deg, #d97706, #f59e0b, #fbbf24)",
                    color: "#000",
                    boxShadow: "0 4px 20px rgba(251,191,36,0.3)",
                  }}
                  onMouseOver={(e) => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 28px rgba(251,191,36,0.5)"; }}
                  onMouseOut={(e)  => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 20px rgba(251,191,36,0.3)"; }}
                >
                  <span>{t("rf.govt.btn")}</span>
                  <ExternalLink className="w-4 h-4" />
                </motion.a>

                <p className="text-center text-xs text-gray-600 mt-3">
                  {t("rf.govt.note")}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Recent Reports ── */}
        <AnimatePresence>
          {submittedReports.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Section title={t("rf.recent.title")} icon="📊">
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
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-[#1e1844] bg-[#120e30]"
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
                            <p className="text-xs text-gray-500">{t("rf.trust_score")}</p>
                            <p className="font-bold text-sm" style={{ color: colorMap[color] }}>
                              {ts}%
                            </p>
                          </div>
                          {ts >= 80 && (
                            <div className="px-2.5 py-1 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] text-xs font-semibold whitespace-nowrap">
                              {t("rf.trusted_seller")}
                            </div>
                          )}
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className="w-3.5 h-3.5"
                                fill={i < r.rating ? "#a78bfa" : "none"}
                                stroke={i < r.rating ? "#a78bfa" : "#374151"}
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
        <Section title={t("rf.legend.title")} icon="🔰">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { color: "#22c55e", border: "#16a34a", label: t("rf.legend.trusted"), range: "80–100%", icon: "🟢", desc: t("rf.legend.trusted.desc") },
              { color: "#eab308", border: "#ca8a04", label: t("rf.legend.average"), range: "50–79%", icon: "🟡", desc: t("rf.legend.average.desc") },
              { color: "#ef4444", border: "#dc2626", label: t("rf.legend.risk"),    range: "0–49%",   icon: "🔴", desc: t("rf.legend.risk.desc") },
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

      {/* ── Success Popup Modal ── */}
      <AnimatePresence>
        {showSuccessPopup && (
          <>
            {/* Backdrop */}
            <motion.div
              data-testid="popup-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
              style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
              onClick={() => { setShowSuccessPopup(false); navigate("/"); }}
            >
              {/* Popup Card */}
              <motion.div
                data-testid="popup-success"
                initial={{ opacity: 0, scale: 0.85, y: 32 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-md rounded-3xl overflow-hidden"
                style={{
                  background: "linear-gradient(145deg, #0f0c2e, #130e35)",
                  border: "1px solid rgba(34,197,94,0.3)",
                  boxShadow: "0 0 60px rgba(34,197,94,0.18), 0 24px 60px rgba(0,0,0,0.6)",
                }}
              >
                {/* Top glow strip */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
                  style={{ background: "linear-gradient(90deg, #22c55e, #4ade80, #22c55e)" }}
                />

                <div className="px-8 py-10 flex flex-col items-center text-center">
                  {/* Animated checkmark circle */}
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                    className="relative mb-6"
                  >
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center"
                      style={{
                        background: "radial-gradient(circle, rgba(34,197,94,0.2) 0%, rgba(34,197,94,0.05) 70%)",
                        border: "2px solid rgba(34,197,94,0.5)",
                        boxShadow: "0 0 30px rgba(34,197,94,0.3)",
                      }}
                    >
                      <CheckCircle2 className="w-10 h-10" style={{ color: "#22c55e" }} />
                    </div>
                    {/* Pulse ring */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ border: "2px solid rgba(34,197,94,0.4)" }}
                      animate={{ scale: [1, 1.4, 1.4], opacity: [0.8, 0, 0] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                    />
                  </motion.div>

                  {/* Title */}
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-extrabold mb-4"
                    style={{
                      background: "linear-gradient(90deg, #ffffff, #4ade80)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {t("rf.popup.thanks")}
                  </motion.h2>

                  {/* Message body */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.28 }}
                    className="space-y-2 mb-8"
                  >
                    <p className="text-white/90 font-semibold text-sm leading-relaxed">
                      {t("rf.popup.submitted")}
                    </p>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {t("rf.popup.review")}
                    </p>
                    <p className="text-[#4ade80] text-sm font-medium leading-relaxed pt-1">
                      {t("rf.popup.thanks2")}
                    </p>
                  </motion.div>

                  {/* Close button */}
                  <motion.button
                    data-testid="button-close-popup"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.36 }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setShowSuccessPopup(false); navigate("/"); }}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm tracking-wide text-white transition-all"
                    style={{
                      background: "linear-gradient(90deg, #16a34a, #22c55e)",
                      boxShadow: "0 0 20px rgba(34,197,94,0.35)",
                    }}
                  >
                    {t("rf.popup.btn")}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Helpers ──

const inputCls =
  "w-full bg-[#120e30] border border-[#1e1844] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#8b5cf6]/60 focus:ring-1 focus:ring-[#8b5cf6]/30 transition-colors";

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
      className={`rounded-2xl border border-[#1e1844] bg-[#0d0b1e]/80 backdrop-blur-sm p-6 ${className}`}
      style={{ boxShadow: "0 0 40px rgba(139,92,246,0.05)" }}
    >
      <h2 className="flex items-center gap-2 text-base md:text-lg font-bold text-white mb-5 pb-4 border-b border-[#1e1844]">
        <span className="text-lg">{icon}</span>
        <span
          style={{
            background: "linear-gradient(90deg, #ffffff, #a78bfa)",
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
        {required && <span className="text-[#a78bfa] ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
