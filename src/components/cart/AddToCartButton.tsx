"use client";

import { useState } from "react";
import { ShoppingCart, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  size?: "default" | "sm" | "lg";
  className?: string;
  variant?: "default" | "outline" | "secondary";
}

export function AddToCartButton({
  productId,
  productName,
  size = "default",
  className,
  variant = "outline",
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = async () => {
    if (isAdding || justAdded) return;

    setIsAdding(true);
    await addItem(productId, productName);
    setIsAdding(false);
    setJustAdded(true);

    // Reset "added" state after animation
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <Button
      onClick={handleAddToCart}
      variant={justAdded ? "default" : variant}
      size={size}
      disabled={isAdding}
      className={cn("gap-2 transition-all", className)}
    >
      {isAdding ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Adding...
        </>
      ) : justAdded ? (
        <>
          <Check className="w-4 h-4" />
          Added to Cart
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </>
      )}
    </Button>
  );
}
