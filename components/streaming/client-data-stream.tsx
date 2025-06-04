'use client'

import { use } from 'react'
import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Define the shape of streamed data items
interface StreamedDataItem {
  id?: string | number
  title: string
  description: string
  price?: string
}

// Client component that uses the `use` hook to stream data
function ClientDataContent({ 
  dataPromise, 
}: { 
  dataPromise: Promise<StreamedDataItem[]> 
}) {
  // Use the `use` hook to read the promise
  const data = use(dataPromise)

  return (
    <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
      {data.map((item, index) => (
        <Card key={item.id || index} className='hover:shadow-lg transition-shadow'>
          <CardHeader>
            <CardTitle className='text-lg'>{item.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              {item.description}
            </CardDescription>
            {item.price && (
              <div className='mt-4 text-lg font-semibold text-primary'>
                {item.price}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Loading skeleton for client data
function ClientDataSkeleton() {
  return (
    <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className='h-6 w-3/4' />
          </CardHeader>
          <CardContent className='space-y-3'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-5/6' />
            <Skeleton className='h-6 w-20' />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Main component that demonstrates client-side streaming
export function ClientDataStream({ 
  dataPromise,
  title = 'Data Stream',
  description = 'Streaming data to the client component',
}: { 
  dataPromise: Promise<StreamedDataItem[]>
  title?: string
  description?: string
}) {
  return (
    <div>
      <div className='text-center mb-8'>
        <h2 className='text-3xl font-bold tracking-tight mb-4'>{title}</h2>
        <p className='text-muted-foreground max-w-2xl mx-auto'>
          {description}
        </p>
      </div>

      {/* Suspense boundary for client-side streaming */}
      <Suspense fallback={<ClientDataSkeleton />}>
        <ClientDataContent dataPromise={dataPromise} />
      </Suspense>
    </div>
  )
}

// Example usage component (would be imported in a page)
export function ClientDataStreamExample() {
  // Don't await the promise - pass it to the client component
  const dataPromise = fetch('/api/data').then(res => res.json()) as Promise<StreamedDataItem[]>

  return (
    <ClientDataStream 
      dataPromise={dataPromise}
      title='Live Data Feed'
      description="This data is streamed directly to the client using React's use hook"
    />
  )
}