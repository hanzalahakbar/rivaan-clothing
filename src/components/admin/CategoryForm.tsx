"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button, Input } from "@/components/ui";
import type { Category } from "@/types";

interface CategoryFormData {
  name: string;
  display_order?: number;
}

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  submitLabel?: string;
}

export function CategoryForm({
  category,
  onSubmit,
  submitLabel = "Save Category",
}: CategoryFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    defaultValues: {
      name: category?.name || "",
      display_order: category?.display_order ?? undefined,
    },
  });

  const onFormSubmit = async (data: CategoryFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 max-w-md">
      {/* Name */}
      <Input
        label="Category Name *"
        {...register("name", {
          required: "Name is required",
          maxLength: { value: 100, message: "Name is too long" }
        })}
        error={errors.name?.message}
        placeholder="Enter category name"
      />

      {/* Display Order */}
      <Input
        label="Display Order"
        type="number"
        {...register("display_order", {
          min: { value: 0, message: "Order must be non-negative" },
          valueAsNumber: true
        })}
        error={errors.display_order?.message}
        placeholder="Auto-assigned if empty"
      />
      <p className="text-xs text-muted-foreground -mt-4">
        Lower numbers appear first. Leave empty to add at the end.
      </p>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-4">
        <Button type="submit" isLoading={isSubmitting}>
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
