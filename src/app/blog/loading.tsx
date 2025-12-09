/**
 * Blog Loading UI
 * Displays while blog content is being fetched
 */

export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-section-sm">
        {/* Header Skeleton */}
        <div className="text-center mb-12 animate-pulse">
          <div className="h-12 bg-muted rounded-lg w-48 mx-auto mb-heading" />
          <div className="h-6 bg-muted rounded-lg w-96 mx-auto" />
        </div>

        {/* Blog Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-sections">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="glass-card rounded-xl overflow-hidden animate-pulse"
            >
              <div className="h-48 bg-muted" />
              <div className="card-padding space-y-content">
                <div className="h-4 bg-muted rounded w-24" />
                <div className="h-6 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
