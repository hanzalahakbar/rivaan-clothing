"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { ProductList } from "@/components/admin";
import { deleteProductAction } from "./actions";
import type { Category } from "@/types";

interface AdminProductWithCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image_url: string;
  is_active: boolean | null;
  category_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  categories: Category | null;
}

interface ProductListClientProps {
  products: AdminProductWithCategory[];
  categories: Category[];
  total: number;
  page: number;
  totalPages: number;
  search: string;
  categoryFilter: string;
}

export function ProductListClient({
  products,
  categories,
  total,
  page,
  totalPages,
  search,
  categoryFilter,
}: ProductListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      // Reset to page 1 when filters change
      if (!updates.page) {
        params.delete("page");
      }
      startTransition(() => {
        router.push(`/admin/products?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const handleSearch = (searchTerm: string) => {
    updateParams({ search: searchTerm });
  };

  const handleFilterCategory = (categoryId: string) => {
    updateParams({ category: categoryId });
  };

  const handlePageChange = (newPage: number) => {
    updateParams({ page: newPage.toString() });
  };

  const handleDelete = async (productId: string) => {
    const result = await deleteProductAction(productId);
    if (result.success) {
      startTransition(() => {
        router.refresh();
      });
    } else {
      console.error("Failed to delete product:", result.error);
      throw new Error(result.error);
    }
  };

  return (
    <ProductList
      products={products}
      categories={categories}
      total={total}
      page={page}
      totalPages={totalPages}
      onSearch={handleSearch}
      onFilterCategory={handleFilterCategory}
      onPageChange={handlePageChange}
      onDelete={handleDelete}
      search={search}
      categoryFilter={categoryFilter}
    />
  );
}
