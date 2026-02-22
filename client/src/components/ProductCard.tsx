import { Product } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

export function ProductCard({ product }: { product: Product }) {
  const isHighRisk = product.fakeRiskLevel.toLowerCase() === 'high';
  
  return (
    <Link href={`/product/${product.id}`} className="block group">
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
        <div className="aspect-[4/3] overflow-hidden bg-muted">
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 right-3">
            <Badge variant={isHighRisk ? "destructive" : "secondary"} className="shadow-sm">
              {product.fakeRiskLevel} Risk
            </Badge>
          </div>
        </div>
        
        <div className="p-5">
          <p className="text-sm font-medium text-muted-foreground mb-1">{product.brand}</p>
          <h3 className="text-lg font-bold text-foreground line-clamp-1 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-muted-foreground">{new Date(product.createdAt).toLocaleDateString()}</span>
            <div className="flex items-center text-primary text-sm font-medium">
              View Details <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
