"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Loader2, Sparkles, AlertCircle, RefreshCw, Clock, WifiOff } from "lucide-react";
import { Button } from "@/components/ui";
import { getTryOnJob, retryTryOnJob, type GenerationJobWithDetails } from "@/lib/services/tryon.service";
import { cn } from "@/lib/utils";

interface GenerationProgressProps {
  jobId: string;
  onComplete: (job: GenerationJobWithDetails) => void;
  onError?: (error: string) => void;
}

const STATUS_MESSAGES: Record<string, string> = {
  pending: "Queued for processing...",
  processing: "AI is generating your try-on...",
  completed: "Generation complete!",
  failed: "Generation failed",
};

const STATUS_DESCRIPTIONS: Record<string, string> = {
  pending: "Your request is in the queue waiting to be processed",
  processing: "This usually takes 10-30 seconds",
  completed: "Your try-on image is ready!",
  failed: "Something went wrong with the generation",
};

export function GenerationProgress({
  jobId,
  onComplete,
  onError,
}: GenerationProgressProps) {
  const [job, setJob] = useState<GenerationJobWithDetails | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [connectionError, setConnectionError] = useState(false);
  const consecutiveFailures = useRef(0);

  const pollJob = useCallback(async () => {
    try {
      const updatedJob = await getTryOnJob(jobId);
      if (!updatedJob) return;

      // Connection recovered
      if (connectionError) {
        setConnectionError(false);
        consecutiveFailures.current = 0;
      }

      setJob(updatedJob);

      if (updatedJob.status === "completed") {
        setProgress(100);
        onComplete(updatedJob);
      } else if (updatedJob.status === "failed") {
        onError?.(updatedJob.error_message || "Generation failed");
      } else if (updatedJob.status === "processing") {
        // Simulate progress (since we don't have real progress from AI)
        setProgress((prev) => Math.min(prev + 10, 90));
      }
    } catch (error) {
      consecutiveFailures.current += 1;
      // Only show connection error after 3 consecutive failures
      if (consecutiveFailures.current >= 3) {
        setConnectionError(true);
      }
      console.error("[GenerationProgress] Poll error:", error);
    }
  }, [jobId, onComplete, onError, connectionError]);

  useEffect(() => {
    // Initial fetch
    pollJob();

    // Poll every 2 seconds while not complete/failed
    const interval = setInterval(() => {
      if (job?.status === "completed" || job?.status === "failed") {
        clearInterval(interval);
        return;
      }
      pollJob();
    }, 2000);

    return () => clearInterval(interval);
  }, [pollJob, job?.status]);

  // Progress animation
  useEffect(() => {
    if (job?.status === "processing" || job?.status === "pending") {
      const timer = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 85));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [job?.status]);

  const handleRetry = async () => {
    if (!job) return;

    setIsRetrying(true);
    try {
      await retryTryOnJob(job.id);
      setProgress(0);
      // Job will be updated by polling
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Retry failed");
    } finally {
      setIsRetrying(false);
    }
  };

  const status = job?.status || "pending";
  const isFailed = status === "failed";
  const isQueued = status === "pending";
  const isGenerating = status === "processing";
  const isProcessing = isQueued || isGenerating;

  return (
    <div className="w-full max-w-md mx-auto text-center space-y-6">
      {/* Connection Error Banner */}
      {connectionError && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-center gap-3">
          <WifiOff className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-600 dark:text-amber-400 text-left">
            Connection interrupted. Retrying automatically...
          </p>
        </div>
      )}

      {/* Animated Icon */}
      <div
        className={cn(
          "w-24 h-24 rounded-full mx-auto flex items-center justify-center",
          isFailed ? "bg-destructive/10" : "bg-primary/10"
        )}
      >
        {isFailed ? (
          <AlertCircle className="w-12 h-12 text-destructive" />
        ) : isQueued ? (
          <div className="relative">
            <Clock className="w-12 h-12 text-primary animate-pulse" />
          </div>
        ) : (
          <div className="relative">
            <Sparkles
              className={cn(
                "w-12 h-12 text-primary",
                isGenerating && "animate-pulse"
              )}
            />
            {isGenerating && (
              <Loader2 className="w-6 h-6 text-primary absolute -bottom-1 -right-1 animate-spin" />
            )}
          </div>
        )}
      </div>

      {/* Status Text */}
      <div>
        <h3
          className={cn(
            "text-lg font-medium",
            isFailed ? "text-destructive" : "text-foreground"
          )}
        >
          {STATUS_MESSAGES[status]}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {STATUS_DESCRIPTIONS[status]}
        </p>
        {job?.products && (
          <p className="text-sm text-muted-foreground mt-2">
            Trying on: {(job.products as { name: string }).name}
          </p>
        )}
      </div>

      {/* Progress Bar */}
      {isProcessing && (
        <div className="w-full space-y-2">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500 rounded-full",
                isQueued ? "bg-amber-500" : "bg-primary"
              )}
              style={{ width: `${isQueued ? Math.min(progress, 15) : progress}%` }}
            />
          </div>
          {isQueued && (
            <p className="text-xs text-muted-foreground">
              Waiting for available processing slot...
            </p>
          )}
        </div>
      )}

      {/* Error State */}
      {isFailed && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {job?.error_message || "Something went wrong. Please try again."}
          </p>

          {(job?.retry_count || 0) < 3 ? (
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              className="gap-2"
            >
              {isRetrying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Retry
            </Button>
          ) : (
            <p className="text-sm text-destructive">
              Maximum retries reached. Please try with a different photo or
              product.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
