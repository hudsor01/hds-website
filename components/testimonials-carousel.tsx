'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Star, Quote } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

// Interface for testimonial data
interface Testimonial {
  id: string
  name: string
  position: string
  company: string
  testimonial: string
  image: string
  rating: number
}

// Sample testimonials data
const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'David Chen',
    position: 'CEO',
    company: 'TechCorp Inc.',
    testimonial:
      'Hudson Digital Solutions transformed our legacy systems into modern, scalable applications. Their expertise and attention to detail exceeded our expectations.',
    image: '/images/default-avatar.jpg',
    rating: 5,
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    position: 'CTO',
    company: 'FinanceFlow',
    testimonial:
      'The team at Hudson Digital Solutions delivered our project on time and under budget. Their technical knowledge and project management skills are top-notch.',
    image: '/images/default-avatar.jpg',
    rating: 5,
  },
  {
    id: '3',
    name: 'James Wilson',
    position: 'Head of Engineering',
    company: 'Enterprise Corp',
    testimonial:
      'Their strategic approach to solving our business challenges was impressive. They helped us build a robust platform that scaled with our growth.',
    image: '/images/default-avatar.jpg',
    rating: 5,
  },
  {
    id: '4',
    name: 'Robert Martinez',
    position: 'VP of Technology',
    company: 'InnovateTech',
    testimonial:
      'Working with Hudson Digital Solutions was a game-changer for our startup. They delivered exceptional results that exceeded our expectations.',
    image: '/images/default-avatar.jpg',
    rating: 5,
  },
]

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className='relative h-full flex flex-col bg-white rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300 p-8 group overflow-hidden'>
      {/* Accent line */}
      <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-sky-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300' />

      <div className='absolute top-6 right-6 text-slate-300 opacity-50'>
        <Quote size={32} className='rotate-180' />
      </div>

      <div className='flex mb-6'>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={18}
            className={cn(
              'fill-current',
              i < testimonial.rating ? 'text-blue-600' : 'text-slate-200',
            )}
          />
        ))}
      </div>

      <blockquote className='flex-1 text-slate-700 italic leading-relaxed mb-6'>
        <span>{testimonial.testimonial}</span>
      </blockquote>

      <div className='flex items-center space-x-4 pt-6 border-t border-slate-100'>
        <div className='relative h-14 w-14 rounded-full overflow-hidden ring-2 ring-slate-200'>
          <Image
            src={testimonial.image}
            alt={testimonial.name}
            fill
            className='object-cover'
          />
        </div>
        <div>
          <h4 className='text-base font-semibold text-slate-900'>
            {testimonial.name}
          </h4>
          <p className='text-sm text-slate-600'>{testimonial.position}</p>
          <p className='text-sm text-slate-500'>{testimonial.company}</p>
        </div>
      </div>
    </div>
  )
}

interface TestimonialsCarouselProps {
  autoPlay?: boolean
  autoPlayInterval?: number
  className?: string
}

export function TestimonialsCarousel({
  autoPlay = true,
  autoPlayInterval = 5000,
  className,
}: TestimonialsCarouselProps) {
  const [api, setApi] = useState<unknown>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!api) return

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && api) {
      const interval = setInterval(() => {
        api.scrollNext()
      }, autoPlayInterval)

      return () => clearInterval(interval)
    }
  }, [api, autoPlay, autoPlayInterval])

  return (
    <section
      className={cn(
        'py-20 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden',
        className,
      )}
    >
      {/* Subtle background pattern */}
      <div className='absolute inset-0 opacity-[0.02]'>
        <div className='absolute inset-0 bg-grid-slate-900/[0.04] bg-[size:20px_20px]' />
      </div>

      <div className='container px-4 md:px-6 relative z-10'>
        <div className='flex flex-col items-center justify-center space-y-4 text-center mb-16'>
          <div className='space-y-3'>
            <h2 className='text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 sm:text-5xl'>
              Client Success Stories
            </h2>
            <div className='w-20 h-1 bg-gradient-to-r from-blue-600 to-sky-600 mx-auto mb-6' />
            <p className='max-w-[900px] text-slate-600 text-lg md:text-xl/relaxed'>
              Trusted by industry leaders to deliver exceptional digital
              solutions
            </p>
          </div>
        </div>

        <Carousel
          setApi={setApi}
          className='mx-auto w-full max-w-6xl'
          opts={{
            align: 'start',
            loop: true,
          }}
        >
          <CarouselContent className='-ml-4'>
            {testimonials.map(testimonial => (
              <CarouselItem
                key={testimonial.id}
                className='pl-4 basis-full md:basis-1/2 lg:basis-1/3'
              >
                <TestimonialCard testimonial={testimonial} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className='flex items-center justify-center mt-12 space-x-6'>
            <CarouselPrevious className='static translate-y-0 bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300' />
            <span className='text-sm text-slate-600 font-medium'>
              {current} / {count}
            </span>
            <CarouselNext className='static translate-y-0 bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300' />
          </div>
        </Carousel>
      </div>
    </section>
  )
}
