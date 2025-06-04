/**
 * Next.js 15 Lazy Loading Configuration
 * Production-ready lazy loading patterns with performance optimization
 */

import dynamic from 'next/dynamic'
import type { ComponentType, ReactNode } from 'react'

// Lazy loading configuration options
export interface LazyLoadingOptions {
  ssr?: boolean
  loading?: () => ReactNode
  error?: (error: { error: Error; retry: () => void }) => ReactNode
  delay?: number
  timeout?: number
}

// Default loading components
export const defaultLoadingComponents = {
  /**
   * Generic loading spinner
   */
  spinner: () => (
    <div className='flex items-center justify-center p-8'>
      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
    </div>
  ),

  /**
   * Loading skeleton for content
   */
  skeleton: () => (
    <div className='animate-pulse space-y-4 p-4'>
      <div className='h-4 bg-gray-200 rounded w-3/4'></div>
      <div className='h-4 bg-gray-200 rounded w-1/2'></div>
      <div className='h-32 bg-gray-200 rounded'></div>
    </div>
  ),

  /**
   * Loading placeholder for cards
   */
  card: () => (
    <div className='animate-pulse bg-white rounded-lg shadow p-6'>
      <div className='h-6 bg-gray-200 rounded mb-4'></div>
      <div className='space-y-2'>
        <div className='h-4 bg-gray-200 rounded'></div>
        <div className='h-4 bg-gray-200 rounded w-5/6'></div>
      </div>
    </div>
  ),

  /**
   * Loading for forms
   */
  form: () => (
    <div className='animate-pulse space-y-4'>
      <div className='h-10 bg-gray-200 rounded'></div>
      <div className='h-10 bg-gray-200 rounded'></div>
      <div className='h-32 bg-gray-200 rounded'></div>
      <div className='h-10 bg-gray-200 rounded w-32'></div>
    </div>
  ),
}

// Default error components
export const defaultErrorComponents = {
  /**
   * Generic error boundary
   */
  generic: ({ error, retry }: { error: Error; retry: () => void }) => (
    <div className='flex flex-col items-center justify-center p-8 text-center'>
      <div className='text-red-500 mb-4'>
        <svg className='w-12 h-12' fill='currentColor' viewBox='0 0 20 20'>
          <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
        </svg>
      </div>
      <h3 className='text-lg font-medium text-gray-900 mb-2'>Failed to load component</h3>
      <p className='text-gray-600 mb-4'>{error.message}</p>
      <button 
        onClick={retry}
        className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
      >
        Try Again
      </button>
    </div>
  ),

  /**
   * Minimal error display
   */
  minimal: ({ retry }: { error: Error; retry: () => void }) => (
    <div className='text-center p-4'>
      <p className='text-gray-500 mb-2'>Unable to load content</p>
      <button onClick={retry} className='text-blue-500 hover:underline text-sm'>
        Retry
      </button>
    </div>
  ),
}

// Lazy loading helper functions
export function createLazyComponent<T extends ComponentType<Record<string, unknown>>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadingOptions = {},
) {
  return dynamic(importFn, {
    ssr: options.ssr ?? true,
    loading: options.loading || defaultLoadingComponents.spinner,
    ...options,
  })
}

export function createClientOnlyComponent<T extends ComponentType<Record<string, unknown>>>(
  importFn: () => Promise<{ default: T }>,
  options: Omit<LazyLoadingOptions, 'ssr'> = {},
) {
  return dynamic(importFn, {
    ssr: false,
    loading: options.loading || defaultLoadingComponents.spinner,
    ...options,
  })
}

export function createLazyNamedComponent<T extends ComponentType<Record<string, unknown>>>(
  importFn: () => Promise<Record<string, ComponentType<Record<string, unknown>>>>,
  exportName: string,
  options: LazyLoadingOptions = {},
) {
  const wrappedImportFn = async () => {
    const moduleExports = await importFn()
    const component = moduleExports[exportName]
    if (!component) {
      throw new Error(`Export '${exportName}' not found in module`)
    }
    return { default: component as T }
  }
  
  return dynamic(wrappedImportFn, {
    ssr: options.ssr ?? true,
    loading: options.loading || defaultLoadingComponents.spinner,
    ...options,
  })
}

export function createLazyModal<T extends ComponentType<Record<string, unknown>>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadingOptions = {},
) {
  return dynamic(importFn, {
    ssr: false, // Modals typically don't need SSR
    loading: options.loading || (() => (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
        <div className='bg-white rounded-lg p-8'>
          {defaultLoadingComponents.spinner()}
        </div>
      </div>
    )),
    ...options,
  })
}

export function createLazyChart<T extends ComponentType<Record<string, unknown>>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadingOptions = {},
) {
  return dynamic(importFn, {
    ssr: false, // Charts often need browser APIs
    loading: options.loading || (() => (
      <div className='flex items-center justify-center h-64 bg-gray-50 rounded'>
        <div className='text-center'>
          <div className='animate-pulse mb-2'>📊</div>
          <p className='text-gray-500'>Loading chart...</p>
        </div>
      </div>
    )),
    ...options,
  })
}

// Performance monitoring for lazy loading
export const lazyPerformance = {
  /**
   * Track lazy component loading time
   */
  trackLoadTime: (componentName: string) => {
    const startTime = performance.now()
    
    return {
      finish: () => {
        const endTime = performance.now()
        const loadTime = endTime - startTime
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`Lazy component '${componentName}' loaded in ${loadTime.toFixed(2)}ms`)
        }
        
        // In production, you might want to send this to analytics
        return loadTime
      },
    }
  },
}

// Common lazy-loaded components configuration
export const commonLazyComponents = {
  // Admin components (heavy, rarely used)
  DataTable: () => createLazyNamedComponent(() => import('@/components/admin/data-table'), 'DataTable'),
  AdminCharts: () => createLazyNamedComponent(() => import('@/components/admin/charts/chart-area-interactive'), 'ChartAreaInteractive'),
  
  // Charts and visualizations (using existing admin charts)
  AnalyticsChart: () => createLazyNamedComponent(() => import('@/components/admin/charts/chart-line-interactive'), 'ChartLineInteractive'),
  
  // Contact form components as modal alternatives
  ContactForm: () => createLazyNamedComponent(() => import('@/components/forms/contact-form'), 'ContactForm'),
  
  // Heavy third-party integrations
  CalendarWidget: () => createLazyNamedComponent(() => import('@/components/booking/cal-com-widget'), 'CalComWidget'),
}