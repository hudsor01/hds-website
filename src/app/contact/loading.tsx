import { SkeletonForm, Skeleton } from '@/components/ui/Skeleton';

export default function ContactLoading() {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto mb-4" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <SkeletonForm />
          </div>
          
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <Skeleton className="h-8 w-1/2 mb-4" />
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-6 w-6 rounded mt-1" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Skeleton className="h-6 w-6 rounded mt-1" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Calendar Widget Skeleton */}
            <div>
              <Skeleton className="h-8 w-1/2 mb-4" />
              <Skeleton className="h-96 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}