import { ProductGridSkeleton } from "@/components/catalog";

export default function CatalogLoading() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <div className="h-9 bg-muted rounded w-48 animate-skeleton" />
          <div className="mt-2 h-5 bg-muted rounded w-72 animate-skeleton" />
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter Sidebar Skeleton */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="glass rounded-lg p-6 space-y-6">
              <div className="h-6 bg-muted rounded w-20 animate-skeleton" />
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-9 bg-muted rounded animate-skeleton"
                  />
                ))}
              </div>
              <div className="h-6 bg-muted rounded w-24 animate-skeleton" />
              <div className="flex gap-2">
                <div className="h-10 bg-muted rounded flex-1 animate-skeleton" />
                <div className="h-10 bg-muted rounded flex-1 animate-skeleton" />
              </div>
            </div>
          </aside>

          {/* Product Grid Skeleton */}
          <div className="flex-1">
            <ProductGridSkeleton />
          </div>
        </div>
      </div>
    </main>
  );
}
