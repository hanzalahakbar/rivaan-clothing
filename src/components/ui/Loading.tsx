"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingProps {
  size?: "sm" | "default" | "lg";
  text?: string;
  className?: string;
}

export function Loading({ size = "default", text, className }: LoadingProps) {
  const sizes = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        className
      )}
      role="status"
      aria-label={text || "Loading"}
    >
      <Loader2
        className={cn("animate-spin text-primary", sizes[size])}
        aria-hidden="true"
      />
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
      <span className="sr-only">{text || "Loading..."}</span>
    </div>
  );
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-skeleton rounded-md bg-muted",
        className
      )}
      aria-hidden="true"
    />
  );
}

interface PageLoadingProps {
  text?: string;
}

export function PageLoading({ text = "Loading..." }: PageLoadingProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Loading size="lg" text={text} />
    </div>
  );
}

interface ButtonLoadingProps {
  className?: string;
}

export function ButtonLoading({ className }: ButtonLoadingProps) {
  return (
    <Loader2
      className={cn("h-4 w-4 animate-spin", className)}
      aria-hidden="true"
    />
  );
}
