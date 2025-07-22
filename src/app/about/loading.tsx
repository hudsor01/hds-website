import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';

export default function AboutLoading() {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto mb-4" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto mb-2" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto" />
          </div>
        </div>
        
        {/* Company Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3 mb-4" />
            <SkeletonText lines={5} />
          </div>
          <div className="relative">
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </div>
        
        {/* Values Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-1/4 mx-auto mb-4" />
            <Skeleton className="h-6 w-1/2 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
                <Skeleton className="h-6 w-2/3 mx-auto mb-2" />
                <SkeletonText lines={3} />
              </div>
            ))}
          </div>
        </div>
        
        {/* Team Section */}
        <div>
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-1/4 mx-auto mb-4" />
            <Skeleton className="h-6 w-1/2 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <Skeleton className="h-48 w-full rounded-lg mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <SkeletonText lines={2} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}