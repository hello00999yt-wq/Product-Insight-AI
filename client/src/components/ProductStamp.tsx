import { motion } from "framer-motion";

interface ProductStampProps {
  fakeRiskLevel: string;
}

export function ProductStamp({ fakeRiskLevel }: ProductStampProps) {
  const level = fakeRiskLevel.toLowerCase();

  if (level === "medium") return null;

  const isFake    = level === "high";
  const label     = isFake ? "FAKE\nPRODUCT" : "GENUINE\nPRODUCT";
  const color     = isFake ? "#ef4444" : "#22c55e";
  const shadow    = isFake
    ? "0 0 20px rgba(239,68,68,0.35)"
    : "0 0 20px rgba(34,197,94,0.35)";
  const rotation  = isFake ? "-14deg" : "-12deg";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.4 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.25 }}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -50%) rotate(${rotation})`,
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      {/* Outer ring */}
      <div
        style={{
          border: `3px solid ${color}`,
          borderRadius: "8px",
          padding: "3px",
          boxShadow: shadow,
        }}
      >
        {/* Inner content */}
        <div
          style={{
            border: `2px solid ${color}`,
            borderRadius: "5px",
            padding: "10px 20px",
            background: isFake
              ? "rgba(239,68,68,0.12)"
              : "rgba(34,197,94,0.12)",
            backdropFilter: "blur(2px)",
            textAlign: "center",
            minWidth: "120px",
          }}
        >
          {/* Top bar */}
          <div
            style={{
              height: "2px",
              background: color,
              borderRadius: "2px",
              marginBottom: "8px",
              opacity: 0.7,
            }}
          />

          {/* Label */}
          <div
            style={{
              color,
              fontSize: "18px",
              fontWeight: 900,
              letterSpacing: "0.15em",
              lineHeight: 1.15,
              fontFamily: "'Arial Black', 'Impact', sans-serif",
              textTransform: "uppercase",
              whiteSpace: "pre-line",
              textShadow: `0 0 12px ${color}99`,
              userSelect: "none",
            }}
          >
            {label}
          </div>

          {/* Bottom bar */}
          <div
            style={{
              height: "2px",
              background: color,
              borderRadius: "2px",
              marginTop: "8px",
              opacity: 0.7,
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
