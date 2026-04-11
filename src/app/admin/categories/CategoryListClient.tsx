"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { CategoryList } from "@/components/admin";
import { deleteCategoryAction } from "./actions";

interface CategoryWithProductCount {
  id: string;
  name: string;
  slug: string;
  display_order: number | null;
  created_at: string | null;
  updated_at: string | null;
  product_count: number;
}

interface CategoryListClientProps {
  categories: CategoryWithProductCount[];
}

export function CategoryListClient({ categories }: CategoryListClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = async (categoryId: string) => {
    const result = await deleteCategoryAction(categoryId);
    if (result.success) {
      startTransition(() => {
        router.refresh();
      });
    } else {
      console.error("Failed to delete category:", result.error);
      throw new Error(result.error);
    }
  };

  return <CategoryList categories={categories} onDelete={handleDelete} />;
}
