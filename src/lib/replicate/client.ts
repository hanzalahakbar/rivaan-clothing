import Replicate from "replicate";
import type { TryOnInput, ReplicatePrediction, GenerationResult } from "./types";

// IDM-VTON model for virtual try-on
const VTON_MODEL = "cuuupid/idm-vton:c871bb9b046c1c8a8a5e82f253acde4c6d8b2cda61405f9a69d04d8ab1ce4f2e";

// Timeout for prediction (5 minutes max)
const PREDICTION_TIMEOUT_MS = 5 * 60 * 1000;

// Polling interval for checking prediction status
const POLL_INTERVAL_MS = 2000;

/**
 * Create a configured Replicate client
 * Must be called server-side only
 */
export function createReplicateClient(): Replicate {
  const apiToken = process.env.REPLICATE_API_TOKEN;

  if (!apiToken) {
    throw new Error(
      "REPLICATE_API_TOKEN environment variable is not set. " +
      "Please add it to your .env.local file."
    );
  }

  return new Replicate({
    auth: apiToken,
  });
}

/**
 * Run virtual try-on generation using IDM-VTON model
 */
export async function runTryOnGeneration(
  personImageUrl: string,
  garmentImageUrl: string,
  options?: {
    garmentDescription?: string;
    isDress?: boolean;
    isFullBody?: boolean;
    seed?: number;
  }
): Promise<GenerationResult> {
  const startTime = Date.now();

  try {
    const replicate = createReplicateClient();

    const input: TryOnInput = {
      human_img: personImageUrl,
      garm_img: garmentImageUrl,
      garment_des: options?.garmentDescription || "clothing item",
      is_checked: options?.isDress ?? false,
      is_checked_crop: options?.isFullBody ?? false,
      denoise_steps: 30,
      seed: options?.seed ?? Math.floor(Math.random() * 1000000),
    };

    console.log("[Replicate] Starting try-on generation", {
      model: VTON_MODEL,
      personImageUrl: personImageUrl.substring(0, 50) + "...",
      garmentImageUrl: garmentImageUrl.substring(0, 50) + "...",
    });

    // Create prediction
    const prediction = await replicate.predictions.create({
      model: VTON_MODEL,
      input,
    });

    console.log("[Replicate] Prediction created", { id: prediction.id });

    // Poll for completion
    const result = await waitForPrediction(replicate, prediction.id);

    const processingTime = Date.now() - startTime;

    if (result.status === "succeeded" && result.output) {
      const outputUrl = Array.isArray(result.output) ? result.output[0] : result.output;

      console.log("[Replicate] Generation succeeded", {
        id: prediction.id,
        processingTime,
        outputUrl: outputUrl.substring(0, 50) + "...",
      });

      return {
        success: true,
        imageUrl: outputUrl,
        processingTime,
      };
    } else {
      const errorMessage = result.error || "Generation failed with unknown error";

      console.error("[Replicate] Generation failed", {
        id: prediction.id,
        status: result.status,
        error: errorMessage,
      });

      return {
        success: false,
        error: errorMessage,
        processingTime,
      };
    }
  } catch (error) {
    const processingTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    console.error("[Replicate] Exception during generation", {
      error: errorMessage,
      processingTime,
    });

    return {
      success: false,
      error: errorMessage,
      processingTime,
    };
  }
}

/**
 * Poll for prediction completion with timeout
 */
async function waitForPrediction(
  replicate: Replicate,
  predictionId: string
): Promise<ReplicatePrediction> {
  const startTime = Date.now();

  while (true) {
    const prediction = await replicate.predictions.get(predictionId);

    if (prediction.status === "succeeded" || prediction.status === "failed" || prediction.status === "canceled") {
      return prediction as ReplicatePrediction;
    }

    if (Date.now() - startTime > PREDICTION_TIMEOUT_MS) {
      // Cancel the prediction if it's taking too long
      try {
        await replicate.predictions.cancel(predictionId);
      } catch {
        // Ignore cancel errors
      }

      return {
        id: predictionId,
        status: "failed",
        input: {} as TryOnInput,
        output: null,
        error: "Generation timed out after 5 minutes",
        created_at: new Date().toISOString(),
        started_at: null,
        completed_at: null,
      };
    }

    // Wait before polling again
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

/**
 * Check if Replicate is configured
 */
export function isReplicateConfigured(): boolean {
  return !!process.env.REPLICATE_API_TOKEN;
}
