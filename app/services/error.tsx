'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, ArrowLeft, Home, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ServicesErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ServicesError({ error, reset }: ServicesErrorProps) {
  useEffect(() => {
    // Log the error to error reporting service
    console.error('Services page error:', error)
    
    // Track error for analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      ;(window as typeof window & { gtag: (...args: unknown[]) => void }).gtag('event', 'exception', {
        description: `Services page error: ${error.message}`,
        fatal: false,
      })
    }
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Services Page Error
        </h1>
        <p className="text-gray-600 mb-8">
          We&apos;re having trouble loading our services information. This might be a temporary issue.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Page
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/contact">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Contact Us
            </Link>
          </Button>
        </div>

        {/* Quick access to individual services */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Or try accessing services directly:
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/services/web-development">Web Development</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/services/revenue-operations">Revenue Operations</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/services/data-analytics">Data Analytics</Link>
            </Button>
          </div>
        </div>

        {/* Development error details */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-8 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Error Details (Development Only)
            </summary>
            <div className="mt-4 p-4 bg-gray-100 rounded-lg overflow-auto max-h-60">
              <pre className="text-xs text-red-600 whitespace-pre-wrap">
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