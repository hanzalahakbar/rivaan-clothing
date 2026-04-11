"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";

interface CartIconProps {
  className?: string;
}

export function CartIcon({ className }: CartIconProps) {
  const { itemCount, isLoading } = useCart();

  return (
    <Link
      href="/cart"
      className={cn(
        "relative inline-flex items-center justify-center p-2 rounded-md hover:bg-muted transition-colors",
        className
      )}
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <ShoppingCart className="w-5 h-5" />
      {!isLoading && itemCount > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full bg-primary text-primary-foreground">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}
