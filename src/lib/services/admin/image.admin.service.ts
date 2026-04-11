import { createClient } from "@/lib/supabase/client";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const BUCKET_NAME = "product-images";

export interface ImageValidationError {
  type: "size" | "format" | "unknown";
  message: string;
}

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Validate image file before upload
 */
export function validateImage(file: File): ImageValidationError | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      type: "format",
      message: "Only JPG, PNG, and WebP images are accepted",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      type: "size",
      message: "File size must be less than 5MB",
    };
  }

  return null;
}

/**
 * Upload a product image
 */
export async function uploadProductImage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  const supabase = createClient();

  // Validate file
  const validationError = validateImage(file);
  if (validationError) {
    throw new Error(validationError.message);
  }

  // Generate unique filename
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const storagePath = `products/${fileName}`;

  onProgress?.(10);

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  onProgress?.(70);

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storagePath);

  onProgress?.(100);

  if (!urlData?.publicUrl) {
    // Rollback: delete uploaded file
    await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
    throw new Error("Failed to generate image URL");
  }

  return {
    url: urlData.publicUrl,
    path: storagePath,
  };
}

/**
 * Delete a product image from storage
 */
export async function deleteProductImage(
  imageUrl: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  // Extract path from URL
  const urlParts = imageUrl.split(`${BUCKET_NAME}/`);
  if (urlParts.length < 2) {
    return { success: false, error: "Invalid image URL" };
  }

  const storagePath = urlParts[1];

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([storagePath]);

  if (error) {
    console.error("Error deleting image:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
