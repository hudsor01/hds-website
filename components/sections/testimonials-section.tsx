import { m } from 'framer-motion'
import Image from 'next/image'
import { Star, Quote } from 'lucide-react'
import { getTestimonials } from '@/lib/data-fetchers'
import { Suspense, use } from 'react'
import { AnimatedTestimonials } from '@/components/aceternity/animated-testimonials'

// Types
export interface Testimonial {
  name: string
  role: string
  company: string
  content: string
  rating: number
  image: string
}

export interface TestimonialsSectionProps {
  title?: string
  subtitle?: string
  testimonials?: Testimonial[]
  sectionId?: string
  className?: string
  bgColor?: string
  showDivider?: boolean
  columns?: 1 | 2 | 3 | 4
  cardStyle?: 'default' | 'minimal' | 'accent' | 'animated'
  useRealData?: boolean // New prop to fetch real testimonials
}

// Default testimonials
const defaultTestimonials: Testimonial[] = [
  {
    name: 'David Chen',
    role: 'CEO',
    company: 'TechCorp Inc.',
    content:
      'Hudson Digital Solutions transformed our legacy systems into modern, scalable applications. Their expertise in self-hosted solutions gave us complete control over our infrastructure.',
    rating: 5,
    image: '/images/default-avatar.jpg',
  },
  {
    name: 'Robert Martinez',
    role: 'CTO',
    company: 'FinanceFlow',
    content:
      'The revenue operations tools they built for us handle millions in transactions. Their attention to performance and security is unmatched.',
    rating: 5,
    image: '/images/default-avatar.jpg',
  },
  {
    name: 'James Wilson',
    role: 'Head of Engineering',
    company: 'Enterprise Corp',
    content:
      'Their team delivered a complex PWA that works flawlessly offline. The modern tech stack they recommended has accelerated our development velocity.',
    rating: 5,
    image: '/images/default-avatar.jpg',
  },
]

// Loading skeleton component
function TestimonialsLoading() {
  return (
    <div className='grid md:grid-cols-3 gap-8 max-w-6xl mx-auto'>
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className='bg-white p-8 rounded-lg border border-slate-200 animate-pulse'
        >
          <div className='flex mb-6 gap-1'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='w-4 h-4 bg-slate-200 rounded' />
            ))}
          </div>
          <div className='space-y-3 mb-8'>
            <div className='h-4 bg-slate-200 rounded w-full' />
            <div className='h-4 bg-slate-200 rounded w-3/4' />
            <div className='h-4 bg-slate-200 rounded w-5/6' />
          </div>
          <div className='flex items-center pt-6 border-t border-slate-100'>
            <div className='w-14 h-14 bg-slate-200 rounded-full mr-4' />
            <div className='space-y-2'>
              <div className='h-4 bg-slate-200 rounded w-24' />
              <div className='h-3 bg-slate-200 rounded w-20' />
              <div className='h-3 bg-slate-200 rounded w-28' />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Server Component for fetching testimonials with React 19 use() hook
function TestimonialsData({ testimonialsPromise }: { testimonialsPromise: Promise<Testimonial[]> }) {
  const testimonials = use(testimonialsPromise)
  return <AnimatedTestimonials testimonials={testimonials} autoplay={true} />
}

// Main Server Component
export function TestimonialsSection({
  title = 'Client Success Stories',
  subtitle = 'Trusted by industry leaders to deliver exceptional digital solutions',
  testimonials,
  sectionId = 'testimonials',
  className = '',
  bgColor = 'bg-gradient-to-b from-white to-slate-50',
  showDivider = true,
  // columns = 3, // Unused parameter
  cardStyle = 'animated',
  useRealData = false,
}: TestimonialsSectionProps) {
  // Determine which testimonials to use
  const displayTestimonials = testimonials || defaultTestimonials

  // If using animated Aceternity UI version
  if (cardStyle === 'animated') {
    return (
      <section id={sectionId} className={`py-20 ${bgColor} ${className}`}>
        <div className='container mx-auto px-6'>
          <div className='text-center mb-16'>
            <m.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className='text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700'
            >
              {title}
            </m.h2>
            {showDivider && (
              <div className='w-20 h-1 bg-gradient-to-r from-blue-600 to-sky-600 mx-auto mb-6' />
            )}
            <m.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className='text-lg text-slate-600 max-w-2xl mx-auto'
            >
              {subtitle}
            </m.p>
          </div>

          {useRealData ? (
            <Suspense fallback={<TestimonialsLoading />}>
              <TestimonialsData testimonialsPromise={getTestimonials()} />
            </Suspense>
          ) : (
            <AnimatedTestimonials testimonials={displayTestimonials} autoplay={true} />
          )}
        </div>
      </section>
    )
  }
  // Original variant with traditional card layout
  return (
    <section id={sectionId} className={`py-20 ${bgColor} ${className}`}>
      <div className='container mx-auto px-6'>
        <div className='text-center mb-16'>
          <m.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className='text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700'
          >
            {title}
          </m.h2>
          {showDivider && (
            <div className='w-20 h-1 bg-gradient-to-r from-blue-600 to-sky-600 mx-auto mb-6' />
          )}
          <m.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className='text-lg text-slate-600 max-w-2xl mx-auto'
          >
            {subtitle}
          </m.p>
        </div>

        {useRealData ? (
          <Suspense fallback={<TestimonialsLoading />}>
            <TestimonialsData testimonialsPromise={getTestimonials()} />
          </Suspense>
        ) : (
          <div className={'testimonials-grid gap-8 max-w-6xl mx-auto container'}>
            {displayTestimonials.map((testimonial, index) => (
              <m.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`testimonial-card bg-white p-8 rounded-lg scroll-reveal ${
                  cardStyle === 'minimal'
                    ? 'shadow-sm'
                    : 'border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300'
                } group relative overflow-hidden`}
              >
                {/* Accent line - only for default and accent card styles */}
                {cardStyle !== 'minimal' && (
                  <div
                    className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-sky-600 ${
                      cardStyle === 'accent'
                        ? 'scale-x-100'
                        : 'transform scale-x-0 group-hover:scale-x-100'
                    } transition-transform duration-300`}
                  />
                )}

                <div className='absolute top-6 right-6 text-slate-300 opacity-50'>
                  <Quote size={32} className='rotate-180' />
                </div>

                <div className='flex mb-6'>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className='fill-blue-600 text-blue-600'
                    />
                  ))}
                </div>

                <blockquote className='text-slate-700 italic mb-8'>
                  <span>{testimonial.content}</span>
                </blockquote>

                <div className='flex items-center pt-6 border-t border-slate-100'>
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={56}
                    height={56}
                    className='w-14 h-14 rounded-full ring-2 ring-slate-200 mr-4'
                  />
                  <div>
                    <h4 className='font-semibold text-slate-900'>
                      {testimonial.name}
                    </h4>
                    <p className='text-sm text-slate-600'>{testimonial.role}</p>
                    <p className='text-sm text-slate-500'>
                      {testimonial.company}
                    </p>
                  </div>
                </div>
              </m.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
