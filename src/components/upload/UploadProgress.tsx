"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui";

interface UploadProgressProps {
  progress: number;
  onCancel?: () => void;
  status?: "uploading" | "success" | "error";
  errorMessage?: string;
}

export function UploadProgress({
  progress,
  onCancel,
  status = "uploading",
  errorMessage,
}: UploadProgressProps) {
  const isComplete = status === "success" || progress >= 100;
  const isError = status === "error";

  return (
    <div className="w-full space-y-2">
      {/* Progress bar */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 transition-all duration-300 rounded-full ${
            isError
              ? "bg-destructive"
              : isComplete
                ? "bg-green-500"
                : "bg-primary"
          }`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {/* Status text */}
      <div className="flex items-center justify-between text-sm">
        <span
          className={
            isError
              ? "text-destructive"
              : isComplete
                ? "text-green-500"
                : "text-muted-foreground"
          }
        >
          {isError
            ? errorMessage || "Upload failed"
            : isComplete
              ? "Upload complete!"
              : `Uploading... ${Math.round(progress)}%`}
        </span>

        {status === "uploading" && onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-6 px-2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
