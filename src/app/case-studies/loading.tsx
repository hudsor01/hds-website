/**
 * Case Studies Loading UI
 * Displays while case studies content is being fetched
 */

export default function CaseStudiesLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-section-sm">
        {/* Header Skeleton */}
        <div className="text-center mb-12 animate-pulse">
          <div className="h-12 bg-muted rounded-lg w-56 mx-auto mb-heading" />
          <div className="h-6 bg-muted rounded-lg w-96 mx-auto" />
        </div>

        {/* Case Studies Grid Skeleton */}
        <div className="space-y-sections">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="glass-card overflow-hidden animate-pulse"
            >
              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-1/2 h-64 lg:h-80 bg-muted" />
                <div className="lg:w-1/2 space-y-comfortable">
                  <div className="flex items-center gap-content">
                    <div className="h-6 bg-muted rounded-full w-24" />
                    <div className="h-6 bg-muted rounded-full w-20" />
                  </div>
                  <div className="h-10 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                  <div className="grid grid-cols-3 gap-content mt-content-block">
                    <div className="text-center">
                      <div className="h-8 bg-muted rounded w-16 mx-auto mb-subheading" />
                      <div className="h-4 bg-muted rounded w-20 mx-auto" />
                    </div>
                    <div className="text-center">
                      <div className="h-8 bg-muted rounded w-16 mx-auto mb-subheading" />
                      <div className="h-4 bg-muted rounded w-20 mx-auto" />
                    </div>
                    <div className="text-center">
                      <div className="h-8 bg-muted rounded w-16 mx-auto mb-subheading" />
                      <div className="h-4 bg-muted rounded w-20 mx-auto" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
