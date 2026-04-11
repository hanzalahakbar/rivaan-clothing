"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Camera } from "lucide-react";
import { Button } from "@/components/ui";
import { createTryOnJob } from "@/lib/services/tryon.service";
import { getUserPhoto } from "@/lib/services/photo.service";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface TryOnButtonProps {
  productId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
  showIcon?: boolean;
}

export function TryOnButton({
  productId,
  variant = "default",
  size = "default",
  className,
  showIcon = true,
}: TryOnButtonProps) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTryOn = async () => {
    setError(null);

    // Check authentication
    if (!user) {
      router.push(`/signin?redirect=/catalog`);
      return;
    }

    setIsLoading(true);

    try {
      // Check if user has a photo
      const photo = await getUserPhoto();
      if (!photo) {
        router.push(`/upload?redirect=/tryon?product=${productId}`);
        return;
      }

      // Create the try-on job
      const job = await createTryOnJob(productId);

      // Navigate to try-on page with job ID
      router.push(`/tryon?job=${job.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start try-on");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Button variant={variant} size={size} disabled className={className}>
        <Loader2 className="w-4 h-4 animate-spin" />
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        variant={variant}
        size={size}
        onClick={handleTryOn}
        disabled={isLoading}
        className={cn("gap-2", className)}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : showIcon ? (
          <Sparkles className="w-4 h-4" />
        ) : null}
        {isLoading ? "Starting..." : "Try On"}
      </Button>

      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <Camera className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}
