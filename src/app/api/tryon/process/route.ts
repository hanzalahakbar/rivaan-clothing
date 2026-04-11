import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { processGenerationJob } from "@/lib/services/ai-generation.service";

/**
 * Create a Supabase admin client for server-side operations
 */
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase configuration missing");
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * POST /api/tryon/process
 * Triggers AI processing for a generation job
 *
 * Request body:
 * - jobId: string - The ID of the generation job to process
 *
 * This endpoint is called internally to start processing a job.
 * Processing happens asynchronously - the client should poll for status.
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { jobId } = body;

    if (!jobId || typeof jobId !== "string") {
      return NextResponse.json(
        { error: "jobId is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Validate job exists and get user info
    const { data: job, error: jobError } = await supabase
      .from("generation_jobs")
      .select("id, user_id, status")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Check job is in valid state
    if (job.status !== "pending") {
      return NextResponse.json(
        { error: `Job is not pending (current status: ${job.status})` },
        { status: 400 }
      );
    }

    // Start processing asynchronously
    // We don't await this - it runs in the background
    processGenerationJob(jobId).catch((error) => {
      console.error("[API] Background processing failed:", error);
    });

    return NextResponse.json({
      success: true,
      message: "Processing started",
      jobId,
    });
  } catch (error) {
    console.error("[API] Error in /api/tryon/process:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/tryon/process?jobId=xxx
 * Get the current status of a generation job
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json(
        { error: "jobId is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: job, error } = await supabase
      .from("generation_jobs")
      .select("id, status, result_image_url, error_message, created_at, started_at, completed_at, retry_count")
      .eq("id", jobId)
      .single();

    if (error || !job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      job,
    });
  } catch (error) {
    console.error("[API] Error getting job status:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
