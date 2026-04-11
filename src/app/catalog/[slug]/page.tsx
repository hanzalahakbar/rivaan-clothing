import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Tag, Truck, RefreshCw, Shield } from "lucide-react";
import { getProductBySlug } from "@/lib/services/product.service";
import { TryOnButton } from "@/components/tryon";
import { AddToCartButton } from "@/components/cart";
import { Header, Footer } from "@/components/layout";
import { formatCurrency } from "@/lib/utils";

interface ProductDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const PLACEHOLDER_IMAGE = "/placeholder-product.svg";

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: product.name,
    description: product.description || `Shop ${product.name} and try it on virtually.`,
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-background">
        {/* Breadcrumb */}
        <div className="bg-muted border-b border-border">
          <div className="container-fashion py-4">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Collection
            </Link>
          </div>
        </div>

        {/* Product Content */}
        <div className="container-fashion py-8 lg:py-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Product Image */}
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
              <Image
                src={product.image_url || PLACEHOLDER_IMAGE}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = PLACEHOLDER_IMAGE;
                }}
              />
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              {/* Category Badge */}
              {product.categories && (
                <Link
                  href={`/catalog?category=${product.categories.id}`}
                  className="inline-flex items-center gap-1.5 text-xs tracking-wider uppercase text-primary hover:text-primary/80 transition-colors mb-4 w-fit"
                >
                  <Tag className="w-3.5 h-3.5" />
                  {product.categories.name}
                </Link>
              )}

              {/* Name */}
              <h1 className="text-3xl lg:text-4xl font-medium tracking-tight text-foreground">
                {product.name}
              </h1>

              {/* Price */}
              <p className="mt-4 text-2xl lg:text-3xl font-medium text-primary">
                {formatCurrency(product.price)}
              </p>

              {/* Description */}
              {product.description && (
                <div className="mt-8">
                  <h2 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground mb-3">
                    Description
                  </h2>
                  <p className="text-foreground/80 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="mt-8 space-y-4">
                <div className="flex gap-3">
                  <AddToCartButton
                    productId={product.id}
                    productName={product.name}
                    size="lg"
                    className="flex-1 rounded-full"
                  />
                  <TryOnButton
                    productId={product.id}
                    size="lg"
                    className="flex-1 rounded-full"
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  See how this looks on you with our AI-powered virtual try-on
                </p>
              </div>

              {/* Features */}
              <div className="mt-8 pt-8 border-t border-border">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <Truck className="w-5 h-5 mx-auto text-primary mb-2" />
                    <p className="text-xs text-muted-foreground">Free Delivery</p>
                  </div>
                  <div className="text-center">
                    <RefreshCw className="w-5 h-5 mx-auto text-primary mb-2" />
                    <p className="text-xs text-muted-foreground">Easy Returns</p>
                  </div>
                  <div className="text-center">
                    <Shield className="w-5 h-5 mx-auto text-primary mb-2" />
                    <p className="text-xs text-muted-foreground">COD Available</p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-auto pt-8">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>SKU: {product.id.slice(0, 8).toUpperCase()}</span>
                  <span className="text-success font-medium">In Stock</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
