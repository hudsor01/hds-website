import { Suspense, use } from 'react'
import { AnimatedTestimonials } from '@/components/aceternity/animated-testimonials'

interface Testimonial {
  quote: string
  name: string
  designation: string
  src: string
}

// Mock API function - replace with your actual tRPC call
async function fetchTestimonials() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return [
    {
      quote: 'Hudson Digital Solutions transformed our entire sales process. We went from manual lead tracking to a fully automated CRM system that increased our conversion rate by 40%. Richard\'s enterprise-level expertise made all the difference.',
      name: 'Michael Rodriguez',
      designation: 'Business Owner, DFW Property Management',
      src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&crop=face',
    },
    {
      quote: 'The Spotio CRM deduplication project was a game-changer. Richard cleaned up over 32,000 duplicate leads and our sales team\'s efficiency improved by 60%. Best investment we\'ve made in our operations.',
      name: 'Sarah Chen',
      designation: 'VP of Sales, Enterprise Software Co.',
      src: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=500&h=500&fit=crop&crop=face',
    },
    {
      quote: 'Working with Hudson Digital was like having a Fortune 500 operations team dedicated to our small business. The automation systems they built save us 15 hours per week and eliminated our manual errors.',
      name: 'David Thompson',
      designation: 'CEO, Texas Manufacturing Inc.',
      src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&h=500&fit=crop&crop=face',
    },
    {
      quote: 'The tattoo booking system Richard built doubled our booking efficiency and reduced no-shows by 80%. Our revenue increased 45% in the first quarter after implementation.',
      name: 'Maria Santos',
      designation: 'Owner, Artisan Tattoo Studio',
      src: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=500&fit=crop&crop=face',
    },
  ]
}

// React 19 Server Component using use() hook
function TestimonialsData({ testimonialsPromise }: { testimonialsPromise: Promise<Testimonial[]> }) {
  const testimonials = use(testimonialsPromise)
  
  return <AnimatedTestimonials testimonials={testimonials} autoplay={true} />
}

// Loading fallback component
function TestimonialsLoading() {
  return (
    <div className='mx-auto max-w-sm px-4 py-20 font-sans antialiased md:max-w-4xl md:px-8 lg:px-12'>
      <div className='relative grid grid-cols-1 gap-20 md:grid-cols-2'>
        {/* Image skeleton */}
        <div className='relative h-80 w-full'>
          <div className='absolute inset-0 bg-gray-200 rounded-3xl animate-pulse' />
        </div>
        
        {/* Content skeleton */}
        <div className='flex flex-col justify-between py-4'>
          <div className='space-y-4'>
            <div className='h-8 bg-gray-200 rounded animate-pulse' />
            <div className='h-4 bg-gray-200 rounded w-2/3 animate-pulse' />
            <div className='space-y-2'>
              <div className='h-4 bg-gray-200 rounded animate-pulse' />
              <div className='h-4 bg-gray-200 rounded animate-pulse' />
              <div className='h-4 bg-gray-200 rounded w-4/5 animate-pulse' />
            </div>
          </div>
          <div className='flex gap-4 pt-12'>
            <div className='h-7 w-7 bg-gray-200 rounded-full animate-pulse' />
            <div className='h-7 w-7 bg-gray-200 rounded-full animate-pulse' />
          </div>
        </div>
      </div>
    </div>
  )
}

// Main component with Suspense boundary
export function TestimonialsServerSection() {
  const testimonialsPromise = fetchTestimonials()
  
  return (
    <section className='py-20 bg-gray-50'>
      <div className='container mx-auto px-6'>
        <div className='text-center mb-16'>
          <h2 className='text-4xl font-bold text-gray-900 mb-4'>
            Real Results from Real Businesses
          </h2>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            See how enterprise-level revenue operations transformed these small businesses in Dallas-Fort Worth
          </p>
        </div>
        
        <Suspense fallback={<TestimonialsLoading />}>
          <TestimonialsData testimonialsPromise={testimonialsPromise} />
        </Suspense>
      </div>
    </section>
  )
}