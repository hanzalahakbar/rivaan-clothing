export default function ProductDetailLoading() {
  return (
    <main className="min-h-screen bg-background">
      {/* Breadcrumb Skeleton */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <div className="h-5 bg-muted rounded w-32 animate-skeleton" />
        </div>
      </div>

      {/* Product Content Skeleton */}
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image Skeleton */}
          <div className="aspect-[3/4] bg-muted rounded-lg animate-skeleton" />

          {/* Product Info Skeleton */}
          <div className="flex flex-col">
            {/* Category */}
            <div className="h-5 bg-muted rounded w-20 animate-skeleton mb-4" />

            {/* Name */}
            <div className="h-9 bg-muted rounded w-3/4 animate-skeleton" />

            {/* Price */}
            <div className="mt-4 h-8 bg-muted rounded w-24 animate-skeleton" />

            {/* Description */}
            <div className="mt-6 space-y-2">
              <div className="h-4 bg-muted rounded w-20 animate-skeleton" />
              <div className="h-4 bg-muted rounded w-full animate-skeleton" />
              <div className="h-4 bg-muted rounded w-full animate-skeleton" />
              <div className="h-4 bg-muted rounded w-2/3 animate-skeleton" />
            </div>

            {/* Button */}
            <div className="mt-8 space-y-4">
              <div className="h-12 bg-muted rounded animate-skeleton" />
              <div className="h-4 bg-muted rounded w-3/4 mx-auto animate-skeleton" />
            </div>

            {/* Additional Info */}
            <div className="mt-auto pt-8 border-t border-border">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-20 animate-skeleton" />
                  <div className="h-4 bg-muted rounded w-16 animate-skeleton" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-20 animate-skeleton" />
                  <div className="h-4 bg-muted rounded w-16 animate-skeleton" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
