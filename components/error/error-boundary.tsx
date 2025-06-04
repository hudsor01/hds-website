'use client'

/**
 * Error Boundary Components for Next.js 15
 * 
 * Error boundary implementation following Next.js patterns with:
 * - Graceful error handling and recovery
 * - User-friendly error messages
 * - Error reporting and monitoring
 * - Retry mechanisms
 * - Development vs production behavior
 * - Different error boundary types for various scenarios
 */

import React, { Component, type ReactNode, useEffect, useState } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug, Shield, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Error boundary state interface
export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  errorId: string
  retryCount: number
  timestamp: Date
}

// Create initial error boundary state
function createErrorBoundaryState(): ErrorBoundaryState {
  return {
    hasError: false,
    error: null,
    errorInfo: null,
    errorId: crypto.randomUUID(),
    retryCount: 0,
    timestamp: new Date(),
  }
}

// Handle boundary error and update state
function handleBoundaryError(
  error: Error,
  errorInfo: React.ErrorInfo,
  currentRetryCount: number,
): Partial<ErrorBoundaryState> {
  return {
    hasError: true,
    error,
    errorInfo,
    retryCount: currentRetryCount + 1,
    timestamp: new Date(),
  }
}

// Report error to monitoring service
async function reportErrorToService(
  error: Error,
  errorInfo: React.ErrorInfo | null,
  errorId: string,
): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Report:', { error, errorInfo, errorId })
    return
  }

  // In production, send to your error monitoring service
  try {
    // Replace with your error reporting service
    console.error('Production error:', { error: error.message, errorId })
  } catch (reportError) {
    console.error('Failed to report error:', reportError)
  }
}

// Error callback interfaces following React 19 patterns
interface ErrorFallbackProps {
error: Error
errorInfo: React.ErrorInfo | null
reset: () => void
}

interface ErrorHandlerProps {
error: Error
errorInfo?: React.ErrorInfo
}

// Base Error Boundary Props Interface following React 19 patterns
interface BaseErrorBoundaryProps {
children: ReactNode
fallback?: (_errorProps: ErrorFallbackProps) => ReactNode
onError?: (_errorProps: ErrorHandlerProps) => void
isolate?: boolean
}

// Base Error Boundary Class Component
export class BaseErrorBoundary extends Component<BaseErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: BaseErrorBoundaryProps) {
    super(props)
    this.state = createErrorBoundaryState()
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const newState = handleBoundaryError(error, errorInfo, this.state.retryCount)
    this.setState(newState)
    this.props.onError?.({ error, errorInfo })
  }

  reset = () => {
    this.setState(createErrorBoundaryState())
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          errorInfo: this.state.errorInfo,
          reset: this.reset,
        })
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          reset={this.reset}
          errorId={this.state.errorId}
          retryCount={this.state.retryCount}
          isolate={this.props.isolate}
        />
      )
    }

    return this.props.children
  }
}

// Default Error Fallback Component
function DefaultErrorFallback({
  error,
  errorInfo,
  reset,
  errorId,
  retryCount = 0,
  isolate = false,
}: {
  error: Error
  errorInfo?: React.ErrorInfo | null
  reset: () => void
  errorId?: string
  retryCount?: number
  isolate?: boolean
}) {
  const [isReporting, setIsReporting] = useState(false)
  const isDevelopment = process.env.NODE_ENV === 'development'

  const handleReport = async () => {
    if (!errorId) return
    
    setIsReporting(true)
    try {
      await reportErrorToService(error, errorInfo || null, errorId)
    } catch (reportError) {
      console.error('Failed to report error:', reportError)
    } finally {
      setIsReporting(false)
    }
  }

  return (
    <div className={`min-h-[400px] flex items-center justify-center p-6 ${isolate ? 'border rounded-lg bg-muted/50' : ''}`}>
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Something went wrong</CardTitle>
          <CardDescription>
            {isDevelopment 
              ? `Error: ${error.message}`
              : 'An unexpected error occurred. We apologize for the inconvenience.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error Details for Development */}
          {isDevelopment && (
            <Alert variant="destructive">
              <Bug className="w-4 h-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>Error:</strong> {error.message}</p>
                  {errorId && <p><strong>ID:</strong> {errorId}</p>}
                  {retryCount > 0 && <p><strong>Retry Count:</strong> {retryCount}</p>}
                  {error.stack && (
                    <details className="mt-2">
                      <summary className="cursor-pointer">Stack Trace</summary>
                      <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                        {error.stack}
                      </pre>
                    </details>
                  )}
                  {errorInfo?.componentStack && (
                    <details className="mt-2">
                      <summary className="cursor-pointer">Component Stack</summary>
                      <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                        {errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Error ID for Production */}
          {!isDevelopment && errorId && (
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                <p>Error ID: <code className="bg-muted px-1 rounded">{errorId}</code></p>
                <p className="text-sm text-muted-foreground mt-1">
                  Please include this ID when contacting support.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={reset} className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Button variant="outline" onClick={() => window.location.href = '/'} className="flex-1">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>

            {!isDevelopment && errorId && (
              <Button
                variant="outline"
                onClick={handleReport}
                disabled={isReporting}
                className="flex-1"
              >
                {isReporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Reporting...
                  </>
                ) : (
                  <>
                    <Bug className="w-4 h-4 mr-2" />
                    Report Issue
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Retry Warning */}
          {retryCount > 2 && (
            <Alert variant="destructive">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                This error has occurred multiple times. You may want to refresh the page or contact support.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// App Error Boundary with Context
export function AppErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <BaseErrorBoundary
      onError={({ error, errorInfo }) => {
      // Global error tracking
      console.error('App Error Boundary caught error:', error, errorInfo)
      }}
    >
      {children}
    </BaseErrorBoundary>
  )
}

// Route Error Boundary for Page-level Errors
export function RouteErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <BaseErrorBoundary
      fallback={({ error, errorInfo, reset }) => (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <DefaultErrorFallback
            error={error}
            errorInfo={errorInfo}
            reset={reset}
            errorId={crypto.randomUUID()}
          />
        </div>
      )}
    >
      {children}
    </BaseErrorBoundary>
  )
}

// Section Error Boundary for Component Isolation
export function SectionErrorBoundary({ 
  children, 
  sectionName, 
}: { 
  children: ReactNode
  sectionName: string 
}) {
  return (
    <BaseErrorBoundary
      isolate
      fallback={({ reset }) => (
        <Card className="w-full bg-destructive/5 border-destructive/20">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Error in {sectionName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              This section encountered an error but the rest of the page should work normally.
            </p>
            <Button size="sm" onClick={reset} variant="outline">
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry Section
            </Button>
          </CardContent>
        </Card>
      )}
      onError={({ error }) => {
        console.error(`Section error in ${sectionName}:`, error)
      }}
    >
      {children}
    </BaseErrorBoundary>
  )
}

// Form Error Boundary with Form-specific Handling
export function FormErrorBoundary({ 
  children, 
  formName, 
}: { 
  children: ReactNode
  formName: string 
}) {
  return (
    <BaseErrorBoundary
      isolate
      fallback={({ error, reset }) => (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p><strong>Form Error in {formName}</strong></p>
              <p className="text-sm">
                {process.env.NODE_ENV === 'development' 
                  ? error.message 
                  : 'Unable to load the form. Please refresh the page and try again.'
                }
              </p>
              <Button size="sm" onClick={reset} variant="outline">
                <RefreshCw className="w-3 h-3 mr-1" />
                Reload Form
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    >
      {children}
    </BaseErrorBoundary>
  )
}

// Admin Error Boundary with debugging
export function AdminErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <BaseErrorBoundary
      fallback={({ error, errorInfo, reset }) => (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">Admin Panel Error</CardTitle>
              <CardDescription>
                An error occurred in the administration interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <Bug className="w-4 h-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p><strong>Error:</strong> {error.message}</p>
                    <details className="mt-2">
                      <summary className="cursor-pointer">Technical Details</summary>
                      <div className="mt-2 space-y-2">
                        {error.stack && (
                          <div>
                            <p className="font-medium">Stack Trace:</p>
                            <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                              {error.stack}
                            </pre>
                          </div>
                        )}
                        {errorInfo?.componentStack && (
                          <div>
                            <p className="font-medium">Component Stack:</p>
                            <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                              {errorInfo.componentStack}
                            </pre>
                          </div>
                        )}
                      </div>
                    </details>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button onClick={reset} className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/admin'} className="flex-1">
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    >
      {children}
    </BaseErrorBoundary>
  )
}

// Hook for Error Boundary Integration
export function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  const throwError = (error: Error) => {
    setError(error)
  }

  const clearError = () => {
    setError(null)
  }

  return { throwError, clearError, hasError: !!error }
}

// Async Error Boundary Hook
export function useAsyncError() {
  const { throwError } = useErrorHandler()

  const handleAsyncError = (error: unknown) => {
    const errorObj = error instanceof Error ? error : new Error(String(error))
    throwError(errorObj)
  }

  return handleAsyncError
}

// Legacy error boundary class for backward compatibility
export class ErrorBoundary extends BaseErrorBoundary {
// Keep the exact same API as the original for backward compatibility
constructor(props: {
children: ReactNode
fallback?: ReactNode
onError?: (_errorToReport: Error, _errorInfoToReport: React.ErrorInfo) => void
variant?: 'simple' | 'detailed'
className?: string
darkMode?: boolean
}) {
super({
children: props.children,
fallback: props.fallback ? () => props.fallback! : undefined,
onError: props.onError ? ({ error, errorInfo }) => props.onError!(error, errorInfo!) : undefined,
})
}
}