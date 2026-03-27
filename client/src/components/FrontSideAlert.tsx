import { motion } from "framer-motion";
import { X, ScanLine, FlipHorizontal, QrCode, AlignLeft, Package } from "lucide-react";

interface FrontSideAlertProps {
  onDismiss: () => void;
  onTryAgain: () => void;
}

export function FrontSideAlert({ onDismiss, onTryAgain }: FrontSideAlertProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className="relative max-w-lg mx-auto mt-6 rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1a0f00 0%, #1f1200 60%, #180d00 100%)",
        border: "1.5px solid rgba(251,146,60,0.45)",
        boxShadow:
          "0 0 0 1px rgba(251,146,60,0.12), 0 8px 40px rgba(251,146,60,0.18), inset 0 1px 0 rgba(251,146,60,0.1)",
      }}
    >
      {/* Glow orb top-left */}
      <div
        className="absolute -top-12 -left-12 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(251,146,60,0.15) 0%, transparent 70%)" }}
      />

      {/* Dismiss button */}
      <button
        data-testid="button-dismiss-front-alert"
        onClick={onDismiss}
        className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
        style={{ background: "rgba(251,146,60,0.12)", color: "#fb923c" }}
        onMouseOver={(e) => { (e.currentTarget).style.background = "rgba(251,146,60,0.24)"; }}
        onMouseOut={(e)  => { (e.currentTarget).style.background = "rgba(251,146,60,0.12)"; }}
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <div className="p-6">
        {/* Header row */}
        <div className="flex items-start gap-4 mb-5">
          {/* Animated icon bubble */}
          <motion.div
            animate={{ rotate: [0, -8, 8, -4, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 3 }}
            className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(251,146,60,0.2), rgba(251,146,60,0.08))",
              border: "1.5px solid rgba(251,146,60,0.35)",
              boxShadow: "0 0 20px rgba(251,146,60,0.15)",
            }}
          >
            <FlipHorizontal className="w-7 h-7" style={{ color: "#fb923c" }} />
          </motion.div>

          <div>
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2"
              style={{
                background: "rgba(251,146,60,0.15)",
                border: "1px solid rgba(251,146,60,0.3)",
                color: "#fb923c",
              }}
            >
              <ScanLine className="w-3 h-3" />
              Image Verification
            </div>
            <h3 className="font-extrabold text-white text-base leading-snug">
              Wrong side detected
            </h3>
          </div>
        </div>

        {/* English message */}
        <div
          className="rounded-xl p-4 mb-3"
          style={{
            background: "rgba(251,146,60,0.07)",
            border: "1px solid rgba(251,146,60,0.2)",
          }}
        >
          <p className="text-sm font-semibold text-white leading-relaxed mb-1">
            🇬🇧 English
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "#fcd9b0" }}>
            Please upload the <strong style={{ color: "#fb923c" }}>back side</strong> of
            the product where the{" "}
            <strong style={{ color: "#fb923c" }}>QR code, barcode</strong>, or product
            details are visible.
          </p>
        </div>

        {/* Hindi message */}
        <div
          className="rounded-xl p-4 mb-5"
          style={{
            background: "rgba(251,146,60,0.05)",
            border: "1px solid rgba(251,146,60,0.15)",
          }}
        >
          <p className="text-sm font-semibold text-white leading-relaxed mb-1">
            🇮🇳 हिंदी
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "#fcd9b0" }}>
            कृपया प्रोडक्ट के{" "}
            <strong style={{ color: "#fb923c" }}>पीछे की फोटो</strong> अपलोड करें, जहाँ{" "}
            <strong style={{ color: "#fb923c" }}>QR code, barcode</strong> या प्रोडक्ट
            की जानकारी लिखी हो। तभी सिस्टम सही तरीके से प्रोडक्ट की जांच कर पाएगा।
          </p>
        </div>

        {/* Visual guide — what back side looks like */}
        <div
          className="rounded-xl p-4 mb-5"
          style={{
            background: "rgba(0,0,0,0.25)",
            border: "1px dashed rgba(251,146,60,0.3)",
          }}
        >
          <p className="text-xs font-semibold mb-3" style={{ color: "#fb923c" }}>
            ✓  Back side should contain:
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: QrCode,    label: "QR Code"    },
              { icon: ScanLine,  label: "Barcode"    },
              { icon: AlignLeft, label: "Product Info" },
              { icon: Package,   label: "Ingredients" },
              { icon: AlignLeft, label: "MRP / Batch" },
              { icon: Package,   label: "Mfg. Details" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5 p-2 rounded-lg"
                style={{ background: "rgba(251,146,60,0.08)" }}
              >
                <Icon className="w-4 h-4" style={{ color: "#fb923c" }} />
                <span className="text-xs text-center leading-tight" style={{ color: "#fcd9b0" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <motion.button
            data-testid="button-try-again-front"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onTryAgain}
            className="flex-1 py-3 rounded-xl font-bold text-sm"
            style={{
              background: "linear-gradient(135deg, #fb923c, #f97316)",
              color: "#000",
              boxShadow: "0 0 20px rgba(251,146,60,0.35)",
            }}
          >
            Upload Back Side
          </motion.button>
          <button
            data-testid="button-dismiss-front-alt"
            onClick={onDismiss}
            className="px-5 py-3 rounded-xl font-medium text-sm transition-colors"
            style={{
              background: "rgba(251,146,60,0.1)",
              border: "1px solid rgba(251,146,60,0.25)",
              color: "#fb923c",
            }}
            onMouseOver={(e) => { (e.currentTarget).style.background = "rgba(251,146,60,0.18)"; }}
            onMouseOut={(e)  => { (e.currentTarget).style.background = "rgba(251,146,60,0.1)"; }}
          >
            Dismiss
          </button>
        </div>
      </div>
    </motion.div>
  );
}
