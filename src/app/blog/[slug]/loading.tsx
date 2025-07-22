import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';

export default function BlogPostLoading() {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero Image Skeleton */}
      <Skeleton className="h-96 w-full rounded-lg mb-8" />
      
      {/* Title */}
      <Skeleton className="h-12 w-4/5 mb-4" />
      
      {/* Meta Information */}
      <div className="flex items-center gap-4 mb-8">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-28" />
      </div>
      
      {/* Tags */}
      <div className="flex gap-2 mb-8">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>
      
      {/* Content */}
      <div className="prose prose-lg max-w-none space-y-6">
        <SkeletonText className="mb-6" />
        <SkeletonText className="mb-6" />
        <Skeleton className="h-64 w-full rounded-lg mb-6" />
        <SkeletonText className="mb-6" />
        <SkeletonText />
      </div>
      
      {/* Call to Action */}
      <div className="mt-12 p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <Skeleton className="h-8 w-1/2 mb-4" />
        <SkeletonText className="mb-6" />
        <Skeleton className="h-12 w-40 rounded-md" />
      </div>
    </article>
  );
}