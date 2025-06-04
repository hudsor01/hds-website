'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, ArrowLeft, Home, RefreshCw, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ContactErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ContactError({ error, reset }: ContactErrorProps) {
  useEffect(() => {
    // Log the error to error reporting service
    console.error('Contact page error:', error)
    
    // Track error for analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      ;(window as typeof window & { gtag: (...args: unknown[]) => void }).gtag('event', 'exception', {
        description: `Contact page error: ${error.message}`,
        fatal: false,
      })
    }
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Contact Page Error
        </h1>
        <p className="text-gray-600 mb-8">
          We&apos;re having trouble loading the contact form, but don&apos;t worry - you can still reach us!
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

        {/* Alternative contact methods */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="mr-2 h-5 w-5 text-blue-600" />
                Email Us
              </CardTitle>
              <CardDescription>
                Send us an email directly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <a href="mailto:hello@hudsondigitalsolutions.com">
                  hello@hudsondigitalsolutions.com
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="mr-2 h-5 w-5 text-green-600" />
                Call Us
              </CardTitle>
              <CardDescription>
                Speak with us directly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <a href="tel:+1234567890">
                  (234) 567-890
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/services">
              <ArrowLeft className="mr-2 h-4 w-4" />
              View Services
            </Link>
          </Button>
        </div>

        {/* Quick message suggestion */}
        <div className="p-4 bg-blue-50 rounded-lg text-left">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            Quick Email Template:
          </h3>
          <p className="text-sm text-blue-700">
            &quot;Hi, I&apos;m interested in learning more about your services. I was trying to use your contact form but encountered an issue. Please get in touch with me at [your email] to discuss my project.&quot;
          </p>
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