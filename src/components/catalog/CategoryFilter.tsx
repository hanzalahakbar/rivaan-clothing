"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId?: string;
}

export function CategoryFilter({
  categories,
  selectedCategoryId,
}: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleCategoryChange = (categoryId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (categoryId) {
      params.set("category", categoryId);
    } else {
      params.delete("category");
    }

    // Reset to page 1 when changing filters
    params.delete("page");

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-foreground">Categories</h3>
      <div className="space-y-1">
        <button
          onClick={() => handleCategoryChange(null)}
          className={cn(
            "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
            !selectedCategoryId
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          All Categories
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryChange(category.id)}
            className={cn(
              "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
              selectedCategoryId === category.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
