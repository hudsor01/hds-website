import { logger } from './logger'

// Define window interfaces for external services
interface WindowWithSentry extends Window {
  Sentry: {
    captureException: (error: Error, context?: Record<string, unknown>) => void
  }
}

interface WindowWithAnalytics extends Window {
  gtag: (...args: unknown[]) => void
  plausible: (event: string, options?: Record<string, unknown>) => void
}

export interface ErrorContext {
  userId?: string
  sessionId?: string
  url?: string
  userAgent?: string
  timestamp?: string
  buildVersion?: string
  route?: string
  component?: string
}

export interface ErrorReport {
  error: Error
  context: ErrorContext
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'ui' | 'api' | 'network' | 'validation' | 'auth' | 'unknown'
}

/**
 * Error tracking service for comprehensive error monitoring
 */
class ErrorTrackingService {
  private sessionId: string
  private buildVersion: string

  constructor() {
    this.sessionId = this.generateSessionId()
    this.buildVersion = process.env.NEXT_PUBLIC_BUILD_VERSION || 'unknown'
  }

  /**
   * Report an error with context
   */
  reportError(error: Error, context: Partial<ErrorContext> = {}) {
    const fullContext: ErrorContext = {
      ...context,
      sessionId: this.sessionId,
      url: typeof window !== 'undefined' ? window.location.href : context.url,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      timestamp: new Date().toISOString(),
      buildVersion: this.buildVersion,
    }

    const errorReport: ErrorReport = {
      error,
      context: fullContext,
      severity: this.determineSeverity(error),
      category: this.categorizeError(error),
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Report')
      console.error('Error:', error.message)
      console.error('Stack:', error.stack)
      console.log('Context:', fullContext)
      console.log('Category:', errorReport.category)
      console.log('Severity:', errorReport.severity)
      console.groupEnd()
    }

    // Log through our logger service
    logger.error('Application error', {
      message: error.message,
      stack: error.stack,
      ...fullContext,
      category: errorReport.category,
      severity: errorReport.severity,
    })

    // Send to external error tracking (Sentry, LogRocket, etc.)
    this.sendToExternalService(errorReport)

    // Track in analytics
    this.trackInAnalytics(errorReport)

    return errorReport
  }

  /**
   * Report form-specific errors
   */
  reportFormError(error: Error, formName: string, fieldName?: string) {
    return this.reportError(error, {
      component: `form:${formName}`,
      route: `form_field:${fieldName || 'unknown'}`,
    })
  }

  /**
   * Report API errors
   */
  reportApiError(error: Error, endpoint: string, method: string) {
    return this.reportError(error, {
      component: 'api',
      route: `${method} ${endpoint}`,
    })
  }

  /**
   * Report component errors
   */
  reportComponentError(error: Error, componentName: string) {
    return this.reportError(error, {
      component: componentName,
    })
  }

  /**
   * Determine error severity based on error characteristics
   */
  private determineSeverity(error: Error): ErrorReport['severity'] {
    // Critical errors - app crashes, security issues
    if (
      error.message.includes('ChunkLoadError') ||
      error.message.includes('SecurityError') ||
      error.message.includes('CSRF')
    ) {
      return 'critical'
    }

    // High severity - API failures, form submission failures
    if (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('submission')
    ) {
      return 'high'
    }

    // Medium severity - UI component errors
    if (
      error.message.includes('component') ||
      error.message.includes('render')
    ) {
      return 'medium'
    }

    // Low severity - validation, minor UI issues
    return 'low'
  }

  /**
   * Categorize errors for better organization
   */
  private categorizeError(error: Error): ErrorReport['category'] {
    const message = error.message.toLowerCase()

    if (message.includes('fetch') || message.includes('network')) {
      return 'network'
    }

    if (message.includes('validation') || message.includes('invalid')) {
      return 'validation'
    }

    if (message.includes('auth') || message.includes('permission')) {
      return 'auth'
    }

    if (message.includes('api') || message.includes('trpc')) {
      return 'api'
    }

    if (
      message.includes('component') ||
      message.includes('render') ||
      message.includes('react')
    ) {
      return 'ui'
    }

    return 'unknown'
  }

  /**
   * Send error to external tracking service
   */
  private sendToExternalService(errorReport: ErrorReport) {
    // Example for Sentry integration
    if (typeof window !== 'undefined' && 'Sentry' in window) {
      ;(window as WindowWithSentry).Sentry.captureException(errorReport.error, {
        tags: {
          severity: errorReport.severity,
          category: errorReport.category,
          component: errorReport.context.component,
        },
        contexts: {
          error_context: errorReport.context,
        },
      })
    }

    // Example for other services (LogRocket, Bugsnag, etc.)
    // Add your error tracking service integration here
  }

  /**
   * Track error in analytics
   */
  private trackInAnalytics(errorReport: ErrorReport) {
    // Google Analytics 4
    if (typeof window !== 'undefined' && 'gtag' in window) {
      ;(window as WindowWithAnalytics).gtag('event', 'exception', {
        description: errorReport.error.message,
        fatal: errorReport.severity === 'critical',
        custom_map: {
          category: errorReport.category,
          severity: errorReport.severity,
          component: errorReport.context.component,
        },
      })
    }

    // Plausible Analytics (if using)
    if (typeof window !== 'undefined' && 'plausible' in window) {
      ;(window as WindowWithAnalytics).plausible('Error', {
        props: {
          category: errorReport.category,
          severity: errorReport.severity,
          message: errorReport.error.message.substring(0, 100), // Truncate long messages
        },
      })
    }
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get current session information
   */
  getSessionInfo(): { sessionId: string; buildVersion: string } {
    return {
      sessionId: this.sessionId,
      buildVersion: this.buildVersion,
    }
  }
}

// Create singleton instance
export const errorTracker = new ErrorTrackingService()

/**
 * Error boundary handler that integrates with tracking
 */
export function createErrorBoundaryHandler(componentName: string) {
  return (error: Error, _errorInfo: unknown) => {
    errorTracker.reportComponentError(error, componentName)
  }
}

/**
 * Async error handler for promises and async operations
 */
export function handleAsyncError(error: Error, context?: Partial<ErrorContext>) {
  errorTracker.reportError(error, context)
}

/**
 * Form error handler
 */
export function handleFormError(error: Error, formName: string, fieldName?: string) {
  errorTracker.reportFormError(error, formName, fieldName)
}

/**
 * Global error handler setup
 */
export function setupGlobalErrorHandling() {
  if (typeof window === 'undefined') return

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    errorTracker.reportError(
      new Error(`Unhandled Promise Rejection: ${event.reason}`),
      { component: 'global', route: 'unhandled_promise' },
    )
  })

  // Handle global JavaScript errors
  window.addEventListener('error', (event) => {
    errorTracker.reportError(
      new Error(`Global Error: ${event.message}`),
      {
        component: 'global',
        route: event.filename || 'unknown',
      },
    )
  })

  // Handle resource loading errors
  window.addEventListener('error', (event) => {
    if (event.target !== window) {
      errorTracker.reportError(
        new Error(`Resource Load Error: ${(event.target as HTMLElement & { src?: string })?.src || 'unknown'}`),
        { component: 'resource', route: 'resource_load' },
      )
    }
  }, true)
}