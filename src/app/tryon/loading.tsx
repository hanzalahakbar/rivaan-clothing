export default function TryOnLoading() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-4xl px-6 py-8 lg:px-8">
          <div className="h-5 bg-muted rounded w-24 animate-skeleton mb-4" />
          <div className="h-8 bg-muted rounded w-48 animate-skeleton" />
          <div className="h-5 bg-muted rounded w-64 mt-2 animate-skeleton" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="mx-auto max-w-4xl px-6 py-8 lg:px-8">
        <div className="glass rounded-lg p-8">
          {/* Progress skeleton */}
          <div className="flex flex-col items-center gap-6">
            <div className="w-24 h-24 bg-muted rounded-full animate-skeleton" />
            <div className="h-6 bg-muted rounded w-48 animate-skeleton" />
            <div className="w-full max-w-xs h-2 bg-muted rounded animate-skeleton" />
          </div>
        </div>
      </div>
    </main>
  );
}
