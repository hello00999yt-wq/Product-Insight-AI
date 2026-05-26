import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, Loader2, CheckCircle2, ScanLine, QrCode, AlignLeft, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ImageUploaderProps {
  onImageSelected: (base64: string) => void;
  isAnalyzing: boolean;
}

const SCAN_STEPS = [
  { id: 1, icon: QrCode,      label: "Detecting QR Code",       sub: "Scanning for embedded QR data"          },
  { id: 2, icon: ScanLine,    label: "Scanning Barcode",         sub: "Looking for barcode strips"             },
  { id: 3, icon: AlignLeft,   label: "Reading Product Text",     sub: "Detecting ingredients & MRP text"       },
  { id: 4, icon: ShieldCheck, label: "AI Verification",          sub: "Confirming back side of product"        },
];

export function ImageUploader({ onImageSelected, isAnalyzing }: ImageUploaderProps) {
  const [preview, setPreview]           = useState<string | null>(null);
  const [stepsDone, setStepsDone]       = useState<number[]>([]);
  const [activeStep, setActiveStep]     = useState<number | null>(null);
  const [scanLineY, setScanLineY]       = useState(0);

  /* ── Animate scan line while analyzing ── */
  useEffect(() => {
    if (!isAnalyzing) return;
    let frame: number;
    let start: number | null = null;
    const duration = 1800;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const progress = ((ts - start) % duration) / duration;
      setScanLineY(Math.round(progress * 100));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isAnalyzing]);

  /* ── Step-by-step tick animation ── */
  useEffect(() => {
    if (!isAnalyzing) {
      setStepsDone([]);
      setActiveStep(null);
      return;
    }
    setStepsDone([]);
    setActiveStep(1);

    const timings = [0, 700, 1400, 2100];
    const timers = timings.map((delay, i) =>
      setTimeout(() => {
        setActiveStep(SCAN_STEPS[i].id);
        if (i > 0) setStepsDone((p) => [...p, SCAN_STEPS[i - 1].id]);
      }, delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [isAnalyzing]);

  const compressImage = (dataUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 1200;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
          else { width = Math.round((width * MAX) / height); height = MAX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width || 800;
        canvas.height = height || 600;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const jpeg = canvas.toDataURL("image/jpeg", 0.85);
        if (jpeg === "data:,") reject(new Error("Canvas export failed"));
        else resolve(jpeg);
      };
      img.onerror = () => reject(new Error("Image load failed"));
      img.src = dataUrl;
    });
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const raw = reader.result as string;
        try {
          const compressed = await compressImage(raw);
          setPreview(compressed);
          onImageSelected(compressed);
        } catch {
          setPreview(raw);
          onImageSelected(raw);
        }
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
    disabled: isAnalyzing,
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {/* ── Dropzone (no preview yet) ── */}
        {!preview ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            {...getRootProps()}
            className={cn(
              "relative group cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed border-blue-500/50 bg-background p-12 text-center transition-all duration-300 hover:border-blue-400 hover:bg-blue-500/5",
              isDragActive && "border-blue-400 bg-blue-500/10 scale-[1.02]",
              isAnalyzing && "pointer-events-none opacity-50"
            )}
            style={{ boxShadow: isDragActive ? "0 0 30px rgba(59,130,246,0.3)" : "0 0 20px rgba(59,130,246,0.12)" }}
          >
            <input {...getInputProps()} />
            <div className="relative z-10 flex flex-col items-center justify-center gap-4">
              <div className="rounded-full bg-primary/10 p-4 ring-1 ring-primary/20 group-hover:scale-110 transition-transform duration-300">
                <UploadCloud className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  {isDragActive ? "Drop it here!" : "Upload Product Image"}
                </h3>
                <p className="mt-2 text-muted-foreground text-sm max-w-xs mx-auto">
                  Please upload the back side image of the product where QR code, barcode, or product details are visible.
                </p>
              </div>
            </div>
            <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
          </motion.div>
        ) : (
          /* ── Preview + scanning overlay ── */
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-3xl border bg-card shadow-2xl ring-1 ring-black/5"
          >
            {/* Image */}
            <div className="aspect-video w-full bg-black/5 relative overflow-hidden">
              <img
                src={preview}
                alt="Preview"
                className="h-full w-full object-contain mx-auto"
              />

              {/* ── Scanning overlay ── */}
              <AnimatePresence>
                {isAnalyzing && (
                  <motion.div
                    key="scan-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0"
                    style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" }}
                  >
                    {/* Corner brackets */}
                    {[
                      "top-4 left-4 border-t-2 border-l-2 rounded-tl-lg",
                      "top-4 right-4 border-t-2 border-r-2 rounded-tr-lg",
                      "bottom-4 left-4 border-b-2 border-l-2 rounded-bl-lg",
                      "bottom-4 right-4 border-b-2 border-r-2 rounded-br-lg",
                    ].map((cls, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.07 }}
                        className={`absolute w-7 h-7 ${cls}`}
                        style={{ borderColor: "#00ff88" }}
                      />
                    ))}

                    {/* Animated scan line */}
                    <motion.div
                      className="absolute left-0 right-0 h-0.5 pointer-events-none"
                      style={{
                        top: `${scanLineY}%`,
                        background: "linear-gradient(90deg, transparent, #00ff88, #00ff88, transparent)",
                        boxShadow: "0 0 12px 3px rgba(0,255,136,0.5)",
                      }}
                    />

                    {/* Grid dots overlay */}
                    <div
                      className="absolute inset-0 opacity-10"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle, #00ff88 1px, transparent 1px)",
                        backgroundSize: "28px 28px",
                      }}
                    />

                    {/* Centre pill */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <motion.div
                        animate={{ scale: [1, 1.08, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                        className="flex items-center gap-2.5 px-5 py-2.5 rounded-full"
                        style={{
                          background: "rgba(0,0,0,0.7)",
                          border: "1px solid rgba(0,255,136,0.5)",
                          boxShadow: "0 0 24px rgba(0,255,136,0.25)",
                        }}
                      >
                        <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#00ff88" }} />
                        <span className="text-sm font-bold" style={{ color: "#00ff88" }}>
                          Smart Verification Active
                        </span>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Step tracker panel ── */}
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="px-5 py-4"
                  style={{
                    background: "linear-gradient(135deg, #060d0a, #091209)",
                    borderTop: "1px solid rgba(0,255,136,0.2)",
                  }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ background: "#00ff88" }}
                      />
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#00ff88" }}>
                        AI-Powered Image Verification
                      </span>
                    </div>
                    <span className="text-xs" style={{ color: "#444" }}>
                      Back-side check in progress…
                    </span>
                  </div>

                  {/* Steps */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SCAN_STEPS.map((step) => {
                      const done   = stepsDone.includes(step.id);
                      const active = activeStep === step.id && !done;
                      const Icon   = step.icon;

                      return (
                        <motion.div
                          key={step.id}
                          initial={{ opacity: 0.3, scale: 0.95 }}
                          animate={{
                            opacity: done || active ? 1 : 0.4,
                            scale: active ? 1.02 : 1,
                          }}
                          transition={{ duration: 0.3 }}
                          className="flex flex-col gap-1.5 p-3 rounded-xl"
                          style={{
                            background: done
                              ? "rgba(0,255,136,0.1)"
                              : active
                              ? "rgba(0,255,136,0.06)"
                              : "rgba(255,255,255,0.02)",
                            border: `1px solid ${
                              done
                                ? "rgba(0,255,136,0.4)"
                                : active
                                ? "rgba(0,255,136,0.25)"
                                : "rgba(255,255,255,0.05)"
                            }`,
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <Icon
                              className="w-4 h-4"
                              style={{
                                color: done ? "#00ff88" : active ? "#00cc6a" : "#444",
                              }}
                            />
                            {done ? (
                              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#00ff88" }} />
                            ) : active ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: "#00cc6a" }} />
                            ) : null}
                          </div>
                          <p
                            className="text-xs font-semibold leading-tight"
                            style={{ color: done ? "#00ff88" : active ? "#ccc" : "#555" }}
                          >
                            {step.label}
                          </p>
                          <p className="text-xs leading-tight" style={{ color: "#444" }}>
                            {step.sub}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Change image button (when not analyzing) */}
            {!isAnalyzing && (
              <div className="absolute top-4 right-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreview(null);
                  }}
                  className="bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md transition-colors"
                >
                  Change Image
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
