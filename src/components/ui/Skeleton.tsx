import { cn } from '@/utils/cn';

interface SkeletonProps {
  className?: string;
}

interface SkeletonTextProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-700",
        className
      )}
    />
  );
}

export function SkeletonText({ className, lines = 3 }: SkeletonTextProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton 
          key={i} 
          className={`h-4 ${
            i === 0 ? 'w-full' : 
            i === 1 ? 'w-4/5' : 
            i === lines - 1 ? 'w-3/5' : 'w-4/5'
          }`} 
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-lg border border-gray-200 dark:border-gray-700 p-6", className)}>
      <Skeleton className="h-12 w-12 rounded-full mb-4" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <SkeletonText className="mt-4" />
    </div>
  );
}

export function SkeletonButton({ className }: SkeletonProps) {
  return (
    <Skeleton className={cn("h-10 w-24 rounded-md", className)} />
  );
}

export function SkeletonAvatar({ className }: SkeletonProps) {
  return (
    <Skeleton className={cn("h-10 w-10 rounded-full", className)} />
  );
}

export function SkeletonBlogPost({ className }: SkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <Skeleton className="h-64 w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-3/4" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <SkeletonText />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-18 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonServiceCard({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-lg border border-gray-200 dark:border-gray-700 p-8", className)}>
      <Skeleton className="h-16 w-16 rounded-lg mb-4" />
      <Skeleton className="h-8 w-3/4 mb-4" />
      <SkeletonText />
      <Skeleton className="h-10 w-full mt-6 rounded-md" />
    </div>
  );
}

export function SkeletonPricingCard({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-lg border border-gray-200 dark:border-gray-700 p-8", className)}>
      <Skeleton className="h-8 w-1/2 mb-2" />
      <Skeleton className="h-12 w-3/4 mb-4" />
      <SkeletonText className="mb-6" />
      <div className="space-y-2 mb-6">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <Skeleton className="h-12 w-full rounded-md" />
    </div>
  );
}

export function SkeletonForm({ className }: SkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>
      <div>
        <Skeleton className="h-4 w-16 mb-2" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
      <div>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-32 w-full rounded-md" />
      </div>
      <Skeleton className="h-12 w-32 rounded-md" />
    </div>
  );
}