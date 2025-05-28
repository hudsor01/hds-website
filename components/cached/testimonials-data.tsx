// Note: 'use cache' directive requires Next.js canary version
// For stable Next.js 15, we'll use React.cache() as an alternative

import { unstable_cache } from 'next/cache'

// Cached testimonials data fetcher using unstable_cache
export const getTestimonialsData = unstable_cache(
  async () => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 800))
  
  return [
    {
      id: 1,
      name: 'Sarah Johnson',
      company: 'TechStart Solutions',
      role: 'CEO',
      content: 'Hudson Digital Solutions transformed our revenue operations completely. We saw a 300% increase in qualified leads within the first quarter.',
      rating: 5,
      image: '/images/testimonials/sarah-johnson.jpg',
      date: '2024-12-15',
    },
    {
      id: 2,
      name: 'Michael Chen',
      company: 'DataFlow Analytics',
      role: 'VP of Operations',
      content: 'The custom dashboard they built gives us real-time insights that have revolutionized our decision-making process. ROI was evident within weeks.',
      rating: 5,
      image: '/images/testimonials/michael-chen.jpg',
      date: '2024-11-28',
    },
    {
      id: 3,
      name: 'Emma Rodriguez',
      company: 'Growth Dynamics',
      role: 'Marketing Director',
      content: 'Their automation solutions saved us 20+ hours per week on manual processes. The team is incredibly knowledgeable and responsive.',
      rating: 5,
      image: '/images/testimonials/emma-rodriguez.jpg',
      date: '2024-11-10',
    },
    {
      id: 4,
      name: 'David Thompson',
      company: 'Scale Ventures',
      role: 'Founder',
      content: 'Working with Hudson Digital was a game-changer. They didn\'t just build what we asked for – they improved our entire business strategy.',
      rating: 5,
      image: '/images/testimonials/david-thompson.jpg',
      date: '2024-10-22',
    },
    {
      id: 5,
      name: 'Lisa Park',
      company: 'InnovateCorp',
      role: 'CTO',
      content: 'The technical expertise and business acumen they brought to our project was exceptional. Highly recommend for any serious business transformation.',
      rating: 5,
      image: '/images/testimonials/lisa-park.jpg',
      date: '2024-10-05',
    },
  ]
  },
  ['testimonials'], // cache key
  {
    revalidate: 3600, // revalidate every hour
    tags: ['testimonials', 'user-content'],
  },
)

// Cached component that uses the data
export default async function TestimonialsData() {
  const testimonials = await getTestimonialsData()
  
  return (
    <div className='space-y-6'>
      <div className='text-center mb-8'>
        <h3 className='text-2xl font-bold text-gray-900 mb-2'>
          What Our Clients Say
        </h3>
        <p className='text-gray-600'>
          Real results from real businesses we&apos;ve transformed
        </p>
      </div>
      
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className='bg-white p-6 rounded-lg shadow-md border border-gray-200'
          >
            <div className='flex items-center mb-4'>
              <div className='w-12 h-12 bg-gray-300 rounded-full flex-shrink-0 mr-4'>
                {/* Placeholder for image */}
                <div className='w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center'>
                  <span className='text-white font-semibold text-lg'>
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              </div>
              <div>
                <h4 className='font-semibold text-gray-900'>{testimonial.name}</h4>
                <p className='text-sm text-gray-600'>{testimonial.role}</p>
                <p className='text-sm text-blue-600 font-medium'>{testimonial.company}</p>
              </div>
            </div>
            
            <div className='mb-4'>
              <div className='flex text-yellow-400 mb-2'>
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <p className='text-gray-700 text-sm leading-relaxed'>
                &quot;{testimonial.content}&quot;
              </p>
            </div>
            
            <div className='text-xs text-gray-500'>
              {new Date(testimonial.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}