"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/lib/utils";

const PLACEHOLDER_IMAGE = "/placeholder-product.svg";

export function OrderSummary() {
  const { items, total, itemCount } = useCart();

  return (
    <div className="glass rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Order Summary</h2>
        <Link
          href="/cart"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="w-3 h-3" />
          Edit Cart
        </Link>
      </div>

      {/* Item List */}
      <div className="divide-y divide-border">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
            {/* Image */}
            <div className="relative w-14 h-16 flex-shrink-0 rounded overflow-hidden bg-muted">
              <Image
                src={item.product.image_url || PLACEHOLDER_IMAGE}
                alt={item.product.name}
                fill
                sizes="56px"
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = PLACEHOLDER_IMAGE;
                }}
              />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground line-clamp-1">
                {item.product.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Qty: {item.quantity} x {formatCurrency(item.product.price)}
              </p>
            </div>

            {/* Line Total */}
            <div className="text-sm font-medium text-foreground">
              {formatCurrency(item.product.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t border-border pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
          </span>
          <span className="font-medium text-foreground">
            {formatCurrency(total)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span className="text-muted-foreground">Calculated separately</span>
        </div>
        <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
