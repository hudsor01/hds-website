/**
 * Portfolio Loading UI
 * Displays while portfolio content is being fetched
 */

import { Card } from "@/components/ui/card";

export default function PortfolioLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-section-sm">
        {/* Header Skeleton */}
        <div className="text-center mb-12 animate-pulse">
          <div className="h-12 bg-muted rounded-lg w-64 mx-auto mb-heading" />
          <div className="h-6 bg-muted rounded-lg w-80 mx-auto" />
        </div>

        {/* Portfolio Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-sections">
          {[...Array(4)].map((_, i) => (
            <Card
              key={i}
              variant="glass"
              size="none"
              className="overflow-hidden animate-pulse"
            >
              <div className="h-64 bg-muted" />
              <div className="card-padding space-y-content">
                <div className="flex items-center gap-tight">
                  <div className="h-4 bg-muted rounded w-20" />
                  <div className="h-4 bg-muted rounded w-16" />
                </div>
                <div className="h-8 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="flex gap-tight mt-4">
                  <div className="h-6 bg-muted rounded-full w-16" />
                  <div className="h-6 bg-muted rounded-full w-20" />
                  <div className="h-6 bg-muted rounded-full w-14" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
