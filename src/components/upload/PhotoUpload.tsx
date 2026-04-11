"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, Image as ImageIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { validateFile } from "@/lib/services/photo.service";
import { UploadProgress } from "./UploadProgress";

interface PhotoUploadProps {
  onUpload: (file: File) => Promise<void>;
  isUploading?: boolean;
  progress?: number;
  error?: string | null;
  onCancelUpload?: () => void;
}

export function PhotoUpload({
  onUpload,
  isUploading = false,
  progress = 0,
  error,
  onCancelUpload,
}: PhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setValidationError(null);

      const validation = validateFile(file);
      if (validation) {
        setValidationError(validation.message);
        return;
      }

      await onUpload(file);
    },
    [onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
      // Reset input so the same file can be selected again
      e.target.value = "";
    },
    [handleFile]
  );

  const displayError = validationError || error;

  return (
    <div className="w-full space-y-4">
      {/* Drop Zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        className={cn(
          "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/50",
          isUploading && "pointer-events-none opacity-50"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-4 px-6 w-full max-w-xs">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <UploadProgress
              progress={progress}
              onCancel={onCancelUpload}
              status="uploading"
            />
          </div>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              {isDragging ? (
                <Upload className="w-8 h-8 text-primary" />
              ) : (
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div className="text-center">
              <p className="text-foreground font-medium">
                {isDragging ? "Drop your photo here" : "Upload your photo"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Drag and drop or click to select
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                JPG or PNG, max 5MB
              </p>
            </div>
          </>
        )}
      </div>

      {/* Error Message */}
      {displayError && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm">{displayError}</p>
        </div>
      )}
    </div>
  );
}
