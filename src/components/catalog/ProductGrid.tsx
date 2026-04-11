import { ProductCard } from "./ProductCard";
import type { ProductWithCategory } from "@/lib/services/product.service";

interface ProductGridProps {
  products: ProductWithCategory[];
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="glass rounded-lg overflow-hidden animate-skeleton"
        >
          <div className="aspect-[3/4] bg-muted" />
          <div className="p-4 space-y-3">
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-5 bg-muted rounded w-1/4" />
            </div>
            <div className="h-9 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
