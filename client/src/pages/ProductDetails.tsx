import { useRoute, Link } from "wouter";
import { useProduct } from "@/hooks/use-products";
import { Loader2, ArrowLeft, Star, Share2, Info } from "lucide-react";
import { RiskBadge } from "@/components/RiskBadge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ProductDetails() {
  const [, params] = useRoute("/product/:id");
  const id = params ? parseInt(params.id) : 0;
  const { data: product, isLoading, error } = useProduct(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground animate-pulse">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
        <p className="text-muted-foreground mb-6">We couldn't retrieve the details for this product.</p>
        <Link href="/">
          <Button>Return Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Navigation */}
      <div className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div className="font-semibold text-sm hidden md:block">
            {product.name}
          </div>
          <Button variant="ghost" size="icon">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <main className="container max-w-5xl mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12"
        >
          {/* Left Column - Image */}
          <div className="space-y-6">
            <div className="aspect-square rounded-3xl overflow-hidden bg-white border shadow-sm relative">
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-full h-full object-contain p-8"
              />
              <div className="absolute top-4 left-4">
                <RiskBadge level={product.fakeRiskLevel} className="bg-white/90 backdrop-blur" />
              </div>
            </div>
            
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-card border shadow-sm">
                <p className="text-sm text-muted-foreground mb-1">MRP</p>
                <p className="text-xl font-bold text-foreground">{product.mrp}</p>
              </div>
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-sm text-primary/80 mb-1">Market Price</p>
                <p className="text-xl font-bold text-primary">{product.marketPrice}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-semibold tracking-wider text-primary uppercase bg-primary/10 px-3 py-1 rounded-full">
                  {product.brand}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 leading-tight">
                {product.name}
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {product.description}
              </p>
            </div>

            <Separator />

            {/* Authenticity Check */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold">Authenticity Check</h3>
              </div>
              
              <div className="space-y-3">
                {product.identificationTips.map((tip, index) => (
                  <div key={index} className="flex gap-4 p-4 rounded-xl bg-muted/50 border border-border/50">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <p className="text-sm md:text-base">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Customer Reviews (Dummy) */}
            <div>
              <h3 className="text-xl font-bold mb-6">Community Reviews</h3>
              <div className="space-y-6">
                <Review 
                  name="Alex Morgan" 
                  rating={5} 
                  date="2 days ago"
                  text="Scan was super accurate! I was worried about buying this online but the tips helped me verify it was real."
                />
                <Review 
                  name="Sarah Chen" 
                  rating={4} 
                  date="1 week ago"
                  text="Great app. Helped me spot a fake version of this product at a local store. The packaging font was slightly off just like the app said."
                />
              </div>
            </div>

          </div>
        </motion.div>
      </main>
    </div>
  );
}

function Review({ name, rating, date, text }: { name: string, rating: number, date: string, text: string }) {
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
