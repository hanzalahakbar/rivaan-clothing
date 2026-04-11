"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { PhotoUpload, PhotoPreview } from "@/components/upload";
import {
  getUserPhoto,
  uploadPhoto,
  deletePhoto,
  type PhotoWithUrl,
} from "@/lib/services/photo.service";
import { useAuth } from "@/hooks/useAuth";

export default function UploadPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [photo, setPhoto] = useState<PhotoWithUrl | null>(null);
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUploader, setShowUploader] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin?redirect=/upload");
    }
  }, [user, authLoading, router]);

  // Load existing photo
  useEffect(() => {
    async function loadPhoto() {
      if (!user) return;

      try {
        const existingPhoto = await getUserPhoto();
        setPhoto(existingPhoto);
      } catch (error) {
        console.error("Failed to load photo:", error);
      } finally {
        setIsLoadingPhoto(false);
      }
    }

    if (user) {
      loadPhoto();
    }
  }, [user]);

  const handleUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      const newPhoto = await uploadPhoto(file, setUploadProgress);
      setPhoto(newPhoto);
      setShowUploader(false);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Upload failed"
      );
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleDelete = useCallback(async () => {
    if (!photo) return;

    try {
      await deletePhoto(photo.id);
      setPhoto(null);
      setShowUploader(false);
    } catch (error) {
      console.error("Failed to delete photo:", error);
    }
  }, [photo]);

  const handleReplace = useCallback(() => {
    setShowUploader(true);
  }, []);

  const handleCancelUpload = useCallback(() => {
    // In a real implementation, you'd cancel the upload request
    setIsUploading(false);
    setUploadProgress(0);
  }, []);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-2xl px-6 py-8 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Upload Your Photo
          </h1>
          <p className="mt-2 text-muted-foreground">
            Upload a photo of yourself to try on clothes virtually
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-6 py-8 lg:px-8">
        <div className="glass rounded-lg p-8">
          {isLoadingPhoto ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : photo && !showUploader ? (
            <>
              <PhotoPreview
                photo={photo}
                onReplace={handleReplace}
                onDelete={handleDelete}
              />

              {/* Continue to Try-On */}
              <div className="mt-8 pt-6 border-t border-border">
                <Link href="/tryon">
                  <Button className="w-full gap-2" size="lg">
                    Continue to Try-On
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <p className="text-center text-sm text-muted-foreground mt-2">
                  Use your photo to virtually try on clothes
                </p>
              </div>
            </>
          ) : (
            <>
              <PhotoUpload
                onUpload={handleUpload}
                isUploading={isUploading}
                progress={uploadProgress}
                error={uploadError}
                onCancelUpload={handleCancelUpload}
              />

              {showUploader && (
                <div className="mt-4 text-center">
                  <Button
                    variant="ghost"
                    onClick={() => setShowUploader(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Tips */}
        <div className="mt-8 p-6 rounded-lg bg-muted/50">
          <h3 className="font-medium text-foreground mb-3">
            Tips for best results
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Use a well-lit photo with a clear view of your body
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Stand in a neutral pose facing the camera
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Wear form-fitting clothes for more accurate try-ons
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Use a plain background when possible
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
