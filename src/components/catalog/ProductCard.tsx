"use client";

import Image from "next/image";
import Link from "next/link";
import { Sparkles, ShoppingBag, Heart } from "lucide-react";
import { Button } from "@/components/ui";
import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/lib/utils";
import type { ProductWithCategory } from "@/lib/services/product.service";

interface ProductCardProps {
  product: ProductWithCategory;
}

const PLACEHOLDER_IMAGE = "/placeholder-product.svg";

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const handleTryOn = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = `/tryon?product=${product.id}`;
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    await addItem(product.id, product.name);
  };

  return (
    <Link href={`/catalog/${product.slug}`} className="group block">
      <article className="bg-card rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer">
        {/* Product Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-muted image-overlay">
          <Image
            src={product.image_url || PLACEHOLDER_IMAGE}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = PLACEHOLDER_IMAGE;
            }}
          />

          {/* Category Badge */}
          {product.categories && (
            <span className="absolute top-3 left-3 px-3 py-1 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-background/90 text-foreground z-10">
              {product.categories.name}
            </span>
          )}

          {/* Quick Actions - Visible on Hover */}
          <div className="absolute inset-x-0 bottom-0 p-4 z-10 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <div className="flex gap-2">
              <Button
                onClick={handleAddToCart}
                size="sm"
                className="flex-1 gap-2 rounded-full bg-background text-foreground hover:bg-primary hover:text-primary-foreground"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </Button>
              <Button
                onClick={handleTryOn}
                size="sm"
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-4"
                aria-label="Virtual Try-On"
              >
                <Sparkles className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Wishlist Button */}
          <button
            className="absolute top-3 right-3 p-2 rounded-full bg-background/80 text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-primary hover:text-primary-foreground z-10"
            onClick={(e) => {
              e.preventDefault();
              // Future: Add to wishlist
            }}
            aria-label="Add to wishlist"
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-4 text-center">
          <h3 className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-base font-semibold text-primary mt-2">
            {formatCurrency(product.price)}
          </p>
        </div>
      </article>
    </Link>
  );
}
