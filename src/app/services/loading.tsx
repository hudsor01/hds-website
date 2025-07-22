import { SkeletonServiceCard } from '@/components/ui/Skeleton';

export default function ServicesLoading() {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="text-center mb-16">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto mb-4" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto" />
          </div>
        </div>
        
        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonServiceCard key={i} />
          ))}
        </div>
        
        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto mb-4" />
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-40 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}