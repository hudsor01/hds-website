import { Skeleton } from '@/components/ui/Skeleton';

export default function PortfolioLoading() {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto mb-4" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto" />
          </div>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex justify-center mb-12">
          <div className="flex space-x-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-24 rounded-full" />
            ))}
          </div>
        </div>
        
        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="group relative overflow-hidden rounded-lg shadow-lg">
              {/* Image Skeleton */}
              <Skeleton className="h-64 w-full" />
              
              {/* Overlay Content */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-6 flex flex-col justify-end">
                <Skeleton className="h-6 w-3/4 mb-2 bg-gray-300" />
                <Skeleton className="h-4 w-1/2 mb-4 bg-gray-300" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded bg-gray-300" />
                  <Skeleton className="h-6 w-16 rounded bg-gray-300" />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Case Studies Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-1/3 mx-auto mb-4" />
            <Skeleton className="h-6 w-1/2 mx-auto" />
          </div>
          
          <div className="space-y-16">
            {[1, 2].map((i) => (
              <div key={i} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className={i % 2 === 0 ? 'lg:order-2' : ''}>
                  <Skeleton className="h-8 w-2/3 mb-4" />
                  <div className="space-y-4 mb-6">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j}>
                        <Skeleton className="h-12 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    ))}
                  </div>
                  <Skeleton className="h-12 w-40" />
                </div>
                <div className={i % 2 === 0 ? 'lg:order-1' : ''}>
                  <Skeleton className="h-96 w-full rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}