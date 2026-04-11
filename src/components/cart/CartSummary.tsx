"use client";

import Link from "next/link";
import { ArrowRight, Truck, Shield } from "lucide-react";
import { Button } from "@/components/ui";
import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/lib/utils";

export function CartSummary() {
  const { total, itemCount } = useCart();

  return (
    <div className="bg-card rounded-lg border border-border p-6 space-y-6">
      <h2 className="text-lg font-medium text-foreground">Order Summary</h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
          </span>
          <span className="font-medium text-foreground">
            {formatCurrency(total)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span className="text-muted-foreground">Calculated at checkout</span>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span className="text-primary">{formatCurrency(total)}</span>
        </div>
      </div>

      <Link href="/checkout" className="block">
        <Button className="w-full gap-2 rounded-full" size="lg">
          Proceed to Checkout
          <ArrowRight className="w-4 h-4" />
        </Button>
      </Link>

      {/* Trust Badges */}
      <div className="pt-4 border-t border-border">
        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Truck className="w-4 h-4" />
            <span>Free Delivery</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4" />
            <span>COD Available</span>
          </div>
        </div>
      </div>
    </div>
  );
}
