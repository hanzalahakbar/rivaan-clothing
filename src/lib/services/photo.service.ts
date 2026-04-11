import { createClient } from "@/lib/supabase/client";
import type { UserPhoto } from "@/types";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const BUCKET_NAME = "user-photos";

export interface PhotoValidationError {
  type: "size" | "format" | "unknown";
  message: string;
}

export interface PhotoWithUrl extends UserPhoto {
  url: string;
}

/**
 * Validate file before upload
 */
export function validateFile(file: File): PhotoValidationError | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      type: "format",
      message: "Only JPG and PNG images are accepted",
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
 * Get the current user's photo with signed URL
 */
export async function getUserPhoto(): Promise<PhotoWithUrl | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: photo, error } = await supabase
    .from("user_photos")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !photo) {
    return null;
  }

  // Get signed URL for the photo (valid for 1 hour)
  const { data: signedUrlData } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(photo.storage_path, 3600);

  if (!signedUrlData?.signedUrl) {
    return null;
  }

  return {
    ...photo,
    url: signedUrlData.signedUrl,
  };
}

/**
 * Upload a photo for the current user
 * Replaces any existing photo
 */
export async function uploadPhoto(
  file: File,
  onProgress?: (progress: number) => void
): Promise<PhotoWithUrl> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in to upload a photo");
  }

  // Validate file
  const validationError = validateFile(file);
  if (validationError) {
    throw new Error(validationError.message);
  }

  // Delete existing photo first
  await deleteExistingPhoto(user.id);

  // Generate unique filename
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${Date.now()}.${fileExt}`;
  const storagePath = `${user.id}/${fileName}`;

  // Upload to storage
  // Note: Supabase JS client doesn't support progress tracking directly
  // We simulate progress for better UX
  onProgress?.(10);

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

  // Create database record
  const { data: photo, error: dbError } = await supabase
    .from("user_photos")
    .insert({
      user_id: user.id,
      storage_path: storagePath,
      file_size: file.size,
      mime_type: file.type,
    })
    .select()
    .single();

  onProgress?.(90);

  if (dbError || !photo) {
    // Rollback: delete the uploaded file
    await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
    throw new Error(`Failed to save photo record: ${dbError?.message}`);
  }

  // Get signed URL
  const { data: signedUrlData } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(storagePath, 3600);

  onProgress?.(100);

  if (!signedUrlData?.signedUrl) {
    throw new Error("Failed to generate photo URL");
  }

  return {
    ...photo,
    url: signedUrlData.signedUrl,
  };
}

/**
 * Delete the user's photo
 */
export async function deletePhoto(photoId: string): Promise<void> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in to delete a photo");
  }

  // Get the photo record to find storage path
  const { data: photo, error: fetchError } = await supabase
    .from("user_photos")
    .select("storage_path")
    .eq("id", photoId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !photo) {
    throw new Error("Photo not found");
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([photo.storage_path]);

  if (storageError) {
    console.error("Failed to delete from storage:", storageError);
    // Continue to delete DB record anyway
  }

  // Delete database record
  const { error: dbError } = await supabase
    .from("user_photos")
    .delete()
    .eq("id", photoId)
    .eq("user_id", user.id);

  if (dbError) {
    throw new Error(`Failed to delete photo record: ${dbError.message}`);
  }
}

/**
 * Helper: Delete existing photo for a user
 */
async function deleteExistingPhoto(userId: string): Promise<void> {
  const supabase = createClient();

  // Get existing photos
  const { data: existingPhotos } = await supabase
    .from("user_photos")
    .select("id, storage_path")
    .eq("user_id", userId);

  if (!existingPhotos || existingPhotos.length === 0) {
    return;
  }

  // Delete from storage
  const storagePaths = existingPhotos.map((p) => p.storage_path);
  await supabase.storage.from(BUCKET_NAME).remove(storagePaths);

  // Delete from database
  const ids = existingPhotos.map((p) => p.id);
  await supabase.from("user_photos").delete().in("id", ids);
}
