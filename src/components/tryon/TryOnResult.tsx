"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, Share2, ShoppingCart, RefreshCw, Loader2 } from "lucide-react";
import { Button, useToast } from "@/components/ui";
import { downloadImage } from "@/lib/services/download.service";
import { formatCurrency } from "@/lib/utils";
import type { GenerationJobWithDetails } from "@/lib/services/tryon.service";
import type { Product } from "@/types";

interface TryOnResultProps {
  job: GenerationJobWithDetails;
  onTryAnother: () => void;
}

export function TryOnResult({ job, onTryAnother }: TryOnResultProps) {
  const product = job.products as Product | null;
  const resultUrl = job.result_image_url;
  const { success, error } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!resultUrl || isDownloading) return;

    setIsDownloading(true);
    const result = await downloadImage(resultUrl, {
      productName: product?.name,
      productSlug: product?.slug,
      jobId: job.id,
    });
    setIsDownloading(false);

    if (result.success) {
      success(`Downloaded ${result.filename}`);
    } else {
      error(result.error || "Download failed", {
        action: {
          label: "Try Again",
          onClick: handleDownload,
        },
      });
    }
  };

  const handleShare = async () => {
    if (!resultUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Virtual Try-On: ${product?.name}`,
          text: "Check out how this looks on me!",
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled share - not an error
        if ((err as Error).name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
    } else {
      // Fallback: copy link to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        success("Link copied to clipboard!");
      } catch {
        error("Failed to copy link");
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Result Image */}
      <div className="relative aspect-[3/4] max-w-lg mx-auto rounded-lg overflow-hidden bg-muted">
        {resultUrl ? (
          <Image
            src={resultUrl}
            alt={`Try-on result: ${product?.name || "clothing item"}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 512px"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            No result image
          </div>
        )}
      </div>

      {/* Product Info */}
      {product && (
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground">
            {product.name}
          </h2>
          <p className="text-lg text-primary font-medium mt-1">
            {formatCurrency(product.price)}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={onTryAnother} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Another
        </Button>

        <Button
          onClick={handleDownload}
          variant="outline"
          className="gap-2"
          disabled={isDownloading || !resultUrl}
        >
          {isDownloading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {isDownloading ? "Downloading..." : "Download"}
        </Button>

        <Button onClick={handleShare} variant="outline" className="gap-2">
          <Share2 className="w-4 h-4" />
          Share
        </Button>

        {product && (
          <Link href={`/catalog/${product.slug}`}>
            <Button className="gap-2">
              <ShoppingCart className="w-4 h-4" />
              View Product
            </Button>
          </Link>
        )}
      </div>

      {/* Comparison View */}
      {product && (
        <div className="pt-6 border-t border-border">
          <h3 className="text-sm font-medium text-muted-foreground text-center mb-4">
            Original Product
          </h3>
          <div className="flex justify-center">
            <div className="relative w-32 h-40 rounded-lg overflow-hidden bg-muted">
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
