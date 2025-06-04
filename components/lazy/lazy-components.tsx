'use client'

/**
 * Lazy-loaded component exports using Next.js dynamic imports
 * 
 * This file centralizes all lazy-loaded components to improve initial page load performance
 * by splitting the JavaScript bundle and loading components only when needed.
 * 
 * Note: This file is marked as 'use client' because it uses `ssr: false` with dynamic imports,
 * which is not allowed in Server Components in Next.js 15.
 */

import React from 'react'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
// Removed unused type imports

// Loading components for better UX
const AnimationSkeleton = () => (
  <div className='flex items-center justify-center min-h-[200px]'>
    <Skeleton className='h-32 w-full rounded-lg' />
  </div>
)

const SectionSkeleton = () => (
  <div className='py-16 space-y-6'>
    <Skeleton className='h-8 w-64 mx-auto' />
    <Skeleton className='h-4 w-96 mx-auto' />
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8'>
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className='h-48 w-full rounded-lg' />
      ))}
    </div>
  </div>
)

const FormSkeleton = () => (
  <div className='space-y-4'>
    <Skeleton className='h-10 w-full' />
    <Skeleton className='h-10 w-full' />
    <Skeleton className='h-24 w-full' />
    <Skeleton className='h-10 w-32' />
  </div>
)

const CarouselSkeleton = () => (
  <div className='flex space-x-4 overflow-hidden'>
    {[...Array(3)].map((_, i) => (
      <Skeleton key={i} className='h-64 w-80 flex-shrink-0 rounded-lg' />
    ))}
  </div>
)

// ===== Animated Components =====

export const LazyFloatingElements = dynamic(
  () => import('@/components/animated/floating-elements'),
  {
    loading: () => <AnimationSkeleton />,
    ssr: false, // Animations don't need SSR
  },
)

export const LazyGradientBackground = dynamic(
  () => import('@/components/animated/gradient-background'),
  {
    loading: () => null, // Background doesn't need loading state
    ssr: false,
  },
)

export const LazyAnimatedCard = dynamic(
  () => import('@/components/animated/animated-card'),
  {
    loading: () => <Skeleton className='h-48 w-full rounded-lg' />,
    ssr: false,
  },
)

export const LazyAnimatedText = dynamic(
  () => import('@/components/animated/animated-text'),
  {
    loading: () => <Skeleton className='h-8 w-48' />,
    ssr: false,
  },
)

// ===== Section Components =====

// Testimonials section removed from lazy loading as it's a server component that uses server-only modules
// Import TestimonialsSection directly in Server Components instead

export const LazyServicesSection = dynamic(
  () => import('@/components/sections/services-section').then(mod => ({ default: mod.ServicesSection })),
  {
    loading: () => <SectionSkeleton />,
    ssr: true,
  },
)

export const LazyTechStackSection = dynamic(
  () => import('@/components/sections/tech-stack-section').then(mod => ({ default: mod.TechStackSection })),
  {
    loading: () => <SectionSkeleton />,
    ssr: true,
  },
)

export const LazyPricingSection = dynamic(
  () => import('@/components/sections/pricing-section').then(mod => ({ default: mod.PricingSection })),
  {
    loading: () => <SectionSkeleton />,
    ssr: true,
  },
)

export const LazyContactCTASection = dynamic(
  () => import('@/components/sections/contact-cta').then(mod => ({ default: mod.ContactCTA })),
  {
    loading: () => <SectionSkeleton />,
    ssr: true,
  },
)

export const LazyLeadMagnetSection = dynamic(
  () => import('@/components/sections/lead-magnet-section').then(mod => ({ default: mod.LeadMagnetSection })),
  {
    loading: () => <SectionSkeleton />,
    ssr: true,
  },
)

// ===== Interactive Components =====

export const LazyTestimonialsCarousel = dynamic(
  () => import('@/components/testimonials-carousel'),
  {
    loading: () => <CarouselSkeleton />,
    ssr: true,
  },
)

// ===== Form Components =====

export const LazyContactForm = dynamic(
  () => import('@/components/forms/contact-form'),
  {
    loading: () => <FormSkeleton />,
    ssr: true, // Forms should be SSR for accessibility
  },
)

export const LazyLeadMagnetForm = dynamic(
  () => import('@/components/forms/lead-magnet-form'),
  {
    loading: () => <FormSkeleton />,
    ssr: true,
  },
)

export const LazyNewsletterForm = dynamic(
  () => import('@/components/forms/newsletter-form'),
  {
    loading: () => <FormSkeleton />,
    ssr: true,
  },
)

// ===== Page-level Client Components =====
// Note: Client components removed as they don't exist in the current codebase structure

// ===== Conditional Loading Utilities =====

/**
 * Lazy load component only when it comes into viewport
 */
export function lazyLoadOnIntersection<T extends Record<string, unknown>>(
  importFunc: () => Promise<{ default: React.ComponentType<T> }>,
  options?: {
    rootMargin?: string
    threshold?: number
    fallback?: React.ComponentType<T>
  },
) {
  return dynamic(importFunc, {
    loading: () => options?.fallback ? <options.fallback {...({} as T)} /> : <AnimationSkeleton />,
    ssr: false,
  })
}

/**
 * Lazy load component with custom loading state
 */
export function lazyLoadWithFallback<T extends Record<string, unknown>>(
  importFunc: () => Promise<{ default: React.ComponentType<T> }>,
  LoadingComponent: React.ComponentType,
  enableSSR = true,
) {
  return dynamic(importFunc, {
    loading: LoadingComponent,
    ssr: enableSSR,
  })
}