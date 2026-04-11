"use client";

import { useRouter, usePathname } from "next/navigation";
import { X, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui";
import { CategoryFilter } from "./CategoryFilter";
import { PriceRangeFilter } from "./PriceRangeFilter";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";
import type { PriceRange } from "@/lib/services/product.service";

interface FilterSidebarProps {
  categories: Category[];
  priceRange: PriceRange;
  selectedCategoryId?: string;
  currentMinPrice?: number;
  currentMaxPrice?: number;
  hasActiveFilters: boolean;
}

export function FilterSidebar({
  categories,
  priceRange,
  selectedCategoryId,
  currentMinPrice,
  currentMaxPrice,
  hasActiveFilters,
}: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const clearAllFilters = () => {
    router.push(pathname);
    setMobileOpen(false);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Header with Clear button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Filters</h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Category Filter */}
      <CategoryFilter
        categories={categories}
        selectedCategoryId={selectedCategoryId}
      />

      {/* Price Range Filter */}
      <PriceRangeFilter
        priceRange={priceRange}
        currentMin={currentMinPrice}
        currentMax={currentMaxPrice}
      />
    </div>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setMobileOpen(true)}
          className="gap-2"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
              Active
            </span>
          )}
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden transition-opacity duration-200",
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />

        {/* Sidebar */}
        <div
          className={cn(
            "absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-card p-6 shadow-xl transition-transform duration-200",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground"
            aria-label="Close filters"
          >
            <X className="w-5 h-5" />
          </button>

          <FilterContent />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="glass rounded-lg p-6 sticky top-6">
          <FilterContent />
        </div>
      </aside>
    </>
  );
}
