import { slugify } from "@/lib/utils";

export interface DownloadResult {
  success: boolean;
  error?: string;
  filename?: string;
}

export interface DownloadOptions {
  productName?: string;
  productSlug?: string;
  jobId?: string;
}

/**
 * Generate a meaningful filename for downloaded try-on images
 * Format: tryon-{product-slug}-{date}.jpg
 */
export function generateFilename(options: DownloadOptions): string {
  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  let productPart = "result";
  if (options.productSlug) {
    productPart = options.productSlug;
  } else if (options.productName) {
    productPart = slugify(options.productName);
  }

  // Ensure filename is not too long (max 50 chars for product part)
  if (productPart.length > 50) {
    productPart = productPart.substring(0, 50);
  }

  return `tryon-${productPart}-${date}.jpg`;
}

/**
 * Download an image from a URL
 * Returns success/error status for UI feedback
 *
 * FR-003: Downloads in standard JPG format
 * FR-004: Uses meaningful filenames
 * FR-006: Returns error messages for display
 * FR-009: Handles unavailable images gracefully
 */
export async function downloadImage(
  imageUrl: string,
  options: DownloadOptions = {}
): Promise<DownloadResult> {
  if (!imageUrl) {
    return {
      success: false,
      error: "No image available to download",
    };
  }

  try {
    // Fetch the image
    const response = await fetch(imageUrl);

    // FR-009: Check if image is available
    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          error: "This image is no longer available. It may have been deleted or expired.",
        };
      }
      return {
        success: false,
        error: `Failed to download image (Error ${response.status})`,
      };
    }

    const blob = await response.blob();

    // Validate it's actually an image
    if (!blob.type.startsWith("image/")) {
      return {
        success: false,
        error: "The file is not a valid image",
      };
    }

    // Generate filename
    const filename = generateFilename(options);

    // Create download link and trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return {
      success: true,
      filename,
    };
  } catch (error) {
    console.error("[Download] Error:", error);

    // Determine error type
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return {
        success: false,
        error: "Network error. Please check your connection and try again.",
      };
    }

    return {
      success: false,
      error: "Download failed. Please try again.",
    };
  }
}
