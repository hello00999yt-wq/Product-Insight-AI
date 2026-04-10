import { useRoute, Link } from "wouter";
import { useProduct, useTranslateProduct } from "@/hooks/use-products";
import { IngredientsAndChemicals } from "@/components/IngredientsAndChemicals";
import { Loader2, ArrowLeft, Star, Share2, Info, Languages } from "lucide-react";
import { RiskBadge } from "@/components/RiskBadge";
import { ProductStamp } from "@/components/ProductStamp";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLang } from "@/context/LanguageContext";

export default function ProductDetails() {
  const [, params] = useRoute("/product/:id");
  const id = params ? parseInt(params.id) : 0;
  const { data: product, isLoading, error } = useProduct(id);
  const { t, lang } = useLang();

  // Live translation — re-runs whenever lang changes, cached in localStorage
  const {
    data: translated,
    isLoading: isTranslating,
  } = useTranslateProduct(id, lang);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground animate-pulse">{t("pd.loading")}</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <h2 className="text-2xl font-bold mb-2">{t("pd.not_found")}</h2>
        <p className="text-muted-foreground mb-6">{t("pd.not_found_desc")}</p>
        <Link href="/">
          <Button>{t("pd.return_home")}</Button>
        </Link>
      </div>
    );
  }

  // Use translated fields when available, fall back to stored English
  const displayName        = translated?.name              ?? product.name;
  const displayDescription = translated?.description       ?? product.description;
  const displayTips        = translated?.identificationTips ?? product.identificationTips;

  return (
    <div className="min-h-screen bg-mesh pb-20 relative overflow-x-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-[128px] pointer-events-none opacity-50" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-[128px] pointer-events-none opacity-50" />

      {/* Navigation */}
      <div className="border-b bg-card/50 backdrop-blur-xl sticky top-14 z-30">
        <div className="container max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 hover-elevate">
              <ArrowLeft className="w-4 h-4" />
              {t("pd.back")}
            </Button>
          </Link>
          <div className="font-semibold text-sm hidden md:block text-primary">
            {displayName}
          </div>
          <Button variant="ghost" size="icon" className="hover-elevate">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <main className="container max-w-5xl mx-auto px-4 py-12 relative z-10">

        {/* Live translation indicator */}
        <AnimatePresence>
          {isTranslating && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center justify-center gap-2 mb-6 px-4 py-2 rounded-xl mx-auto w-fit"
              style={{
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.3)",
              }}
            >
              <Languages className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span className="text-sm font-medium text-indigo-400">
                {lang === "hi" ? "हिंदी में अनुवाद हो रहा है…" : "Translating to English…"}
              </span>
              <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12"
        >
          {/* Left Column — Image */}
          <div className="space-y-6">
            <div
              className="aspect-square rounded-3xl overflow-hidden bg-white border-2 border-blue-500/50 relative"
              style={{ boxShadow: "0 0 25px rgba(59,130,246,0.2)" }}
            >
              <img
                src={product.imageUrl}
                alt={displayName}
                className="w-full h-full object-contain p-8"
              />
              <ProductStamp fakeRiskLevel={product.fakeRiskLevel} />
              <div className="absolute top-4 left-4">
                <RiskBadge level={product.fakeRiskLevel} className="bg-white/90 backdrop-blur" />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div
                className="p-4 rounded-xl bg-card border border-blue-500/40"
                style={{ boxShadow: "0 0 12px rgba(59,130,246,0.1)" }}
              >
                <p className="text-sm text-muted-foreground mb-1">{t("pd.mrp")}</p>
                <p className="text-xl font-bold text-foreground">{product.mrp}</p>
              </div>
              <div
                className="p-4 rounded-xl bg-primary/5 border border-blue-500/40"
                style={{ boxShadow: "0 0 12px rgba(59,130,246,0.1)" }}
              >
                <p className="text-sm text-primary/80 mb-1">{t("pd.market_price")}</p>
                <p className="text-xl font-bold text-primary">{product.marketPrice}</p>
              </div>
            </div>

            {/* Language badge */}
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl w-fit"
              style={{
                background: "rgba(99,102,241,0.08)",
                border: "1px solid rgba(99,102,241,0.2)",
              }}
            >
              <Languages className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-medium text-indigo-400">
                {lang === "hi" ? "हिंदी में दिखाया जा रहा है" : "Showing in English"}
              </span>
              {isTranslating && <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />}
            </div>
          </div>

          {/* Right Column — Details */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-semibold tracking-wider text-primary uppercase bg-primary/10 px-3 py-1 rounded-full">
                  {product.brand}
                </span>
              </div>

              <motion.h1
                key={displayName}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 leading-tight"
              >
                {isTranslating ? (
                  <span className="animate-pulse text-muted-foreground">{product.name}</span>
                ) : displayName}
              </motion.h1>

              <motion.p
                key={displayDescription}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-muted-foreground text-lg leading-relaxed"
              >
                {isTranslating ? (
                  <span className="animate-pulse">{product.description}</span>
                ) : displayDescription}
              </motion.p>
            </div>

            <Separator />

            {/* Ingredients & Chemical Analysis */}
            <IngredientsAndChemicals productId={id} />

            <Separator />

            {/* Authenticity Tips */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold">{t("pd.authenticity")}</h3>
              </div>

              <div className="space-y-3">
                <AnimatePresence mode="wait">
                  {isTranslating ? (
                    <motion.div
                      key="skeleton"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3"
                    >
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-14 rounded-xl animate-pulse"
                          style={{ background: "rgba(99,102,241,0.07)" }}
                        />
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key={lang + displayTips.join("")}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3"
                    >
                      {displayTips.map((tip, index) => (
                        <div
                          key={index}
                          className="flex gap-4 p-4 rounded-xl bg-muted/50 border border-blue-500/30"
                          style={{ boxShadow: "0 0 10px rgba(59,130,246,0.07)" }}
                        >
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <p className="text-sm md:text-base">{tip}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <Separator />

            {/* Community Reviews */}
            <div>
              <h3 className="text-xl font-bold mb-6">{t("pd.reviews")}</h3>
              <div className="space-y-6">
                <Review
                  name="Alex Morgan"
                  rating={5}
                  date={t("pd.review1.date")}
                  text={t("pd.review1.text")}
                />
                <Review
                  name="Sarah Chen"
                  rating={4}
                  date={t("pd.review2.date")}
                  text={t("pd.review2.text")}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function Review({ name, rating, date, text }: { name: string; rating: number; date: string; text: string }) {
  return (
    <div className="flex gap-4">
      <Avatar className="w-10 h-10 border">
        <AvatarFallback className="bg-primary/10 text-primary font-bold">
          {name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-sm">{name}</h4>
          <span className="text-muted-foreground text-xs">• {date}</span>
        </div>
        <div className="flex text-yellow-400 mb-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`w-3 h-3 ${i < rating ? "fill-current" : "text-muted"}`} />
          ))}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
