'use client'

/**
 * Global Error Boundary - Next.js 15 Pattern
 * Catches errors that occur in the root layout and other error boundaries
 * Must be a Client Component with 'use client' directive
 */

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Home, RefreshCw, Mail } from 'lucide-react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const errorId = error.digest || crypto.randomUUID()

  useEffect(() => {
    // Enhanced error logging for production monitoring
    const errorDetails = {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      errorId,
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown',
      timestamp: new Date().toISOString(),
      type: 'global-error',
    }

    console.error('Global error caught:', errorDetails)
    
    // Send to error monitoring service in production
    if (!isDevelopment && typeof window !== 'undefined') {
      // Report to error monitoring (Sentry, LogRocket, etc.)
      try {
        fetch('/api/errors/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorDetails),
        }).catch(() => {
          // Fallback: Use console for critical errors if API fails
          console.error('Failed to report error to monitoring service')
        })
      } catch (reportError) {
        console.error('Error reporting failed:', reportError)
      }
    }
  }, [error, errorId, isDevelopment])

  const handleGoHome = () => {
    window.location.href = '/'
  }

  const handleReload = () => {
    window.location.reload()
  }

  const handleReportIssue = () => {
    const subject = encodeURIComponent('Website Error Report')
    const body = encodeURIComponent(
      `I encountered an error on your website.\n\nError ID: ${errorId}\nPage: ${window.location.href}\nTime: ${new Date().toLocaleString()}\n\nAdditional details: `,
    )
    window.open(`mailto:support@hudsondigitalsolutions.com?subject=${subject}&body=${body}`)
  }

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <Card className="w-full max-w-lg shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-red-600 dark:text-red-400">500</div>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Critical Error Occurred
                </CardTitle>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  We apologize for the inconvenience. A critical system error has occurred. 
                  Our team has been automatically notified and is working to resolve this issue.
                </p>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Error ID: <code className="font-mono text-xs bg-gray-200 dark:bg-gray-700 px-1 rounded">{errorId}</code>
                  </p>
                </div>
                
                {isDevelopment && (
                  <details className="text-left bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                    <summary className="cursor-pointer font-medium text-red-800 dark:text-red-300 mb-2">
                      Development Error Details
                    </summary>
                    <div className="space-y-2">
                      <div>
                        <strong className="text-red-700 dark:text-red-400">Message:</strong>
                        <pre className="text-xs text-red-700 dark:text-red-400 mt-1 whitespace-pre-wrap break-words">
                          {error.message}
                        </pre>
                      </div>
                      {error.stack && (
                        <div>
                          <strong className="text-red-700 dark:text-red-400">Stack Trace:</strong>
                          <pre className="text-xs text-red-600 dark:text-red-500 mt-1 whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
                            {error.stack}
                          </pre>
                        </div>
                      )}
                      {error.digest && (
                        <div>
                          <strong className="text-red-700 dark:text-red-400">Digest:</strong>
                          <code className="text-xs text-red-600 dark:text-red-500 ml-2">{error.digest}</code>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={reset}
                    variant="default"
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </Button>
                  
                  <Button 
                    onClick={handleGoHome}
                    variant="outline"
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Home className="w-4 h-4" />
                    Go Home
                  </Button>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={handleReload}
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Reload Page
                  </Button>
                  
                  <Button 
                    onClick={handleReportIssue}
                    variant="ghost"
                    size="sm"
                    className="flex-1 flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Mail className="w-4 h-4" />
                    Report Issue
                  </Button>
                </div>
              </div>

              <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  If this problem persists, please contact us with the Error ID above.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  )
}