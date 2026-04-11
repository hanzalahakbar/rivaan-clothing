"use client";

import Link from "next/link";
import { ShoppingBag, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { CartItem, CartSummary } from "@/components/cart";
import { Button } from "@/components/ui";
import { Header, Footer } from "@/components/layout";

export default function CartPage() {
  const { items, isLoading, itemCount } = useCart();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-background">
          <div className="container-fashion py-24">
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // FR-011: Empty cart state
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-background">
          <div className="container-fashion py-16 lg:py-24">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-muted-foreground" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-medium mb-3">
                Your cart is empty
              </h1>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Looks like you haven&apos;t added any items to your cart yet.
                Start shopping to fill it up!
              </p>
              <Link href="/catalog">
                <Button size="lg" className="rounded-full px-8 gap-2">
                  Start Shopping
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-background">
        {/* Page Header */}
        <div className="bg-muted border-b border-border">
          <div className="container-fashion py-8 lg:py-12">
            <div className="flex items-center gap-4">
              <Link
                href="/catalog"
                className="p-2 rounded-full hover:bg-background transition-colors"
                aria-label="Back to catalog"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <p className="label-elegant text-primary mb-1">Shopping</p>
                <h1 className="text-2xl lg:text-3xl font-medium text-foreground">
                  Your Cart
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Cart Content */}
        <div className="container-fashion py-8 lg:py-12">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium">
                  {itemCount} {itemCount === 1 ? "Item" : "Items"}
                </h2>
                <Link
                  href="/catalog"
                  className="text-sm text-primary hover:text-primary/80 transition-colors link-underline"
                >
                  Continue Shopping
                </Link>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-32">
                <CartSummary />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
