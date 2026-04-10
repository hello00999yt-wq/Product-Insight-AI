import { motion } from "framer-motion";
import { Loader2, Brain, Zap } from "lucide-react";
import { useSimpleAnalysis } from "@/hooks/use-products";
import { useLang } from "@/context/LanguageContext";

/* ── Parse <span class="highlight">text</span> → green bold spans ── */
function renderHighlighted(text: string) {
  const parts = text.split(/(<span class="highlight">[\s\S]*?<\/span>)/g);
  return parts.map((part, i) => {
    const match = part.match(/^<span class="highlight">([\s\S]*?)<\/span>$/);
    if (match) {
      return (
        <span
          key={i}
          className="text-emerald-400 font-bold"
          style={{ textShadow: "0 0 12px rgba(52,211,153,0.35)" }}
        >
          {match[1]}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

/* ── Skeleton loader ── */
function SectionSkeleton() {
  return (
    <div className="animate-pulse space-y-2 p-5">
      <div className="h-4 w-40 bg-muted rounded" />
      <div className="h-3 w-full bg-muted/60 rounded" />
      <div className="h-3 w-5/6 bg-muted/60 rounded" />
      <div className="h-3 w-4/6 bg-muted/60 rounded" />
    </div>
  );
}

/* ── Section card ── */
function SectionCard({
  title,
  text,
  accentColor,
  delay,
}: {
  title: string;
  text: string;
  accentColor: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className="rounded-xl border bg-card/60 backdrop-blur-sm overflow-hidden"
      style={{ borderColor: accentColor + "40", boxShadow: `0 0 16px ${accentColor}12` }}
    >
      <div
        className="px-5 py-3 border-b"
        style={{ borderColor: accentColor + "30", background: accentColor + "0d" }}
      >
        <h3 className="font-bold text-sm md:text-base" style={{ color: accentColor }}>
          {title}
        </h3>
      </div>
      <div className="px-5 py-4 text-sm md:text-base text-foreground/90 leading-relaxed whitespace-pre-line">
        {renderHighlighted(text)}
      </div>
    </motion.div>
  );
}

/* ── Main export ── */
export function SimpleAnalysis({ productId }: { productId: number }) {
  const { t, lang } = useLang();
  const { data, isLoading, isError } = useSimpleAnalysis(productId, lang);

  if (isError) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-10"
      data-testid="simple-analysis-section"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center flex-shrink-0">
          <Brain className="w-5 h-5 text-violet-400" />
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-foreground text-lg leading-tight">{t("sa.title")}</h2>
        </div>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{
            background: "rgba(139,92,246,0.12)",
            border: "1px solid rgba(139,92,246,0.3)",
            color: "#a78bfa",
          }}
        >
          <Zap className="w-3 h-3" />
          {t("sa.badge")}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="rounded-2xl border border-violet-500/20 bg-card/50 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-violet-500/10 bg-violet-500/5">
            <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
            <span className="text-sm text-violet-400 font-medium">{t("sa.loading")}</span>
          </div>
          <SectionSkeleton />
          <SectionSkeleton />
          <SectionSkeleton />
          <SectionSkeleton />
        </div>
      )}

      {/* Content — 4 sections */}
      {!isLoading && data && (
        <div className="space-y-4">
          {/* 1. Simple Explanation — first & most prominent */}
          <SectionCard
            title={t("sa.simple")}
            text={data.simpleExplanation}
            accentColor="#8b5cf6"
            delay={0}
          />

          {/* 2. Quick Summary */}
          <SectionCard
            title={t("sa.summary")}
            text={data.quickSummary}
            accentColor="#06b6d4"
            delay={0.08}
          />

          {/* 3. What To Do */}
          <SectionCard
            title={t("sa.todo")}
            text={data.whatToDo}
            accentColor="#f59e0b"
            delay={0.16}
          />

          {/* 4. Detailed Analysis — last */}
          <SectionCard
            title={t("sa.detail")}
            text={data.detailedAnalysis}
            accentColor="#3b82f6"
            delay={0.24}
          />
        </div>
      )}
    </motion.section>
  );
}
