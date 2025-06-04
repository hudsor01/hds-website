'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function GlobalLoading() {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const handleStart = () => setIsLoading(true)
    const handleComplete = () => setIsLoading(false)

    // Listen for navigation events
    const _handleRouteChangeStart = () => handleStart()
    const _handleRouteChangeComplete = () => handleComplete()

    // Add event listeners for Next.js navigation
    const originalPushState = window.history.pushState
    const originalReplaceState = window.history.replaceState

    window.history.pushState = function(...args) {
      handleStart()
      const result = originalPushState.apply(this, args)
      setTimeout(handleComplete, 100)
      return result
    }

    window.history.replaceState = function(...args) {
      handleStart()
      const result = originalReplaceState.apply(this, args)
      setTimeout(handleComplete, 100)
      return result
    }

    // Listen for click events on links
    const handleLinkClick = (e: Event) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'A' || target.closest('a')) {
        const link = target.tagName === 'A' ? target as HTMLAnchorElement : target.closest('a')
        if (link && link.href && !link.href.startsWith('#') && !link.target) {
          handleStart()
          setTimeout(handleComplete, 500)
        }
      }
    }

    document.addEventListener('click', handleLinkClick)

    // Cleanup
    return () => {
      window.history.pushState = originalPushState
      window.history.replaceState = originalReplaceState
      document.removeEventListener('click', handleLinkClick)
    }
  }, [])

  if (!isLoading) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm'>
      <div className='flex flex-col items-center space-y-4'>
        <div className='relative'>
          <div className='h-12 w-12 rounded-full border-4 border-gray-200'></div>
          <div className='absolute top-0 h-12 w-12 animate-spin rounded-full border-4 border-transparent border-t-blue-500'></div>
        </div>
        <p className='text-sm text-muted-foreground'>Loading...</p>
      </div>
    </div>
  )
}

// Loading spinner component for other use cases
export function LoadingSpinner({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-4',
  }

  return (
    <div className={cn('relative', className)}>
      <div className={cn('rounded-full border-gray-200', sizeClasses[size])}></div>
      <div
        className={cn(
          'absolute top-0 animate-spin rounded-full border-transparent border-t-blue-500',
          sizeClasses[size],
        )}
      ></div>
    </div>
  )
}

// Page loading component
export function PageLoading() {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='flex flex-col items-center space-y-4'>
        <LoadingSpinner size='lg' />
        <p className='text-lg text-muted-foreground'>Loading page...</p>
      </div>
    </div>
  )
}