import { useState } from "react";
import { useLocation } from "wouter";
import { ImageUploader } from "@/components/ImageUploader";
import { ProductCard } from "@/components/ProductCard";
import { useProducts, useAnalyzeProduct } from "@/hooks/use-products";
import { Scan, ShieldCheck, Zap, History } from "lucide-react";
import { motion } from "framer-motion";
import { useLang } from "@/context/LanguageContext";
import heroBg from "@assets/IMG_20260312_074711_595_1773282658001.jpg";

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
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Full-page background image */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src={heroBg}
          alt=""
          className="w-full h-full object-cover object-center"
          style={{ filter: 'blur(6px) brightness(0.28) saturate(1.3)', transform: 'scale(1.05)' }}
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <main className="container max-w-6xl mx-auto px-4 py-12 lg:py-20 relative z-10">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-sm font-semibold mb-6 backdrop-blur-sm border border-white/20">
              <Zap className="w-4 h-4 fill-white" />
              <span>{t("home.badge")}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-white drop-shadow-lg">
              {t("home.title1")} <span className="text-gradient">{t("home.title2")}</span> {t("home.title3")}
            </h1>
            <p className="text-lg md:text-xl text-white/75 leading-relaxed mb-8">
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

        {/* Recent Scans */}
        <section>
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-white/15 p-2 rounded-lg backdrop-blur-sm border border-white/20">
              <History className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">{t("home.recent")}</h2>
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
            <div className="text-center py-12 border-2 border-dashed border-white/20 rounded-3xl bg-white/5 backdrop-blur-sm">
              <p className="text-white/70">{t("home.no_scans")}</p>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md shadow-lg hover:bg-white/15 transition-all">
      <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-bold mb-2 text-white">{title}</h3>
      <p className="text-white/65 leading-relaxed">{description}</p>
    </div>
  );
}
