/**
 * Types for Replicate API virtual try-on
 */

export interface TryOnInput {
  /** URL to the person/model image */
  human_img: string;
  /** URL to the garment/clothing image */
  garm_img: string;
  /** Description of the garment (optional) */
  garment_des?: string;
  /** Whether the garment is a dress (affects full body) */
  is_checked?: boolean;
  /** Whether the garment covers full body (pants, etc.) */
  is_checked_crop?: boolean;
  /** Denoising steps (default: 30) */
  denoise_steps?: number;
  /** Random seed for reproducibility */
  seed?: number;
}

export interface TryOnOutput {
  /** URL to the generated try-on image */
  output: string | string[];
}

export interface ReplicatePrediction {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  input: TryOnInput;
  output: string | string[] | null;
  error: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  metrics?: {
    predict_time?: number;
  };
}

export interface GenerationResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
  processingTime?: number;
}

export interface GenerationLogEntry {
  timestamp: string;
  jobId: string;
  eventType: "request" | "success" | "failure" | "retry";
  details: Record<string, unknown>;
}
