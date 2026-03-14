import { useState } from "react";
import { useLocation, Link } from "wouter";
import { ImageUploader } from "@/components/ImageUploader";
import { ProductCard } from "@/components/ProductCard";
import { useProducts, useAnalyzeProduct } from "@/hooks/use-products";
import { Scan, ShieldCheck, Zap, History, Flag, MapPin, Star, ArrowRight, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { useLang } from "@/context/LanguageContext";

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: history, isLoading: isHistoryLoading } = useProducts();
  const { mutate: analyze, isPending: isAnalyzing } = useAnalyzeProduct();
  const [error, setError] = useState<string | null>(null);
  const { t } = useLang();

  const handleImageSelected = (base64: string) => {
    setError(null);
    analyze(
      { image: base64 },
      {
        onSuccess: (product) => {
          setLocation(`/product/${product.id}`);
        },
        onError: (err) => {
          setError(err.message || "Failed to analyze image. Please try again.");
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <div className="absolute top-0 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none opacity-50" />
      <div className="absolute top-40 -right-40 w-96 h-96 bg-accent/20 rounded-full blur-[128px] pointer-events-none opacity-50" />

      <main className="container max-w-6xl mx-auto px-4 py-12 lg:py-20 relative z-10">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
              <Zap className="w-4 h-4 fill-primary" />
              <span>{t("home.badge")}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              {t("home.title1")} <span className="text-gradient">{t("home.title2")}</span> {t("home.title3")}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
              {t("home.subtitle")}
            </p>
          </motion.div>
        </div>

        {/* Upload Section */}
        <section className="mb-24">
          <ImageUploader
            onImageSelected={handleImageSelected}
            isAnalyzing={isAnalyzing}
          />
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-destructive/10 text-destructive text-center rounded-xl border border-destructive/20 max-w-md mx-auto"
            >
              {error}
            </motion.div>
          )}
        </section>

        {/* Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <FeatureCard
            icon={Scan}
            title={t("feature.recognition.title")}
            description={t("feature.recognition.desc")}
          />
          <FeatureCard
            icon={ShieldCheck}
            title={t("feature.fake.title")}
            description={t("feature.fake.desc")}
          />
          <FeatureCard
            icon={Zap}
            title={t("feature.price.title")}
            description={t("feature.price.desc")}
          />
        </section>

        {/* Report Form CTA Section */}
        <section className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0d0b1e 0%, #120b2e 50%, #0e1535 100%)",
              border: "1px solid rgba(139,92,246,0.25)",
              boxShadow: "0 0 60px rgba(139,92,246,0.08), inset 0 1px 0 rgba(139,92,246,0.1)",
            }}
          >
            {/* Background glow effects */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 15% 50%, rgba(139,92,246,0.1) 0%, transparent 50%), radial-gradient(circle at 85% 50%, rgba(59,130,246,0.08) 0%, transparent 50%)",
              }}
            />

            <div className="relative z-10 p-8 md:p-12">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 mb-10">
                <div>
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4 tracking-widest uppercase"
                    style={{
                      background: "rgba(139,92,246,0.12)",
                      border: "1px solid rgba(139,92,246,0.35)",
                      color: "#a78bfa",
                    }}
                  >
                    <Flag className="w-3 h-3" />
                    Consumer Protection System
                  </div>
                  <h2
                    className="text-3xl md:text-4xl font-extrabold text-white mb-3 leading-tight"
                  >
                    Report Fake Products &{" "}
                    <span
                      style={{
                        background: "linear-gradient(90deg, #a78bfa, #60a5fa)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      Shops
                    </span>
                  </h2>
                  <p className="text-gray-400 max-w-lg text-sm md:text-base leading-relaxed">
                    Spotted a fake product or dishonest shop? Submit a report with evidence,
                    pin the location on India's map, and our AI will calculate the shop's
                    Trust Score instantly.
                  </p>
                </div>

                <Link href="/report" data-testid="link-report-cta">
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm whitespace-nowrap cursor-pointer shrink-0"
                    style={{
                      background: "linear-gradient(90deg, #8b5cf6, #3b82f6)",
                      color: "#ffffff",
                      boxShadow: "0 0 28px rgba(139,92,246,0.4)",
                    }}
                  >
                    <Flag className="w-4 h-4" />
                    Submit a Report
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </Link>
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    icon: Flag,
                    label: "Report Form",
                    desc: "Fill shop & product details with complaint reason",
                    color: "#a78bfa",
                  },
                  {
                    icon: Upload,
                    label: "Upload Evidence",
                    desc: "Attach photos, receipts, bills or videos",
                    color: "#60a5fa",
                  },
                  {
                    icon: MapPin,
                    label: "Pin Location",
                    desc: "Select exact shop location on India map",
                    color: "#a78bfa",
                  },
                  {
                    icon: Star,
                    label: "Trust Score",
                    desc: "AI validates & updates shop trust instantly",
                    color: "#fbbf24",
                  },
                ].map(({ icon: Icon, label, desc, color }) => (
                  <div
                    key={label}
                    className="rounded-2xl p-4"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: color + "18" }}
                    >
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <p className="text-white text-sm font-semibold mb-1">{label}</p>
                    <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>

              {/* Trust Score Badge Row */}
              <div className="flex flex-wrap items-center gap-3 mt-8 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <span className="text-gray-600 text-xs font-semibold uppercase tracking-wider">Marker Legend:</span>
                {[
                  { color: "#22c55e", label: "Trusted Shop", range: "80–100%" },
                  { color: "#eab308", label: "Average Shop", range: "50–79%" },
                  { color: "#ef4444", label: "Complaint Shop", range: "0–49%" },
                ].map(({ color, label, range }) => (
                  <div
                    key={label}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{
                      background: color + "15",
                      border: `1px solid ${color}40`,
                      color,
                    }}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    {label} · {range}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Recent Scans */}
        <section>
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-primary/10 p-2 rounded-lg">
              <History className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">{t("home.recent")}</h2>
          </div>

          {isHistoryLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : history && history.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {history.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-blue-500/40 rounded-3xl bg-card/50" style={{ boxShadow: "0 0 18px rgba(59,130,246,0.08)" }}>
              <p className="text-muted-foreground">{t("home.no_scans")}</p>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-card border border-blue-500/40 shadow-sm hover:shadow-lg transition-all duration-300" style={{ boxShadow: "0 0 14px rgba(59,130,246,0.1)" }}>
      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
