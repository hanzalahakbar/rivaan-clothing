"use client";

import { useState } from "react";
import Image from "next/image";
import { Trash2, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import type { PhotoWithUrl } from "@/lib/services/photo.service";

interface PhotoPreviewProps {
  photo: PhotoWithUrl;
  onReplace: () => void;
  onDelete: () => Promise<void>;
}

export function PhotoPreview({ photo, onReplace, onDelete }: PhotoPreviewProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full space-y-4">
      {/* Photo Preview */}
      <div className="relative aspect-[3/4] max-w-sm mx-auto rounded-lg overflow-hidden bg-muted">
        <Image
          src={photo.url}
          alt="Your uploaded photo"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 384px"
          priority
        />
      </div>

      {/* Photo Info */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          {photo.mime_type === "image/jpeg" ? "JPEG" : "PNG"} &bull;{" "}
          {formatFileSize(photo.file_size)}
        </p>
        <p className="text-xs mt-1">
          Uploaded {new Date(photo.created_at!).toLocaleDateString()}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="outline" onClick={onReplace} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Replace Photo
        </Button>

        {showDeleteConfirm ? (
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Confirm Delete
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            onClick={() => setShowDeleteConfirm(true)}
            className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
            Delete Photo
          </Button>
        )}
      </div>
    </div>
  );
}
