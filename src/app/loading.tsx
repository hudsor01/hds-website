import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen">
      {/* Hero Section Skeleton */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <Skeleton className="h-16 w-3/4 mx-auto mb-6" />
            <Skeleton className="h-8 w-2/3 mx-auto mb-8" />
            <div className="flex justify-center gap-4">
              <Skeleton className="h-12 w-40 rounded-md" />
              <Skeleton className="h-12 w-40 rounded-md" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section Skeleton */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-16 w-16 rounded-lg mx-auto mb-4" />
                <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-5/6 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}