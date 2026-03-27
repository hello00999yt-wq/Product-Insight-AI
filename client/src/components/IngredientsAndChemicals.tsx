import { motion } from "framer-motion";
import { Beaker, Leaf, AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useProductIngredients, type Chemical } from "@/hooks/use-products";

/* ── Safety config ── */
const SAFETY_CONFIG = {
  Safe: {
    label: "Safe",
    icon: CheckCircle,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    bar: "bg-emerald-500",
    emoji: "✅",
  },
  Warning: {
    label: "Warning",
    icon: AlertTriangle,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/30",
    bar: "bg-amber-500",
    emoji: "⚠️",
  },
  Harmful: {
    label: "Harmful",
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/30",
    bar: "bg-red-500",
    emoji: "❌",
  },
} as const;

/* ── Skeleton row ── */
function SkeletonRow() {
  return (
    <div className="flex flex-col gap-1 p-4 rounded-xl bg-muted/30 border border-white/5 animate-pulse">
      <div className="flex justify-between mb-2">
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="h-4 w-10 bg-muted rounded" />
      </div>
      <div className="h-2 w-full bg-muted rounded-full" />
    </div>
  );
}

/* ── Ingredient row ── */
function IngredientRow({
  name,
  percentage,
  index,
}: {
  name: string;
  percentage: number;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="flex flex-col gap-2 p-4 rounded-xl bg-card border border-blue-500/20 hover:border-blue-500/40 transition-colors"
      data-testid={`ingredient-row-${index}`}
    >
      <div className="flex justify-between items-center">
        <span className="font-medium text-sm text-foreground">{name}</span>
        <span className="text-sm font-bold text-primary">{percentage}%</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ delay: index * 0.06 + 0.2, duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}

/* ── Chemical row ── */
function ChemicalRow({
  name,
  percentage,
  safety,
  index,
}: Chemical & { index: number }) {
  const cfg = SAFETY_CONFIG[safety];
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className={`flex flex-col gap-2 p-4 rounded-xl border ${cfg.bg} transition-colors`}
      data-testid={`chemical-row-${index}`}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${cfg.color} flex-shrink-0`} />
          <span className="font-medium text-sm text-foreground">{name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground">{percentage}%</span>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}
            data-testid={`chemical-safety-${index}`}
          >
            {cfg.emoji} {cfg.label}
          </span>
        </div>
      </div>
      <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${cfg.bar} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ delay: index * 0.06 + 0.2, duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}

/* ── Main export ── */
export function IngredientsAndChemicals({ productId }: { productId: number }) {
  const { data, isLoading, isError } = useProductIngredients(productId);

  if (isError) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8"
      data-testid="ingredients-chemicals-section"
    >
      {/* ── Ingredients Panel ── */}
      <div className="rounded-2xl border border-blue-500/30 bg-card/60 backdrop-blur-sm overflow-hidden"
        style={{ boxShadow: "0 0 20px rgba(59,130,246,0.08)" }}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-blue-500/20 bg-blue-500/5">
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center flex-shrink-0">
            <Leaf className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="font-bold text-foreground text-lg leading-tight">Ingredients Analysis</h2>
            <p className="text-xs text-muted-foreground">Composition breakdown by percentage</p>
          </div>
          {isLoading && <Loader2 className="w-4 h-4 text-muted-foreground animate-spin ml-auto" />}
        </div>

        <div className="p-5 space-y-3">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            : data?.ingredients.map((ing, i) => (
                <IngredientRow key={ing.name} {...ing} index={i} />
              ))}
        </div>
      </div>

      {/* ── Chemicals Panel ── */}
      <div className="rounded-2xl border border-violet-500/30 bg-card/60 backdrop-blur-sm overflow-hidden"
        style={{ boxShadow: "0 0 20px rgba(139,92,246,0.08)" }}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-violet-500/20 bg-violet-500/5">
          <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center flex-shrink-0">
            <Beaker className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="font-bold text-foreground text-lg leading-tight">Chemical Detection</h2>
            <p className="text-xs text-muted-foreground">Safety classification per compound</p>
          </div>
          {isLoading && <Loader2 className="w-4 h-4 text-muted-foreground animate-spin ml-auto" />}
        </div>

        <div className="p-5 space-y-3">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            : data?.chemicals.map((chem, i) => (
                <ChemicalRow key={chem.name} {...chem} index={i} />
              ))}
        </div>

        {!isLoading && data && (
          <div className="px-5 pb-5">
            <div className="flex items-center justify-center gap-6 p-3 rounded-xl bg-muted/30 border border-white/5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Safe</span>
              <span className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Warning</span>
              <span className="flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5 text-red-400" /> Harmful</span>
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}
