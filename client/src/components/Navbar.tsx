import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useLang, LANGUAGES } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Flag, ChevronDown, Check } from "lucide-react";

export default function Navbar() {
  const { lang, setLanguage, t } = useLang();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => l.code === lang)!;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-md"
    >
      <div className="container max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="hidden sm:inline text-sm font-semibold text-foreground/80">
            FakeGuard AI
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            data-testid="link-home"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              location === "/"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {t("nav.home")}
          </Link>
          <Link
            href="/report"
            data-testid="link-report"
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              location === "/report"
                ? "bg-emerald-500/15 text-emerald-500"
                : "text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10"
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Report a Shop / Product</span>
            <span className="md:hidden">Report</span>
          </Link>
          <Link
            href="/about"
            data-testid="link-about"
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
              location === "/about"
                ? "bg-primary text-primary-foreground border-primary"
                : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            }`}
          >
            {t("nav.about")}
          </Link>
        </nav>

        {/* Language Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <motion.button
            data-testid="button-lang-toggle"
            onClick={() => setOpen((prev) => !prev)}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border text-sm font-semibold transition-all hover:border-primary/50 hover:bg-primary/5 select-none"
          >
            <span className="text-base leading-none">{currentLang.nativeLabel}</span>
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </motion.span>
          </motion.button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-44 rounded-2xl border border-border bg-background/95 backdrop-blur-md shadow-xl overflow-hidden z-50"
                style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}
              >
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    data-testid={`lang-option-${l.code}`}
                    onClick={() => { setLanguage(l.code); setOpen(false); }}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors text-left ${
                      lang === l.code
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="text-base leading-none w-6 text-center">{l.nativeLabel.slice(0, 2)}</span>
                      <span>{l.label}</span>
                    </span>
                    {lang === l.code && (
                      <Check className="w-3.5 h-3.5 shrink-0 text-primary" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}
