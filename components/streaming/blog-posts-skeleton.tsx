import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function BlogPostsSkeleton() {
  return (
    <div className='grid gap-6 md:grid-cols-2'>
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className='flex items-center gap-2 mb-2'>
              <Skeleton className='h-4 w-20' />
              <span>•</span>
              <Skeleton className='h-4 w-16' />
              <span>•</span>
              <Skeleton className='h-4 w-12' />
            </div>
            <Skeleton className='h-6 w-3/4' />
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-5/6' />
              <Skeleton className='h-4 w-4/6' />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}