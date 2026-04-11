"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui";
import type { PriceRange } from "@/lib/services/product.service";

interface PriceRangeFilterProps {
  priceRange: PriceRange;
  currentMin?: number;
  currentMax?: number;
}

export function PriceRangeFilter({
  priceRange,
  currentMin,
  currentMax,
}: PriceRangeFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [minValue, setMinValue] = useState<string>(
    currentMin?.toString() || ""
  );
  const [maxValue, setMaxValue] = useState<string>(
    currentMax?.toString() || ""
  );

  // Sync with URL params
  useEffect(() => {
    setMinValue(currentMin?.toString() || "");
    setMaxValue(currentMax?.toString() || "");
  }, [currentMin, currentMax]);

  const applyFilter = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());

    const min = parseFloat(minValue);
    const max = parseFloat(maxValue);

    if (!isNaN(min) && min > 0) {
      params.set("minPrice", min.toString());
    } else {
      params.delete("minPrice");
    }

    if (!isNaN(max) && max > 0) {
      params.set("maxPrice", max.toString());
    } else {
      params.delete("maxPrice");
    }

    // Reset to page 1 when changing filters
    params.delete("page");

    router.push(`${pathname}?${params.toString()}`);
  }, [minValue, maxValue, searchParams, pathname, router]);

  // Debounced apply
  useEffect(() => {
    const timer = setTimeout(() => {
      const min = parseFloat(minValue);
      const max = parseFloat(maxValue);

      // Only apply if values are valid and different from current
      const minChanged = (!isNaN(min) ? min : undefined) !== currentMin;
      const maxChanged = (!isNaN(max) ? max : undefined) !== currentMax;

      if (minChanged || maxChanged) {
        applyFilter();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [minValue, maxValue, currentMin, currentMax, applyFilter]);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground">Price Range</h3>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          placeholder={`$${priceRange.min}`}
          value={minValue}
          onChange={(e) => setMinValue(e.target.value)}
          min={0}
          className="w-full"
        />
        <span className="text-muted-foreground">-</span>
        <Input
          type="number"
          placeholder={`$${priceRange.max}`}
          value={maxValue}
          onChange={(e) => setMaxValue(e.target.value)}
          min={0}
          className="w-full"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Range: ${priceRange.min} - ${priceRange.max}
      </p>
    </div>
  );
}
