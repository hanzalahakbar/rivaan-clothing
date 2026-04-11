"use client";

import { useRouter, usePathname } from "next/navigation";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui";

interface NoResultsProps {
  hasFilters: boolean;
}

export function NoResults({ hasFilters }: NoResultsProps) {
  const router = useRouter();
  const pathname = usePathname();

  const clearFilters = () => {
    router.push(pathname);
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <SearchX className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        No products found
      </h3>
      <p className="text-muted-foreground max-w-md mb-6">
        {hasFilters
          ? "We couldn't find any products matching your filters. Try adjusting your search criteria."
          : "There are no products available at the moment. Please check back later."}
      </p>
      {hasFilters && (
        <Button onClick={clearFilters} variant="outline">
          Clear All Filters
        </Button>
      )}
    </div>
  );
}
