'use client'

import React, { Suspense, lazy, type ComponentType } from 'react'
import { useLazyLoad } from '@/hooks/use-intersection-observer'
import { Skeleton } from '@/components/ui/skeleton'

interface LazyWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  className?: string
  threshold?: number
  rootMargin?: string
  minHeight?: string | number
}

/**
 * Wrapper component that only renders children when they come into view
 * Useful for heavy components that don't need immediate rendering
 */
export function LazyWrapper({
  children,
  fallback,
  className = '',
  threshold = 0.1,
  rootMargin = '50px',
  minHeight = 'auto',
}: LazyWrapperProps) {
  const { ref, shouldLoad } = useLazyLoad({
    threshold,
    rootMargin,
  })

  const defaultFallback = (
    <div 
      className={`flex items-center justify-center ${className}`}
      style={{ minHeight }}
    >
      <Skeleton className='h-32 w-full rounded-lg' />
    </div>
  )

  return (
    <div ref={ref} className={className} style={{ minHeight }}>
      {shouldLoad ? (
        <Suspense fallback={fallback || defaultFallback}>
          {children}
        </Suspense>
      ) : (
        fallback || defaultFallback
      )}
    </div>
  )
}

/**
 * Higher-order component for lazy loading any React component
 */
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  options?: {
    fallback?: React.ComponentType
    threshold?: number
    rootMargin?: string
    displayName?: string
  },
): ComponentType<P> {
  const {
    fallback: Fallback,
    threshold = 0.1,
    rootMargin = '50px',
    displayName,
  } = options || {}

  const LazyComponent = React.forwardRef<HTMLElement, P>((props, ref) => {
    const { ref: intersectionRef, shouldLoad } = useLazyLoad({
      threshold,
      rootMargin,
    })

    const defaultFallback = Fallback ? <Fallback /> : (
      <div className='flex items-center justify-center min-h-[200px]'>
        <Skeleton className='h-32 w-full rounded-lg' />
      </div>
    )

    return (
      <div ref={intersectionRef}>
        {shouldLoad ? (
          <Component {...props} ref={ref} />
        ) : (
          defaultFallback
        )}
      </div>
    )
  })

  LazyComponent.displayName = displayName || `LazyLoaded(${Component.displayName || Component.name || 'Component'})`

  return LazyComponent
}

/**
 * Hook for creating lazy-loaded components with dynamic imports
 */
export function useLazyComponent<T extends ComponentType<Record<string, unknown>>>(
  importFunc: () => Promise<{ default: T }>,
  options?: {
    threshold?: number
    rootMargin?: string
  },
) {
  const { threshold = 0.1, rootMargin = '50px' } = options || {}
  const { ref, shouldLoad } = useLazyLoad({ threshold, rootMargin })

  const LazyComponent = shouldLoad ? lazy(importFunc) : null

  return {
    ref,
    LazyComponent,
    shouldLoad,
  }
}

/**
 * Component for lazy loading images with intersection observer
 */
interface LazyImageProps {
  src: string
  alt: string
  className?: string
  placeholder?: string
  threshold?: number
  rootMargin?: string
  onLoad?: () => void
  onError?: () => void
}

export function LazyImage({
  src,
  alt,
  className = '',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIxOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZpbGw9IiNhYWEiPkxvYWRpbmc8L3RleHQ+PC9zdmc+',
  threshold = 0.1,
  rootMargin = '50px',
  onLoad,
  onError,
}: LazyImageProps) {
  const { ref, shouldLoad } = useLazyLoad({ threshold, rootMargin })

  return (
    <div ref={ref} className={className}>
      {shouldLoad ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt={alt}
          className='w-full h-full object-cover'
          onLoad={onLoad}
          onError={onError}
          loading='lazy'
        />
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={placeholder}
          alt='Loading...'
          className='w-full h-full object-cover opacity-50'
        />
      )}
    </div>
  )
}