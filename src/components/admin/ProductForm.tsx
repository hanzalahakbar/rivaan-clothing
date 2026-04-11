"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { X, Loader2, ImageIcon } from "lucide-react";
import { Button, Input } from "@/components/ui";
import {
  uploadProductImage,
  validateImage,
} from "@/lib/services/admin/image.admin.service";
import { cn } from "@/lib/utils";
import type { Product, Category } from "@/types";

interface ProductFormData {
  name: string;
  description?: string;
  price: number;
  category_id?: string;
  is_active: boolean;
}

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  onSubmit: (data: ProductFormData & { image_url: string }) => Promise<void>;
  submitLabel?: string;
}

export function ProductForm({
  product,
  categories,
  onSubmit,
  submitLabel = "Save Product",
}: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageUrl, setImageUrl] = useState<string>(product?.image_url || "");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageError, setImageError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || 0,
      category_id: product?.category_id || "",
      is_active: product?.is_active ?? true,
    },
  });

  const handleImageUpload = useCallback(async (file: File) => {
    const validationError = validateImage(file);
    if (validationError) {
      setImageError(validationError.message);
      return;
    }

    setImageError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadProductImage(file, setUploadProgress);
      setImageUrl(result.url);
    } catch (error) {
      setImageError(
        error instanceof Error ? error.message : "Failed to upload image"
      );
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        handleImageUpload(file);
      }
    },
    [handleImageUpload]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const removeImage = () => {
    setImageUrl("");
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onFormSubmit = async (data: ProductFormData) => {
    if (!imageUrl) {
      setImageError("Product image is required");
      return;
    }

    await onSubmit({
      ...data,
      image_url: imageUrl,
      category_id: data.category_id || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Product Image *
        </label>

        {imageUrl ? (
          <div className="relative w-full max-w-md aspect-[3/4] rounded-lg overflow-hidden bg-muted">
            <Image
              src={imageUrl}
              alt="Product preview"
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "w-full max-w-md aspect-[3/4] rounded-lg border-2 border-dashed transition-colors cursor-pointer",
              "flex flex-col items-center justify-center gap-4",
              isUploading
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary hover:bg-muted/50"
            )}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">
                  Uploading... {uploadProgress}%
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    Drop an image here or click to upload
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG, WebP up to 5MB
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        {imageError && (
          <p className="mt-2 text-sm text-destructive">{imageError}</p>
        )}
      </div>

      {/* Name */}
      <Input
        label="Product Name *"
        {...register("name", {
          required: "Name is required",
          maxLength: { value: 200, message: "Name is too long" }
        })}
        error={errors.name?.message}
        placeholder="Enter product name"
      />

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          Description
        </label>
        <textarea
          id="description"
          {...register("description", {
            maxLength: { value: 2000, message: "Description is too long" }
          })}
          rows={4}
          className={cn(
            "flex w-full rounded-md border border-input bg-card px-3 py-2 text-sm",
            "ring-offset-background placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-all duration-200 ease-out resize-none"
          )}
          placeholder="Enter product description (optional)"
        />
        {errors.description && (
          <p className="mt-1.5 text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Price */}
      <Input
        label="Price *"
        type="number"
        step="0.01"
        {...register("price", {
          required: "Price is required",
          min: { value: 0.01, message: "Price must be positive" },
          max: { value: 999999, message: "Price is too high" },
          valueAsNumber: true
        })}
        error={errors.price?.message}
        placeholder="0.00"
      />

      {/* Category */}
      <div>
        <label
          htmlFor="category_id"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          Category
        </label>
        <select
          id="category_id"
          {...register("category_id")}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm",
            "ring-offset-background",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-all duration-200 ease-out"
          )}
        >
          <option value="">No category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Active Status */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="is_active"
          {...register("is_active")}
          className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
        />
        <label htmlFor="is_active" className="text-sm font-medium text-foreground">
          Active (visible in catalog)
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-4">
        <Button type="submit" isLoading={isSubmitting} disabled={isUploading}>
          {submitLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
