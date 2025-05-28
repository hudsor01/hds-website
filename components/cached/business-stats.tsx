// Note: 'use cache' directive requires Next.js canary version
// For stable Next.js 15, we'll use React.cache() as an alternative

import { cache } from 'react'

// Cached business statistics function using React.cache()
const getBusinessStats = cache(async () => {
  // Simulate data fetching with a delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return {
    clientsServed: 150,
    projectsCompleted: 320,
    averageROI: 285,
    yearsExperience: 8,
    revenueIncreased: 25000000,
    lastUpdated: new Date().toISOString(),
  }
})

// This component will be cached automatically due to 'use cache' directive
export default async function BusinessStats() {
  const stats = await getBusinessStats()
  
  return (
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6'>
      <div className='text-center'>
        <div className='text-3xl font-bold text-blue-600'>
          {stats.clientsServed}+
        </div>
        <div className='text-sm text-gray-600'>
          Clients Served
        </div>
      </div>
      
      <div className='text-center'>
        <div className='text-3xl font-bold text-green-600'>
          {stats.projectsCompleted}+
        </div>
        <div className='text-sm text-gray-600'>
          Projects Completed
        </div>
      </div>
      
      <div className='text-center'>
        <div className='text-3xl font-bold text-purple-600'>
          {stats.averageROI}%
        </div>
        <div className='text-sm text-gray-600'>
          Average ROI
        </div>
      </div>
      
      <div className='text-center'>
        <div className='text-3xl font-bold text-orange-600'>
          {stats.yearsExperience}
        </div>
        <div className='text-sm text-gray-600'>
          Years Experience
        </div>
      </div>
      
      <div className='text-center'>
        <div className='text-3xl font-bold text-red-600'>
          ${(stats.revenueIncreased / 1000000).toFixed(1)}M
        </div>
        <div className='text-sm text-gray-600'>
          Revenue Increased
        </div>
      </div>
    </div>
  )
}

// Skeleton component for loading state
export function BusinessStatsSkeleton() {
  return (
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6'>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className='text-center'>
          <div className='w-16 h-8 bg-gray-200 animate-pulse rounded mx-auto mb-2'></div>
          <div className='w-20 h-4 bg-gray-200 animate-pulse rounded mx-auto'></div>
        </div>
      ))}
    </div>
  )
}