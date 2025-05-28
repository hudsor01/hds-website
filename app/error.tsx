'use client'

/**
 * Root Error Boundary for Next.js 15
 * 
 * Handles uncaught exceptions at the application level following Next.js patterns.
 * This file is automatically used by Next.js as an error boundary for the app directory.
 */

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const errorId = error.digest || crypto.randomUUID()

  useEffect(() => {
    // Log the error to error reporting service
    console.error('Application error:', error)

    // In production, you might want to send this to your monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error monitoring service
      // reportError(error, { errorId, page: window.location.pathname })
    }
  }, [error])

  const handleReportIssue = () => {
    // You can implement issue reporting here
    // For example, open a support email or redirect to a feedback form
    const subject = encodeURIComponent('Application Error Report')
    const body = encodeURIComponent(`
Error ID: ${errorId}
Page: ${window.location.pathname}
Error: ${error.message}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}

Additional details:
Please describe what you were doing when this error occurred.
    `)
    
    window.open(`mailto:support@hudsonds.com?subject=${subject}&body=${body}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Oops! Something went wrong</CardTitle>
          <CardDescription>
            {isDevelopment 
              ? 'A runtime error occurred during development'
              : 'We encountered an unexpected error. Our team has been notified and we\'re working to fix it.'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Error Information */}
          {isDevelopment ? (
            <Alert variant="destructive">
              <Bug className="w-4 h-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>Development Error:</strong></p>
                  <p className="font-mono text-sm">{error.message}</p>
                  {error.stack && (
                    <details className="mt-3">
                      <summary className="cursor-pointer font-medium">Stack Trace</summary>
                      <pre className="mt-2 text-xs bg-muted p-3 rounded overflow-auto max-h-48 whitespace-pre-wrap">
                        {error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>Error Reference:</strong></p>
                  <p className="font-mono text-sm bg-muted px-2 py-1 rounded inline-block">
                    {errorId}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Please include this reference number when contacting support.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button onClick={reset} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'} 
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </div>

            {!isDevelopment && (
              <Button 
                variant="outline" 
                onClick={handleReportIssue}
                className="w-full"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Report Issue
              </Button>
            )}
          </div>

          {/* Help Information */}
          <div className="pt-4 border-t">
            <h3 className="font-medium mb-2">What can you do?</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Try refreshing the page</li>
              <li>• Check your internet connection</li>
              <li>• Clear your browser cache and cookies</li>
              {!isDevelopment && <li>• Contact our support team if the problem persists</li>}
            </ul>
          </div>

          {/* Development Tips */}
          {isDevelopment && (
            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">Development Tips:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Check the browser console for additional errors</li>
                <li>• Verify all required environment variables are set</li>
                <li>• Ensure all dependencies are properly installed</li>
                <li>• Check for TypeScript compilation errors</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
