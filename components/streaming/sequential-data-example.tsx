import { Suspense } from 'react'
import { preloadServices } from '@/lib/data-fetchers'

// Mock functions for sequential dependency example
async function getUserProfile(userId: string) {
  await new Promise(resolve => setTimeout(resolve, 150))
  return {
    id: userId,
    name: 'John Doe',
    preferredServiceCategory: 'revenue-operations',
    company: 'Tech Startup Inc.',
  }
}

async function getRecommendedServices(_category: string) {
  await new Promise(resolve => setTimeout(resolve, 100))
  // This would filter services based on user preference
  return [
    {
      id: 'revenue-operations-audit',
      title: 'Revenue Operations Audit',
      description: 'Comprehensive audit of your current RevOps setup',
      price: '$299',
      recommended: true,
    },
    {
      id: 'crm-optimization',
      title: 'CRM Optimization',
      description: 'Optimize your CRM for better lead management',
      price: '$599',
      recommended: true,
    },
  ]
}

// Sequential data fetching component (dependent data)
async function UserRecommendations({ userId }: { userId: string }) {
  // First, fetch user profile
  const userProfile = await getUserProfile(userId)
  
  // Then fetch recommended services based on user preference
  // This depends on the result of the first fetch
  const recommendedServices = await getRecommendedServices(userProfile.preferredServiceCategory)

  return (
    <div className='space-y-6'>
      <div className='bg-card p-6 rounded-lg border'>
        <h3 className='text-lg font-semibold mb-2'>Welcome back, {userProfile.name}!</h3>
        <p className='text-muted-foreground'>
          Based on your profile at {userProfile.company}, here are our recommendations:
        </p>
      </div>
      
      <div className='space-y-4'>
        <h4 className='text-md font-medium'>Recommended Services</h4>
        {recommendedServices.map((service) => (
          <div key={service.id} className='bg-card p-4 rounded-lg border'>
            <div className='flex items-start justify-between'>
              <div>
                <h5 className='font-medium'>{service.title}</h5>
                <p className='text-sm text-muted-foreground'>{service.description}</p>
              </div>
              <div className='text-right'>
                <p className='font-semibold text-primary'>{service.price}</p>
                {service.recommended && (
                  <span className='text-xs bg-primary/10 text-primary px-2 py-1 rounded'>
                    Recommended
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Loading state for sequential data
function UserRecommendationsSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='bg-card p-6 rounded-lg border'>
        <div className='animate-pulse'>
          <div className='h-6 bg-muted rounded w-1/3 mb-2'></div>
          <div className='h-4 bg-muted rounded w-2/3'></div>
        </div>
      </div>
      
      <div className='space-y-4'>
        <div className='h-5 bg-muted rounded w-1/4'></div>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className='bg-card p-4 rounded-lg border'>
            <div className='animate-pulse'>
              <div className='flex justify-between items-start'>
                <div className='flex-1'>
                  <div className='h-5 bg-muted rounded w-3/4 mb-2'></div>
                  <div className='h-4 bg-muted rounded w-full'></div>
                </div>
                <div className='ml-4'>
                  <div className='h-5 bg-muted rounded w-16 mb-1'></div>
                  <div className='h-4 bg-muted rounded w-20'></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Main component demonstrating sequential data fetching
export function SequentialDataExample({ userId }: { userId: string }) {
  // Preload some data that might be needed later
  preloadServices()

  return (
    <div>
      <div className='mb-6'>
        <h2 className='text-2xl font-bold tracking-tight'>Personalized Dashboard</h2>
        <p className='text-muted-foreground'>
          Customized recommendations based on your profile and preferences.
        </p>
      </div>

      {/* Sequential data with Suspense for streaming */}
      <Suspense fallback={<UserRecommendationsSkeleton />}>
        <UserRecommendations userId={userId} />
      </Suspense>
    </div>
  )
}