import { Link, useLocation } from "wouter";
import { useLang } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { ShieldCheck, Languages } from "lucide-react";

export default function Navbar() {
  const { lang, toggleLang, t } = useLang();
  const [location] = useLocation();

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
            href="/about"
            data-testid="link-about"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              location === "/about"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {t("nav.about")}
          </Link>
        </nav>

        {/* Language Toggle */}
        <motion.button
          data-testid="button-lang-toggle"
          onClick={toggleLang}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border text-sm font-semibold transition-all hover:border-primary/50 hover:bg-primary/5"
        >
          <Languages className="w-4 h-4 text-primary" />
          <span className="text-foreground">
            {lang === "en" ? "हिंदी" : "English"}
          </span>
        </motion.button>
      </div>
    </motion.header>
  );
}
