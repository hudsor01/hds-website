'use client'

import React from 'react'
import Link from 'next/link'
import { AlertCircle, RefreshCw, Home, Mail, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface BaseErrorFallbackProps {
  error?: Error | null
  reset?: () => void
  className?: string
}

/**
 * Generic error fallback for any component
 */
export function GenericErrorFallback({ error, reset, className = '' }: BaseErrorFallbackProps) {
  return (
    <div className={`flex min-h-[300px] items-center justify-center p-4 ${className}`}>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <AlertCircle className='mx-auto h-12 w-12 text-red-500 mb-4' />
          <CardTitle className='text-xl'>Something went wrong</CardTitle>
          <CardDescription>
            {error?.message || 'An unexpected error occurred while loading this component.'}
          </CardDescription>
        </CardHeader>
        <CardContent className='text-center'>
          {reset && (
            <Button onClick={reset} className='w-full'>
              <RefreshCw className='mr-2 h-4 w-4' />
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Form-specific error fallback
 */
export function FormErrorFallback({ error, reset, className = '' }: BaseErrorFallbackProps) {
  return (
    <div className={`rounded-lg border border-red-200 bg-red-50 p-4 ${className}`}>
      <div className='flex items-start'>
        <AlertCircle className='h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0' />
        <div className='flex-1'>
          <h3 className='text-sm font-medium text-red-800'>Form Error</h3>
          <p className='mt-1 text-sm text-red-700'>
            {error?.message || 'There was a problem with the form. Please try again.'}
          </p>
          {reset && (
            <Button 
              onClick={reset} 
              variant='outline' 
              size='sm' 
              className='mt-3 border-red-300 text-red-700 hover:bg-red-100'
            >
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Page-level error fallback
 */
export function PageErrorFallback({ error, reset, className = '' }: BaseErrorFallbackProps) {
  return (
    <div className={`min-h-[60vh] flex items-center justify-center px-4 ${className}`}>
      <div className='text-center max-w-lg'>
        <AlertCircle className='mx-auto h-16 w-16 text-red-500 mb-6' />
        <h1 className='text-3xl font-bold text-gray-900 mb-4'>
          Oops! Page Error
        </h1>
        <p className='text-gray-600 mb-8'>
          {error?.message || 'This page encountered an unexpected error. Please try refreshing or go back to the homepage.'}
        </p>
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          {reset && (
            <Button onClick={reset}>
              <RefreshCw className='mr-2 h-4 w-4' />
              Try Again
            </Button>
          )}
          <Button variant='outline' onClick={() => window.location.reload()}>
            <RefreshCw className='mr-2 h-4 w-4' />
            Refresh Page
          </Button>
          <Button variant='outline' asChild>
            <Link href='/'>
              <Home className='mr-2 h-4 w-4' />
              Go Home
            </Link>
          </Button>
        </div>
        
        {/* Development error details */}
        {process.env.NODE_ENV === 'development' && error && (
          <details className='mt-8 text-left'>
            <summary className='cursor-pointer text-sm text-gray-500 hover:text-gray-700'>
              Error Details (Development Only)
            </summary>
            <div className='mt-4 p-4 bg-gray-100 rounded-lg overflow-auto max-h-60'>
              <pre className='text-xs text-red-600 whitespace-pre-wrap'>
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </div>
          </details>
        )}
      </div>
    </div>
  )
}

/**
 * API/Network error fallback
 */
export function ApiErrorFallback({ error, reset, className = '' }: BaseErrorFallbackProps) {
  const isNetworkError = error?.message?.includes('fetch') || error?.message?.includes('network')
  
  return (
    <div className={`rounded-lg border border-orange-200 bg-orange-50 p-4 ${className}`}>
      <div className='flex items-start'>
        <AlertCircle className='h-5 w-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0' />
        <div className='flex-1'>
          <h3 className='text-sm font-medium text-orange-800'>
            {isNetworkError ? 'Connection Error' : 'Service Error'}
          </h3>
          <p className='mt-1 text-sm text-orange-700'>
            {isNetworkError 
              ? 'Unable to connect to our servers. Please check your internet connection and try again.'
              : error?.message || 'There was a problem connecting to our services.'
            }
          </p>
          <div className='mt-3 flex gap-2'>
            {reset && (
              <Button 
                onClick={reset} 
                variant='outline' 
                size='sm' 
                className='border-orange-300 text-orange-700 hover:bg-orange-100'
              >
                <RefreshCw className='mr-2 h-3 w-3' />
                Retry
              </Button>
            )}
            <Button 
              variant='outline' 
              size='sm' 
              className='border-orange-300 text-orange-700 hover:bg-orange-100'
              asChild
            >
              <Link href='/contact'>
                <Mail className='mr-2 h-3 w-3' />
                Contact Support
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Section-specific error fallback (for page sections)
 */
export function SectionErrorFallback({ reset, className = '' }: BaseErrorFallbackProps) {
  return (
    <div className={`py-8 px-4 text-center ${className}`}>
      <AlertCircle className='mx-auto h-8 w-8 text-red-400 mb-4' />
      <h3 className='text-lg font-medium text-gray-900 mb-2'>
        Section Unavailable
      </h3>
      <p className='text-gray-600 mb-4 max-w-md mx-auto'>
        This section couldn&apos;t load properly. You can continue browsing other parts of the site.
      </p>
      {reset && (
        <Button variant='outline' size='sm' onClick={reset}>
          <RefreshCw className='mr-2 h-3 w-3' />
          Try Loading Again
        </Button>
      )}
    </div>
  )
}

/**
 * Minimal inline error fallback
 */
export function InlineErrorFallback({ reset, className = '' }: BaseErrorFallbackProps) {
  return (
    <div className={`inline-flex items-center gap-2 text-sm text-red-600 ${className}`}>
      <AlertCircle className='h-4 w-4' />
      <span>Error loading content</span>
      {reset && (
        <button 
          onClick={reset}
          className='text-red-600 hover:text-red-800 underline'
        >
          retry
        </button>
      )}
    </div>
  )
}

/**
 * 404-style error fallback
 */
export function NotFoundErrorFallback({ className = '' }: { className?: string }) {
  return (
    <div className={`min-h-[50vh] flex items-center justify-center px-4 ${className}`}>
      <div className='text-center'>
        <h1 className='text-6xl font-bold text-gray-300 mb-4'>404</h1>
        <h2 className='text-2xl font-semibold text-gray-700 mb-4'>
          Page Not Found
        </h2>
        <p className='text-gray-600 mb-8 max-w-md'>
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Go Back
          </Button>
          <Button variant='outline' asChild>
            <Link href='/'>
              <Home className='mr-2 h-4 w-4' />
              Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}