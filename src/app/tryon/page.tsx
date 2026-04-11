"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Sparkles, Camera, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui";
import {
  GenerationProgress,
  TryOnResult,
  TryOnHistory,
} from "@/components/tryon";
import {
  createTryOnJob,
  getTryOnJob,
  getCurrentJob,
  checkDailyQuota,
  type GenerationJobWithDetails,
  type QuotaStatus,
} from "@/lib/services/tryon.service";
import { getUserPhoto } from "@/lib/services/photo.service";
import { useAuth } from "@/hooks/useAuth";

function TryOnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();

  const [currentJob, setCurrentJob] = useState<GenerationJobWithDetails | null>(
    null
  );
  const [quota, setQuota] = useState<QuotaStatus | null>(null);
  const [hasPhoto, setHasPhoto] = useState<boolean | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const jobIdParam = searchParams.get("job");
  const productIdParam = searchParams.get("product");

  // Initialize page state
  useEffect(() => {
    async function initialize() {
      if (!user) {
        setIsInitializing(false);
        return;
      }

      try {
        // Check for user photo
        const photo = await getUserPhoto();
        setHasPhoto(!!photo);

        // Check quota
        const quotaStatus = await checkDailyQuota();
        setQuota(quotaStatus);

        // If job ID provided, load that job
        if (jobIdParam) {
          const job = await getTryOnJob(jobIdParam);
          if (job) {
            setCurrentJob(job);
          }
        }
        // If product ID provided and user has photo, create job
        else if (productIdParam && photo) {
          try {
            const newJob = await createTryOnJob(productIdParam);
            setCurrentJob(newJob as GenerationJobWithDetails);
            // Update URL to show job ID
            router.replace(`/tryon?job=${newJob.id}`);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to start try-on");
          }
        }
        // Otherwise, check for any current pending job
        else {
          const pendingJob = await getCurrentJob();
          if (pendingJob) {
            setCurrentJob(pendingJob);
          }
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setIsInitializing(false);
      }
    }

    if (!authLoading) {
      initialize();
    }
  }, [user, authLoading, jobIdParam, productIdParam, router]);

  // Handle job completion
  const handleJobComplete = useCallback((job: GenerationJobWithDetails) => {
    setCurrentJob(job);
  }, []);

  // Handle try another
  const handleTryAnother = useCallback(() => {
    setCurrentJob(null);
    router.replace("/tryon");
  }, [router]);

  // Handle history item selection
  const handleHistorySelect = useCallback(
    (jobId: string) => {
      router.push(`/tryon?job=${jobId}`);
    },
    [router]
  );

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin?redirect=/tryon");
    }
  }, [user, authLoading, router]);

  // Show loading while checking auth
  if (authLoading || isInitializing) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  // No photo uploaded
  if (hasPhoto === false) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <Camera className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Upload Your Photo First
        </h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Before you can try on clothes virtually, you need to upload a photo of
          yourself.
        </p>
        <Link href="/upload">
          <Button className="gap-2">
            <Camera className="w-4 h-4" />
            Upload Photo
          </Button>
        </Link>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Something Went Wrong
        </h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <div className="flex justify-center gap-3">
          <Link href="/catalog">
            <Button variant="outline">Browse Catalog</Button>
          </Link>
          <Button onClick={() => setError(null)}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Show current job progress or result
  if (currentJob) {
    const isPending =
      currentJob.status === "pending" || currentJob.status === "processing";
    const isCompleted = currentJob.status === "completed";
    const isFailed = currentJob.status === "failed";

    return (
      <div className="py-8">
        {isPending && (
          <GenerationProgress
            jobId={currentJob.id}
            onComplete={handleJobComplete}
            onError={setError}
          />
        )}

        {isCompleted && (
          <TryOnResult job={currentJob} onTryAnother={handleTryAnother} />
        )}

        {isFailed && (
          <GenerationProgress
            jobId={currentJob.id}
            onComplete={handleJobComplete}
            onError={setError}
          />
        )}
      </div>
    );
  }

  // Default: show history and browse option
  return (
    <div className="space-y-8">
      {/* Quota Info */}
      {quota && (
        <div className={`rounded-lg p-4 ${
          quota.remaining === 0
            ? "bg-destructive/10 border border-destructive/20"
            : quota.isLow
            ? "bg-amber-500/10 border border-amber-500/20"
            : "glass"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                {quota.remaining === 0 ? (
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                ) : quota.isLow ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                ) : null}
                <p className="text-sm text-muted-foreground">Daily Try-Ons</p>
              </div>
              <p className={`text-lg font-medium ${
                quota.remaining === 0
                  ? "text-destructive"
                  : quota.isLow
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-foreground"
              }`}>
                {quota.remaining} of {quota.limit} remaining
              </p>
              {/* Reset time - FR-010 */}
              <div className="flex items-center gap-1.5 mt-1">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Resets in {quota.resetTimeFormatted}
                </p>
              </div>
            </div>
            <Link href="/catalog">
              <Button className="gap-2" disabled={quota.remaining === 0}>
                <Sparkles className="w-4 h-4" />
                Try On Clothes
              </Button>
            </Link>
          </div>
          {/* Low quota warning - FR-006 */}
          {quota.isLow && (
            <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
              You&apos;re running low on try-ons! Choose wisely.
            </p>
          )}
          {/* Limit reached message - FR-005 */}
          {quota.remaining === 0 && (
            <p className="mt-3 text-sm text-destructive">
              You&apos;ve reached your daily limit. Your quota will reset in {quota.resetTimeFormatted}.
            </p>
          )}
        </div>
      )}

      {/* History */}
      <TryOnHistory onSelectItem={handleHistorySelect} />
    </div>
  );
}

export default function TryOnPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-4xl px-6 py-8 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            Virtual Try-On
          </h1>
          <p className="mt-2 text-muted-foreground">
            See how clothes look on you with AI
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-8 lg:px-8">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          }
        >
          <TryOnContent />
        </Suspense>
      </div>
    </main>
  );
}
