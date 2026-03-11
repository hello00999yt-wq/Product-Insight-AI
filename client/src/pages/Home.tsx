import { useState } from "react";
import { useLocation } from "wouter";
import { ImageUploader } from "@/components/ImageUploader";
import { ProductCard } from "@/components/ProductCard";
import { useProducts, useAnalyzeProduct } from "@/hooks/use-products";
import { Scan, ShieldCheck, Zap, History, User } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: history, isLoading: isHistoryLoading } = useProducts();
  const { mutate: analyze, isPending: isAnalyzing } = useAnalyzeProduct();
  const [error, setError] = useState<string | null>(null);

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
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Hero Background Image */}
      <div 
        className="absolute top-0 left-0 w-full h-[600px] z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2070&auto=format&fit=crop')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          maskImage: 'linear-gradient(to bottom, black, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)'
        }}
      />
      {/* Decorative background elements */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none opacity-50" />
      <div className="absolute top-40 -right-40 w-96 h-96 bg-accent/20 rounded-full blur-[128px] pointer-events-none opacity-50" />

      <main className="container max-w-6xl mx-auto px-4 py-12 lg:py-20 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
              <Zap className="w-4 h-4 fill-primary" />
              <span>AI-Powered Transparency</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              Identify <span className="text-gradient">Real vs Fake</span> Products Instantly
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
              Upload a photo of any product to get instant details, price comparisons, and AI-driven authenticity checks.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/about" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
                <User className="w-5 h-5" />
                About Me
              </Link>
            </div>
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
            title="Instant Recognition" 
            description="Our AI instantly identifies brand, model, and variant from a single photo." 
          />
          <FeatureCard 
            icon={ShieldCheck} 
            title="Fake Detection" 
            description="Advanced algorithms analyze visual cues to estimate the risk of a counterfeit product." 
          />
          <FeatureCard 
            icon={Zap} 
            title="Price Check" 
            description="Compare MRP with real market rates to ensure you're paying a fair price." 
          />
        </section>

        {/* Recent Scans */}
        <section>
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-primary/10 p-2 rounded-lg">
              <History className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Recent Scans</h2>
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
              <p className="text-muted-foreground">No recent scans yet. Upload your first product!</p>
            </div>
          )}
        </section>

      </main>
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
