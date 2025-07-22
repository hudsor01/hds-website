import { SkeletonBlogPost } from '@/components/ui/Skeleton';

export default function BlogLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto mb-4" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonBlogPost key={i} />
        ))}
      </div>
    </div>
  );
}