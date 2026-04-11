"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Loader2 } from "lucide-react";
import { CheckoutForm, OrderSummary } from "@/components/checkout";
import { useCart } from "@/contexts/CartContext";
import { Header, Footer } from "@/components/layout";
import {
  generateCheckoutUrl,
  type CheckoutData,
} from "@/lib/services/whatsapp.service";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, isLoading, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // FR-009: Redirect to cart if empty
  useEffect(() => {
    if (!isLoading && items.length === 0 && !isRedirecting) {
      router.push("/cart");
    }
  }, [items.length, isLoading, router, isRedirecting]);

  const handleSubmit = async (customerData: CheckoutData) => {
    setIsSubmitting(true);

    // Generate WhatsApp URL
    const whatsappUrl = generateCheckoutUrl({
      customer: customerData,
      items,
      total,
    });

    // Mark as redirecting to prevent empty cart redirect
    setIsRedirecting(true);

    // Clear the cart after successful order
    clearCart();

    // Redirect to WhatsApp
    window.location.href = whatsappUrl;
  };

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

  // Show loading while redirecting or if cart is empty (will redirect)
  if (items.length === 0) {
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-background">
        {/* Page Header */}
        <div className="bg-muted border-b border-border">
          <div className="container-fashion py-8 lg:py-12">
            <div className="flex items-center gap-4">
              <Link
                href="/cart"
                className="p-2 rounded-full hover:bg-background transition-colors"
                aria-label="Back to cart"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <p className="label-elegant text-primary mb-1">Order</p>
                <h1 className="text-2xl lg:text-3xl font-medium text-foreground flex items-center gap-3">
                  <ShoppingBag className="w-6 h-6" />
                  Checkout
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Content */}
        <div className="container-fashion py-8 lg:py-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Checkout Form */}
            <div>
              <div className="bg-card rounded-lg p-6 lg:p-8 border border-border">
                <h2 className="text-lg font-medium text-foreground mb-6">
                  Delivery Information
                </h2>
                <CheckoutForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="sticky top-32">
                <OrderSummary />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
