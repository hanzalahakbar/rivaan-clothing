import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { runTryOnGeneration, isReplicateConfigured } from "@/lib/replicate";
import type { GenerationLogEntry } from "@/lib/replicate/types";

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff: 1s, 2s, 4s
const DAILY_LIMIT = 10; // Default daily generation limit

/**
 * Create a Supabase admin client for server-side operations
 * Uses service role key for elevated permissions
 */
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase configuration missing");
  }

  return createSupabaseAdmin(supabaseUrl, supabaseServiceKey);
}

/**
 * Increment user's daily quota on successful generation
 * Only called after a generation completes successfully (FR-008)
 */
async function incrementQuota(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string
): Promise<void> {
  const today = new Date().toISOString().split("T")[0];

  // Try to update existing record
  const { data: existing } = await supabase
    .from("user_generation_quotas")
    .select("id, generation_count")
    .eq("user_id", userId)
    .eq("date", today)
    .single();

  if (existing) {
    await supabase
      .from("user_generation_quotas")
      .update({
        generation_count: (existing.generation_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("user_generation_quotas").insert({
      user_id: userId,
      date: today,
      generation_count: 1,
      daily_limit: DAILY_LIMIT,
    });
  }
}

/**
 * Log generation events for observability
 */
function logGenerationEvent(entry: GenerationLogEntry): void {
  const logLine = JSON.stringify({
    ...entry,
    service: "ai-generation",
  });

  if (entry.eventType === "failure") {
    console.error(logLine);
  } else {
    console.log(logLine);
  }
}

/**
 * Get signed URL for a Supabase storage file
 */
async function getSignedUrl(
  supabase: ReturnType<typeof createAdminClient>,
  bucket: string,
  path: string
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 3600); // 1 hour expiry

  if (error || !data) {
    console.error("[AI Generation] Failed to get signed URL", { bucket, path, error });
    return null;
  }

  return data.signedUrl;
}

/**
 * Process a try-on generation job
 * This is the main entry point for AI generation
 */
export async function processGenerationJob(jobId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = createAdminClient();

  logGenerationEvent({
    timestamp: new Date().toISOString(),
    jobId,
    eventType: "request",
    details: { action: "start_processing" },
  });

  try {
    // Get job details
    const { data: job, error: jobError } = await supabase
      .from("generation_jobs")
      .select(`
        *,
        user_photos (id, image_path),
        products (id, name, image_url)
      `)
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    // Validate job can be processed
    if (job.status !== "pending" && job.status !== "processing") {
      throw new Error(`Job ${jobId} is not in a processable state: ${job.status}`);
    }

    // Update status to processing
    await supabase
      .from("generation_jobs")
      .update({
        status: "processing",
        started_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    // Get image URLs
    const userPhoto = job.user_photos as { id: string; image_path: string } | null;
    const product = job.products as { id: string; name: string; image_url: string } | null;

    if (!userPhoto?.image_path) {
      throw new Error("User photo not found");
    }

    if (!product?.image_url) {
      throw new Error("Product image not found");
    }

    // Get signed URL for user photo from Supabase storage
    const personImageUrl = await getSignedUrl(supabase, "user-photos", userPhoto.image_path);
    if (!personImageUrl) {
      throw new Error("Failed to get user photo URL");
    }

    // Product image is already a public URL
    const garmentImageUrl = product.image_url;

    // Check if Replicate is configured
    if (!isReplicateConfigured()) {
      // Fallback to simulation mode if Replicate is not configured
      console.warn("[AI Generation] Replicate not configured, using simulation mode");
      return await simulateFallbackProcessing(supabase, jobId, product.image_url, job.user_id);
    }

    // Run generation with retry logic
    let lastError: string | undefined;
    let result;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        logGenerationEvent({
          timestamp: new Date().toISOString(),
          jobId,
          eventType: "retry",
          details: { attempt, previousError: lastError },
        });

        // Wait before retry (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS[attempt - 1]));

        // Update retry count
        await supabase
          .from("generation_jobs")
          .update({ retry_count: attempt })
          .eq("id", jobId);
      }

      result = await runTryOnGeneration(personImageUrl, garmentImageUrl, {
        garmentDescription: product.name,
      });

      if (result.success && result.imageUrl) {
        // Success! Update job with result
        await supabase
          .from("generation_jobs")
          .update({
            status: "completed",
            result_image_url: result.imageUrl,
            completed_at: new Date().toISOString(),
          })
          .eq("id", jobId);

        // Increment quota only on successful completion (FR-008)
        await incrementQuota(supabase, job.user_id);

        logGenerationEvent({
          timestamp: new Date().toISOString(),
          jobId,
          eventType: "success",
          details: {
            processingTime: result.processingTime,
            attempts: attempt + 1,
          },
        });

        return { success: true };
      }

      lastError = result.error;
    }

    // All retries exhausted
    await supabase
      .from("generation_jobs")
      .update({
        status: "failed",
        error_message: lastError || "Generation failed after multiple attempts",
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    logGenerationEvent({
      timestamp: new Date().toISOString(),
      jobId,
      eventType: "failure",
      details: { error: lastError, retriesExhausted: true },
    });

    return { success: false, error: lastError };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    await supabase
      .from("generation_jobs")
      .update({
        status: "failed",
        error_message: errorMessage,
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    logGenerationEvent({
      timestamp: new Date().toISOString(),
      jobId,
      eventType: "failure",
      details: { error: errorMessage, exception: true },
    });

    return { success: false, error: errorMessage };
  }
}

/**
 * Fallback simulation when Replicate is not configured
 * Used for development/testing without API key
 */
async function simulateFallbackProcessing(
  supabase: ReturnType<typeof createAdminClient>,
  jobId: string,
  productImageUrl: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  // Simulate processing time (3-8 seconds)
  const processingTime = 3000 + Math.random() * 5000;
  await new Promise((resolve) => setTimeout(resolve, processingTime));

  // 90% success rate for demo
  const isSuccess = Math.random() > 0.1;

  if (isSuccess) {
    await supabase
      .from("generation_jobs")
      .update({
        status: "completed",
        result_image_url: productImageUrl, // Use product image as placeholder
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    // Increment quota only on successful completion (FR-008)
    await incrementQuota(supabase, userId);

    logGenerationEvent({
      timestamp: new Date().toISOString(),
      jobId,
      eventType: "success",
      details: { mode: "simulation", processingTime },
    });

    return { success: true };
  } else {
    const errorMessage = "Simulated failure for testing";

    await supabase
      .from("generation_jobs")
      .update({
        status: "failed",
        error_message: errorMessage,
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    logGenerationEvent({
      timestamp: new Date().toISOString(),
      jobId,
      eventType: "failure",
      details: { mode: "simulation", error: errorMessage },
    });

    return { success: false, error: errorMessage };
  }
}
