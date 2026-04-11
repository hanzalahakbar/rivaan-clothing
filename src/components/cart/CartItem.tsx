"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/lib/utils";
import type { CartItemWithProduct } from "@/lib/services/cart.service";

interface CartItemProps {
  item: CartItemWithProduct;
}

const PLACEHOLDER_IMAGE = "/placeholder-product.svg";

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);

  const lineTotal = item.product.price * item.quantity;

  const handleIncrement = async () => {
    setIsUpdating(true);
    await updateQuantity(item.productId, item.quantity + 1);
    setIsUpdating(false);
  };

  const handleDecrement = async () => {
    setIsUpdating(true);
    if (item.quantity === 1) {
      await removeItem(item.productId, item.product.name);
    } else {
      await updateQuantity(item.productId, item.quantity - 1);
    }
    setIsUpdating(false);
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    await removeItem(item.productId, item.product.name);
  };

  return (
    <div className="flex gap-4 p-4 bg-card rounded-lg border border-border">
      {/* Product Image */}
      <Link
        href={`/catalog/${item.product.slug}`}
        className="relative w-24 h-32 flex-shrink-0 rounded-md overflow-hidden bg-muted"
      >
        <Image
          src={item.product.image_url || PLACEHOLDER_IMAGE}
          alt={item.product.name}
          fill
          sizes="96px"
          className="object-cover transition-transform hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = PLACEHOLDER_IMAGE;
          }}
        />
      </Link>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-4">
          <div>
            <Link
              href={`/catalog/${item.product.slug}`}
              className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1"
            >
              {item.product.name}
            </Link>

            {item.product.categories && (
              <p className="text-xs text-muted-foreground mt-1">
                {item.product.categories.name}
              </p>
            )}

            <p className="text-sm font-medium text-primary mt-2">
              {formatCurrency(item.product.price)}
            </p>
          </div>

          {/* Line Total */}
          <div className="text-right flex-shrink-0">
            <p className="font-semibold text-foreground">
              {formatCurrency(lineTotal)}
            </p>
            {item.quantity > 1 && (
              <p className="text-xs text-muted-foreground mt-1">
                {item.quantity} items
              </p>
            )}
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center border border-border rounded-full overflow-hidden">
            <button
              onClick={handleDecrement}
              disabled={isUpdating}
              className="p-2 hover:bg-muted transition-colors disabled:opacity-50"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center text-sm font-medium">
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                item.quantity
              )}
            </span>
            <button
              onClick={handleIncrement}
              disabled={isUpdating}
              className="p-2 hover:bg-muted transition-colors disabled:opacity-50"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isUpdating}
            className="text-muted-foreground hover:text-destructive"
            aria-label="Remove item"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
