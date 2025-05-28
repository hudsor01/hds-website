import { Skeleton } from '@/components/ui/skeleton'

export function DashboardSkeleton() {
  return (
    <div className='space-y-8'>
      {/* Analytics cards skeleton */}
      <div className='grid gap-4 md:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='bg-card p-6 rounded-lg border'>
            <Skeleton className='h-4 w-20 mb-2' />
            <Skeleton className='h-8 w-16' />
          </div>
        ))}
      </div>

      {/* Services section skeleton */}
      <div>
        <Skeleton className='h-6 w-32 mb-4' />
        <div className='grid gap-4 md:grid-cols-3'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='bg-card p-4 rounded-lg border'>
              <Skeleton className='h-5 w-3/4 mb-2' />
              <Skeleton className='h-4 w-16' />
            </div>
          ))}
        </div>
      </div>

      {/* Case studies section skeleton */}
      <div>
        <Skeleton className='h-6 w-40 mb-4' />
        <div className='grid gap-4 md:grid-cols-2'>
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className='bg-card p-4 rounded-lg border'>
              <Skeleton className='h-5 w-5/6 mb-2' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-3/4' />
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials section skeleton */}
      <div>
        <Skeleton className='h-6 w-48 mb-4' />
        <div className='space-y-4'>
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className='bg-card p-4 rounded-lg border'>
              <Skeleton className='h-4 w-full mb-2' />
              <Skeleton className='h-4 w-5/6 mb-2' />
              <Skeleton className='h-3 w-1/2' />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}