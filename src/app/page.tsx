import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Truck, RefreshCw, Shield } from "lucide-react";
import { getProducts } from "@/lib/services/product.service";
import { Button } from "@/components/ui";
import { Header, Footer } from "@/components/layout";
import { ProductCard } from "@/components/catalog";

export default async function HomePage() {
  // Fetch featured products (latest 4)
  const { products: featuredProducts } = await getProducts({ limit: 4 });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative">
          <div className="grid lg:grid-cols-2 min-h-[90vh]">
            {/* Left - Content */}
            <div className="flex items-center px-6 lg:px-16 py-20 lg:py-0 bg-background">
              <div className="max-w-xl">
                <p className="text-sm font-medium text-primary mb-4 tracking-wider uppercase">
                  New Collection 2026
                </p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.1] tracking-tight mb-6">
                  Fashion That
                  <br />
                  <span className="text-primary">Fits You</span>
                </h1>
                <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                  Discover beautiful clothing for girls. Shop our latest collection
                  of stylish eastern wear.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/catalog">
                    <Button size="lg" className="rounded-full px-8 gap-2 h-12 text-base">
                      Shop Now
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right - Image */}
            <div className="relative h-[50vh] lg:h-auto">
              <Image
                src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop"
                alt="Eastern Fashion Collection"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent lg:block hidden" />
            </div>
          </div>
        </section>

        {/* Features Bar */}
        <section className="border-y border-border bg-card">
          <div className="container-fashion py-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Truck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Free Delivery</p>
                  <p className="text-xs text-muted-foreground">On orders above PKR 3,000</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Easy Returns</p>
                  <p className="text-xs text-muted-foreground">7-day return policy</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Secure Payment</p>
                  <p className="text-xs text-muted-foreground">Cash on Delivery</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-20 lg:py-28">
          <div className="container-fashion">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
              <div>
                <p className="text-sm font-medium text-primary mb-2 tracking-wider uppercase">
                  Featured
                </p>
                <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight">
                  New Arrivals
                </h2>
              </div>
              <Link href="/catalog">
                <Button variant="ghost" className="gap-2 -mr-4">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {featuredProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-muted/50 rounded-2xl">
                <p className="text-muted-foreground mb-4">
                  Products coming soon!
                </p>
                <Link href="/catalog">
                  <Button variant="outline" className="rounded-full px-8">
                    Browse Catalog
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 lg:py-28">
          <div className="container-fashion">
            <div className="bg-primary rounded-3xl px-8 py-16 lg:py-20 text-center text-primary-foreground">
              <h2 className="text-3xl lg:text-4xl font-semibold mb-4">
                Ready to Shop?
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">
                Discover our latest collection and find your perfect outfit today.
              </p>
              <Link href="/catalog">
                <Button
                  size="lg"
                  variant="secondary"
                  className="rounded-full px-8 h-12 bg-background text-foreground hover:bg-background/90"
                >
                  Shop Collection
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
