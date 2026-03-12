import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { ImageUploader } from "@/components/ImageUploader";
import { ProductCard } from "@/components/ProductCard";
import { useProducts, useAnalyzeProduct } from "@/hooks/use-products";
import { Scan, ShieldCheck, Zap, History, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useLang } from "@/context/LanguageContext";
import heroBg from "@assets/IMG_20260312_074711_595_1773282658001.jpg";

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: history, isLoading: isHistoryLoading } = useProducts();
  const { mutate: analyze, isPending: isAnalyzing } = useAnalyzeProduct();
  const [error, setError] = useState<string | null>(null);
  const { t } = useLang();
  const contentRef = useRef<HTMLDivElement>(null);

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

  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-background">

      {/* ── HERO SECTION ── */}
      <section
        className="relative w-full flex items-center justify-center overflow-hidden"
        style={{ height: "100vh", minHeight: "600px" }}
      >
        {/* Background Image */}
        <img
          src={heroBg}
          alt="Hero Background"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ filter: "brightness(0.32) blur(3px)", transform: "scale(1.05)" }}
        />

        {/* Dark gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.70) 100%)",
          }}
        />

        {/* Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative z-10 text-center px-4 max-w-3xl mx-auto"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm border border-white/25"
            style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}>
            <Zap className="w-4 h-4" style={{ fill: "#a78bfa" }} />
            <span>{t("home.badge")}</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6 text-white drop-shadow-xl">
            {t("home.title1")}{" "}
            <span className="text-gradient">{t("home.title2")}</span>
            <br />
            {t("home.title3")}
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-10 max-w-xl mx-auto">
            {t("home.subtitle")}
          </p>

          {/* CTA Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={scrollToContent}
            data-testid="button-scan-product"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl transition-all"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
              color: "#fff",
              boxShadow: "0 8px 32px rgba(124,58,237,0.45)",
            }}
          >
            <Scan className="w-5 h-5" />
            {t("home.scan_btn")}
          </motion.button>
        </motion.div>

        {/* Scroll down arrow */}
        <motion.button
          onClick={scrollToContent}
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/60 hover:text-white transition-colors"
        >
          <ChevronDown className="w-8 h-8" />
        </motion.button>
      </section>

      {/* ── MAIN CONTENT ── */}
      <div ref={contentRef} className="relative overflow-x-hidden">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none opacity-50" />
        <div className="absolute top-40 -right-40 w-96 h-96 bg-accent/20 rounded-full blur-[128px] pointer-events-none opacity-50" />

        <main className="container max-w-6xl mx-auto px-4 py-16 lg:py-24 relative z-10">

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
              <div className="text-center py-12 border-2 border-dashed border-border rounded-3xl bg-card/50">
                <p className="text-muted-foreground">{t("home.no_scans")}</p>
              </div>
            )}
          </section>

        </main>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
