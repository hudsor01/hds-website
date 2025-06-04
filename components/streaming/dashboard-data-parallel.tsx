import { Suspense } from 'react'
import { getServices, getCaseStudies, getTestimonials, getAnalyticsData } from '@/lib/data-fetchers'
import { DashboardSkeleton } from './dashboard-skeleton'

// Server Component that fetches all data in parallel
async function DashboardContent() {
  // Initiate all data fetching in parallel (don't await individually)
  const servicesPromise = getServices()
  const caseStudiesPromise = getCaseStudies()
  const testimonialsPromise = getTestimonials()
  const analyticsPromise = getAnalyticsData()

  // Wait for all promises to resolve in parallel
  const [services, caseStudies, testimonials, analytics] = await Promise.all([
    servicesPromise,
    caseStudiesPromise,
    testimonialsPromise,
    analyticsPromise,
  ])

  return (
    <div className='space-y-8'>
      {/* Analytics Overview */}
      <div className='grid gap-4 md:grid-cols-4'>
        <div className='bg-card p-6 rounded-lg border'>
          <h3 className='text-sm font-medium text-muted-foreground'>Total Leads</h3>
          <p className='text-2xl font-bold'>{analytics.totalLeads.toLocaleString()}</p>
        </div>
        <div className='bg-card p-6 rounded-lg border'>
          <h3 className='text-sm font-medium text-muted-foreground'>Conversion Rate</h3>
          <p className='text-2xl font-bold'>{analytics.conversionRate}%</p>
        </div>
        <div className='bg-card p-6 rounded-lg border'>
          <h3 className='text-sm font-medium text-muted-foreground'>Revenue Growth</h3>
          <p className='text-2xl font-bold'>+{analytics.revenueGrowth}%</p>
        </div>
        <div className='bg-card p-6 rounded-lg border'>
          <h3 className='text-sm font-medium text-muted-foreground'>Client Satisfaction</h3>
          <p className='text-2xl font-bold'>{analytics.clientSatisfaction}%</p>
        </div>
      </div>

      {/* Services Summary */}
      <div>
        <h3 className='text-lg font-semibold mb-4'>Services ({services.length})</h3>
        <div className='grid gap-4 md:grid-cols-3'>
          {services.map((service) => (
            <div key={service.id} className='bg-card p-4 rounded-lg border'>
              <h4 className='font-medium'>{service.title}</h4>
              <p className='text-sm text-muted-foreground'>{service.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Case Studies Summary */}
      <div>
        <h3 className='text-lg font-semibold mb-4'>Case Studies ({caseStudies.length})</h3>
        <div className='grid gap-4 md:grid-cols-2'>
          {caseStudies.map((study) => (
            <div key={study.id} className='bg-card p-4 rounded-lg border'>
              <h4 className='font-medium'>{study.title}</h4>
              <p className='text-sm text-muted-foreground'>{study.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials Summary */}
      <div>
        <h3 className='text-lg font-semibold mb-4'>Recent Testimonials ({testimonials.length})</h3>
        <div className='space-y-4'>
          {testimonials.slice(0, 2).map((testimonial) => (
            <div key={testimonial.id} className='bg-card p-4 rounded-lg border'>
              <p className='text-sm mb-2'>&apos;{testimonial.content}&apos;</p>
              <p className='text-xs text-muted-foreground'>
                — {testimonial.name}, {testimonial.role} at {testimonial.company}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Alternative version with error handling using Promise.allSettled
async function DashboardContentSafe() {
  // Initiate all data fetching in parallel with error handling
  const results = await Promise.allSettled([
    getServices(),
    getCaseStudies(),
    getTestimonials(),
    getAnalyticsData(),
  ])

  // Extract successful results and handle failures
  const services = results[0].status === 'fulfilled' ? results[0].value : []
  const _caseStudies = results[1].status === 'fulfilled' ? results[1].value : []
  const _testimonials = results[2].status === 'fulfilled' ? results[2].value : []
  const analytics = results[3].status === 'fulfilled' ? results[3].value : {
    totalLeads: 0,
    conversionRate: 0,
    revenueGrowth: 0,
    clientSatisfaction: 0,
  }

  // Log any failures for debugging
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`Data fetch ${index} failed:`, result.reason)
    }
  })

  return (
    <div className='space-y-8'>
      {/* Same content as above but with error handling */}
      <div className='grid gap-4 md:grid-cols-4'>
        <div className='bg-card p-6 rounded-lg border'>
          <h3 className='text-sm font-medium text-muted-foreground'>Total Leads</h3>
          <p className='text-2xl font-bold'>{analytics.totalLeads.toLocaleString()}</p>
        </div>
        <div className='bg-card p-6 rounded-lg border'>
          <h3 className='text-sm font-medium text-muted-foreground'>Conversion Rate</h3>
          <p className='text-2xl font-bold'>{analytics.conversionRate}%</p>
        </div>
        <div className='bg-card p-6 rounded-lg border'>
          <h3 className='text-sm font-medium text-muted-foreground'>Revenue Growth</h3>
          <p className='text-2xl font-bold'>+{analytics.revenueGrowth}%</p>
        </div>
        <div className='bg-card p-6 rounded-lg border'>
          <h3 className='text-sm font-medium text-muted-foreground'>Client Satisfaction</h3>
          <p className='text-2xl font-bold'>{analytics.clientSatisfaction}%</p>
        </div>
      </div>

      {services.length > 0 && (
        <div>
          <h3 className='text-lg font-semibold mb-4'>Services ({services.length})</h3>
          <div className='grid gap-4 md:grid-cols-3'>
            {services.map((service) => (
              <div key={service.id} className='bg-card p-4 rounded-lg border'>
                <h4 className='font-medium'>{service.title}</h4>
                <p className='text-sm text-muted-foreground'>{service.price}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Main dashboard component with streaming
export function DashboardDataParallel({ safe = false }: { safe?: boolean }) {
  return (
    <div>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
        <p className='text-muted-foreground'>
          Overview of your business metrics and performance.
        </p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        {safe ? <DashboardContentSafe /> : <DashboardContent />}
      </Suspense>
    </div>
  )
}