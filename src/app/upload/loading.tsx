export default function UploadLoading() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-2xl px-6 py-8 lg:px-8 text-center">
          <div className="h-8 bg-muted rounded w-48 mx-auto animate-skeleton" />
          <div className="h-5 bg-muted rounded w-64 mx-auto mt-2 animate-skeleton" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="mx-auto max-w-2xl px-6 py-8 lg:px-8">
        <div className="glass rounded-lg p-8">
          {/* Upload area skeleton */}
          <div className="h-64 bg-muted rounded-lg animate-skeleton" />

          {/* Button skeleton */}
          <div className="mt-6 flex justify-center">
            <div className="h-10 bg-muted rounded w-40 animate-skeleton" />
          </div>
        </div>
      </div>
    </main>
  );
}
