import { createClient } from "@/lib/supabase/client";
import type { GenerationJob, Product, UserPhoto } from "@/types";

const DAILY_LIMIT = 10; // Default daily generation limit

export type JobStatus = "pending" | "processing" | "completed" | "failed";

export interface GenerationJobWithDetails extends GenerationJob {
  products: Product | null;
  user_photos: UserPhoto | null;
}

export interface TryOnHistoryItem {
  id: string;
  result_image_url: string;
  created_at: string;
  product: {
    id: string;
    name: string;
    image_url: string;
    slug: string;
  };
}

export interface QuotaStatus {
  used: number;
  limit: number;
  remaining: number;
  canGenerate: boolean;
  isLow: boolean; // FR-006: True when remaining <= 2
  resetTime: string; // FR-010: ISO string of next reset (midnight UTC)
  resetTimeFormatted: string; // FR-010: Human-readable reset time
}

/**
 * Calculate the next reset time (midnight UTC)
 */
function getNextResetTime(): { resetTime: string; resetTimeFormatted: string } {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);

  const resetTime = tomorrow.toISOString();

  // Format as human-readable time
  const hoursUntilReset = Math.ceil(
    (tomorrow.getTime() - now.getTime()) / (1000 * 60 * 60)
  );

  let resetTimeFormatted: string;
  if (hoursUntilReset <= 1) {
    const minutesUntilReset = Math.ceil(
      (tomorrow.getTime() - now.getTime()) / (1000 * 60)
    );
    resetTimeFormatted = `${minutesUntilReset} minute${minutesUntilReset !== 1 ? "s" : ""}`;
  } else if (hoursUntilReset < 24) {
    resetTimeFormatted = `${hoursUntilReset} hour${hoursUntilReset !== 1 ? "s" : ""}`;
  } else {
    resetTimeFormatted = "tomorrow";
  }

  return { resetTime, resetTimeFormatted };
}

/**
 * Check if user can generate (daily quota not exceeded)
 */
export async function checkDailyQuota(): Promise<QuotaStatus> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { resetTime, resetTimeFormatted } = getNextResetTime();

  if (!user) {
    return {
      used: 0,
      limit: DAILY_LIMIT,
      remaining: 0,
      canGenerate: false,
      isLow: false,
      resetTime,
      resetTimeFormatted,
    };
  }

  const today = new Date().toISOString().split("T")[0];

  // Get or create today's quota record
  const { data: quota } = await supabase
    .from("user_generation_quotas")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)
    .single();

  const used = quota?.generation_count || 0;
  const limit = quota?.daily_limit || DAILY_LIMIT;
  const remaining = Math.max(0, limit - used);

  return {
    used,
    limit,
    remaining,
    canGenerate: remaining > 0,
    isLow: remaining > 0 && remaining <= 2, // FR-006: Warn when 1-2 remaining
    resetTime,
    resetTimeFormatted,
  };
}

/**
 * Increment the daily quota count
 */
async function incrementQuota(): Promise<void> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const today = new Date().toISOString().split("T")[0];

  // Try to update existing record
  const { data: existing } = await supabase
    .from("user_generation_quotas")
    .select("id, generation_count")
    .eq("user_id", user.id)
    .eq("date", today)
    .single();

  if (existing) {
    await supabase
      .from("user_generation_quotas")
      .update({ generation_count: (existing.generation_count || 0) + 1 })
      .eq("id", existing.id);
  } else {
    await supabase.from("user_generation_quotas").insert({
      user_id: user.id,
      date: today,
      generation_count: 1,
      daily_limit: DAILY_LIMIT,
    });
  }
}

/**
 * Check for existing pending/processing job for same user+product
 */
async function checkDuplicateJob(
  userId: string,
  productId: string
): Promise<GenerationJob | null> {
  const supabase = createClient();

  const { data } = await supabase
    .from("generation_jobs")
    .select("*")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .in("status", ["pending", "processing"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return data;
}

/**
 * Create a new try-on generation job
 */
export async function createTryOnJob(
  productId: string
): Promise<GenerationJob> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in to try on clothes");
  }

  // Check daily quota
  const quota = await checkDailyQuota();
  if (!quota.canGenerate) {
    throw new Error(
      `Daily limit reached (${quota.limit} try-ons per day). Try again tomorrow!`
    );
  }

  // Get user's photo
  const { data: userPhoto } = await supabase
    .from("user_photos")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!userPhoto) {
    throw new Error("Please upload a photo first before trying on clothes");
  }

  // Check for duplicate pending job
  const existingJob = await checkDuplicateJob(user.id, productId);
  if (existingJob) {
    return existingJob;
  }

  // Create the job
  const { data: job, error } = await supabase
    .from("generation_jobs")
    .insert({
      user_id: user.id,
      user_photo_id: userPhoto.id,
      product_id: productId,
      status: "pending",
      retry_count: 0,
    })
    .select()
    .single();

  if (error || !job) {
    throw new Error(`Failed to create try-on job: ${error?.message}`);
  }

  // NOTE: Quota is incremented on successful completion in ai-generation.service.ts
  // This ensures failed generations don't count against the limit (FR-008)

  // Start processing via API route
  triggerProcessing(job.id);

  return job;
}

/**
 * Get a try-on job by ID with product and photo details
 */
export async function getTryOnJob(
  jobId: string
): Promise<GenerationJobWithDetails | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("generation_jobs")
    .select("*, products(*), user_photos(*)")
    .eq("id", jobId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as GenerationJobWithDetails;
}

export interface PaginatedHistoryResult {
  items: TryOnHistoryItem[];
  hasMore: boolean;
  total: number;
}

/**
 * Get user's try-on history (completed jobs) with pagination
 */
export async function getUserTryOnHistory(
  options?: { offset?: number; limit?: number }
): Promise<TryOnHistoryItem[]> {
  const result = await getUserTryOnHistoryPaginated(options);
  return result.items;
}

/**
 * Get user's try-on history with pagination info
 */
export async function getUserTryOnHistoryPaginated(
  options?: { offset?: number; limit?: number }
): Promise<PaginatedHistoryResult> {
  const supabase = createClient();
  const offset = options?.offset ?? 0;
  const limit = options?.limit ?? 20;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { items: [], hasMore: false, total: 0 };
  }

  // Get total count
  const { count } = await supabase
    .from("generation_jobs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "completed")
    .not("result_image_url", "is", null);

  const { data, error } = await supabase
    .from("generation_jobs")
    .select(
      `
      id,
      result_image_url,
      created_at,
      products (
        id,
        name,
        image_url,
        slug
      )
    `
    )
    .eq("user_id", user.id)
    .eq("status", "completed")
    .not("result_image_url", "is", null)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !data) {
    return { items: [], hasMore: false, total: 0 };
  }

  const items = data.map((item) => ({
    id: item.id,
    result_image_url: item.result_image_url!,
    created_at: item.created_at!,
    product: item.products as TryOnHistoryItem["product"],
  }));

  return {
    items,
    hasMore: offset + items.length < (count ?? 0),
    total: count ?? 0,
  };
}

/**
 * Delete a try-on history entry
 * Per privacy requirements, users can delete their uploaded/generated images
 */
export async function deleteHistoryEntry(jobId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in" };
  }

  // Verify the job belongs to this user
  const { data: job } = await supabase
    .from("generation_jobs")
    .select("id, user_id, result_image_url")
    .eq("id", jobId)
    .eq("user_id", user.id)
    .single();

  if (!job) {
    return { success: false, error: "History entry not found" };
  }

  // Delete the job record (result image URL is external, no storage cleanup needed)
  const { error } = await supabase
    .from("generation_jobs")
    .delete()
    .eq("id", jobId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get user's current pending/processing job
 */
export async function getCurrentJob(): Promise<GenerationJobWithDetails | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("generation_jobs")
    .select("*, products(*), user_photos(*)")
    .eq("user_id", user.id)
    .in("status", ["pending", "processing"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return data as GenerationJobWithDetails | null;
}

/**
 * Retry a failed job
 */
export async function retryTryOnJob(jobId: string): Promise<GenerationJob> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in");
  }

  // Get the failed job
  const { data: job } = await supabase
    .from("generation_jobs")
    .select("*")
    .eq("id", jobId)
    .eq("user_id", user.id)
    .eq("status", "failed")
    .single();

  if (!job) {
    throw new Error("Job not found or cannot be retried");
  }

  // Check retry limit (max 3 retries)
  if ((job.retry_count || 0) >= 3) {
    throw new Error("Maximum retry attempts reached");
  }

  // Update job to pending and increment retry count
  const { data: updatedJob, error } = await supabase
    .from("generation_jobs")
    .update({
      status: "pending",
      retry_count: (job.retry_count || 0) + 1,
      error_message: null,
      started_at: null,
      completed_at: null,
    })
    .eq("id", jobId)
    .select()
    .single();

  if (error || !updatedJob) {
    throw new Error(`Failed to retry job: ${error?.message}`);
  }

  // Start processing again via API route
  triggerProcessing(jobId);

  return updatedJob;
}

/**
 * Trigger AI processing via API route
 * This calls the server-side API which handles the actual AI generation
 */
async function triggerProcessing(jobId: string): Promise<void> {
  try {
    const response = await fetch("/api/tryon/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jobId }),
    });

    if (!response.ok) {
      console.error("[TryOn] Failed to trigger processing:", await response.text());
    }
  } catch (error) {
    console.error("[TryOn] Error triggering processing:", error);
  }
}
