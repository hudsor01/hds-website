/**
 * Enhanced Error Handling System for Next.js 15
 * 
 * Comprehensive error management following Next.js official patterns with:
 * - Expected error handling for Server Actions and Components
 * - Error boundary utilities and types
 * - Error reporting and monitoring
 * - User-friendly error messages
 * - Development vs production error handling
 * - Error recovery and retry mechanisms
 */

import { logger } from '../../lib/logger'
import type { ErrorContext } from '../../types/analytics-types'

// Error types and interfaces
export interface BaseError {
  message: string
  code?: string
  statusCode?: number
  timestamp: Date
  requestId?: string
  userId?: string
  metadata?: ErrorContext
}

export interface ValidationError extends BaseError {
  type: 'validation'
  field?: string
  fields?: Record<string, string[]>
}

export interface AuthenticationError extends BaseError {
  type: 'authentication'
  reason: 'invalid_credentials' | 'session_expired' | 'unauthorized' | 'forbidden'
}

export interface NetworkError extends BaseError {
  type: 'network'
  endpoint?: string
  method?: string
  statusCode: number
  retryable: boolean
}

export interface SystemError extends BaseError {
  type: 'system'
  component: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  stack?: string
}

export interface BusinessLogicError extends BaseError {
  type: 'business'
  operation: string
  reason: string
}

export type AppError = ValidationError | AuthenticationError | NetworkError | SystemError | BusinessLogicError

// Error factory functions
export const ErrorFactory = {
  validation: (message: string, field?: string, fields?: Record<string, string[]>): ValidationError => ({
    type: 'validation',
    message,
    field,
    fields,
    timestamp: new Date(),
    code: 'VALIDATION_ERROR',
    statusCode: 400,
  }),

  authentication: (
    message: string, 
    reason: AuthenticationError['reason'] = 'unauthorized',
  ): AuthenticationError => ({
    type: 'authentication',
    message,
    reason,
    timestamp: new Date(),
    code: 'AUTH_ERROR',
    statusCode: reason === 'forbidden' ? 403 : 401,
  }),

  network: (
    message: string,
    statusCode: number,
    endpoint?: string,
    method?: string,
  ): NetworkError => ({
    type: 'network',
    message,
    statusCode,
    endpoint,
    method,
    retryable: statusCode >= 500 || statusCode === 408 || statusCode === 429,
    timestamp: new Date(),
    code: 'NETWORK_ERROR',
  }),

  system: (
    message: string,
    component: string,
    severity: SystemError['severity'] = 'medium',
    stack?: string,
  ): SystemError => ({
    type: 'system',
    message,
    component,
    severity,
    stack,
    timestamp: new Date(),
    code: 'SYSTEM_ERROR',
    statusCode: 500,
  }),

  business: (message: string, operation: string, reason: string): BusinessLogicError => ({
    type: 'business',
    message,
    operation,
    reason,
    timestamp: new Date(),
    code: 'BUSINESS_ERROR',
    statusCode: 400,
  }),
}

// Error handling utilities for Server Actions
export interface ActionResult<T = unknown> {
  success: boolean
  data?: T
  error?: AppError
  message?: string
}

export function createActionResult<T>(
  success: boolean,
  data?: T,
  error?: AppError,
  message?: string,
): ActionResult<T> {
  return { success, data, error, message }
}

export function handleActionError(error: unknown, context?: string): ActionResult {
  const appError = normalizeError(error, context)
  
  logger.error('Server Action error', {
    type: appError.type,
    message: appError.message,
    code: appError.code,
    context,
    timestamp: appError.timestamp,
  })

  // Return user-friendly error for client
  return createActionResult(false, undefined, appError, getUserFriendlyMessage(appError))
}

// Error normalization - converts any error to AppError
export function normalizeError(error: unknown, context?: string): AppError {
  if (isAppError(error)) {
    return error
  }

  if (error instanceof Error) {
    // Check for specific error types
    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return ErrorFactory.validation(error.message)
    }

    if (error.message.includes('unauthorized') || error.message.includes('forbidden')) {
      return ErrorFactory.authentication(error.message)
    }

    if (error.message.includes('fetch') || error.message.includes('network')) {
      return ErrorFactory.network(error.message, 500)
    }

    // Default to system error
    return ErrorFactory.system(error.message, context || 'unknown', 'medium', error.stack)
  }

  // Fallback for unknown error types
  return ErrorFactory.system('An unexpected error occurred', context || 'unknown', 'medium')
}

export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    'message' in error &&
    'timestamp' in error
  )
}

// User-friendly error messages
export function getUserFriendlyMessage(error: AppError): string {
  switch (error.type) {
    case 'validation':
      return error.message || 'Please check your input and try again.'
    
    case 'authentication':
      switch (error.reason) {
        case 'invalid_credentials':
          return 'Invalid username or password. Please try again.'
        case 'session_expired':
          return 'Your session has expired. Please log in again.'
        case 'unauthorized':
          return 'You need to log in to access this resource.'
        case 'forbidden':
          return 'You do not have permission to perform this action.'
        default:
          return 'Authentication required. Please log in.'
      }
    
    case 'network':
      if (error.retryable) {
        return 'Connection issue. Please try again in a moment.'
      }
      return 'Unable to complete the request. Please try again.'
    
    case 'business':
      return error.message || 'Unable to complete the operation.'
    
    case 'system':
      if (process.env.NODE_ENV === 'development') {
        return `System error in ${error.component}: ${error.message}`
      }
      return 'Something went wrong. Please try again or contact support if the problem persists.'
    
    default:
      return 'An unexpected error occurred. Please try again.'
  }
}

// Error boundary utilities
export interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
  errorId?: string
  retryCount: number
}

export function createErrorBoundaryState(): ErrorBoundaryState {
  return {
    hasError: false,
    retryCount: 0,
  }
}

export function handleBoundaryError(
  error: Error,
  errorInfo: React.ErrorInfo,
  retryCount: number = 0,
): ErrorBoundaryState {
  const errorId = crypto.randomUUID()
  
  // Log error for monitoring
  logger.error('Error boundary caught error', {
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    errorId,
    retryCount,
  })

  // Report to error monitoring service in production
  if (process.env.NODE_ENV === 'production') {
    reportErrorToService(error, errorInfo, errorId)
  }

  return {
    hasError: true,
    error,
    errorInfo,
    errorId,
    retryCount,
  }
}

// Error reporting
export async function reportErrorToService(
  error: Error,
  errorInfo?: React.ErrorInfo,
  errorId?: string,
): Promise<void> {
  try {
    // In production, you would send to your error monitoring service
    // Examples: Sentry, DataDog, Rollbar, etc.
    
    const _errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      errorId,
      timestamp: new Date().toISOString(),
      url: window?.location?.href,
      userAgent: navigator?.userAgent,
    }

    // Example integration (uncomment for actual service)
    // await fetch('/api/errors/report', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorReport),
    // })

    console.info('Error reported to monitoring service', { errorId })
  } catch (reportingError) {
    console.error('Failed to report error to monitoring service', reportingError)
  }
}

// Retry mechanisms
export interface RetryConfig {
  maxAttempts: number
  delayMs: number
  backoffMultiplier: number
  maxDelayMs: number
}

export const defaultRetryConfig: RetryConfig = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
  maxDelayMs: 10000,
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {},
): Promise<T> {
  const fullConfig = { ...defaultRetryConfig, ...config }
  let lastError: unknown
  
  for (let attempt = 1; attempt <= fullConfig.maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      // Don't retry if it's the last attempt
      if (attempt === fullConfig.maxAttempts) {
        break
      }
      
      // Don't retry non-retryable errors
      if (isAppError(error) && error.type === 'network' && !error.retryable) {
        break
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        fullConfig.delayMs * Math.pow(fullConfig.backoffMultiplier, attempt - 1),
        fullConfig.maxDelayMs,
      )
      
      logger.info('Retrying operation', { attempt, delay, error: error instanceof Error ? error.message : 'Unknown error' })
      
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

// Error handling hooks for Server Components
export function handleServerComponentError(error: unknown, componentName: string): never {
  const appError = normalizeError(error, componentName)
  
  logger.error('Server Component error', {
    component: componentName,
    type: appError.type,
    message: appError.message,
    code: appError.code,
  })

  // In development, throw the original error for better debugging
  if (process.env.NODE_ENV === 'development') {
    throw error
  }

  // In production, throw a user-friendly error
  throw new Error(getUserFriendlyMessage(appError))
}

// Global error handler for unhandled promise rejections
export function setupGlobalErrorHandlers(): void {
  if (typeof window !== 'undefined') {
    // Client-side error handling
    window.addEventListener('error', (event) => {
      logger.error('Unhandled error', {
        message: event.error?.message || event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      })
    })

    window.addEventListener('unhandledrejection', (event) => {
      logger.error('Unhandled promise rejection', {
        reason: event.reason instanceof Error ? event.reason.message : String(event.reason),
        stack: event.reason instanceof Error ? event.reason.stack : undefined,
      })
    })
  } else {
    // Server-side error handling
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', {
        message: error.message,
        stack: error.stack,
      })
    })

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled promise rejection', {
        reason: typeof reason === 'object' && reason !== null && 'message' in reason
          ? (reason as Error).message 
          : String(reason),
        stack: typeof reason === 'object' && reason !== null && 'stack' in reason
          ? (reason as Error).stack 
          : undefined,
      })
    })
  }
}

// Error analytics and monitoring
export interface ErrorMetrics {
  totalErrors: number
  errorsByType: Record<string, number>
  errorsByComponent: Record<string, number>
  errorsByTimeframe: Record<string, number>
  topErrors: Array<{ message: string; count: number }>
}

export function generateErrorMetrics(errors: AppError[]): ErrorMetrics {
  const metrics: ErrorMetrics = {
    totalErrors: errors.length,
    errorsByType: {},
    errorsByComponent: {},
    errorsByTimeframe: {},
    topErrors: [],
  }

  // Count errors by type
  errors.forEach(error => {
    metrics.errorsByType[error.type] = (metrics.errorsByType[error.type] || 0) + 1
  })

  // Count errors by component (for system errors)
  errors.forEach(error => {
    if (error.type === 'system') {
      const component = error.component || 'unknown'
      metrics.errorsByComponent[component] = (metrics.errorsByComponent[component] || 0) + 1
    }
  })

  // Count errors by hour for the last 24 hours
  const now = new Date()
  for (let i = 0; i < 24; i++) {
    const hour = new Date(now.getTime() - i * 60 * 60 * 1000)
    const hourKey = hour.getHours().toString().padStart(2, '0')
    metrics.errorsByTimeframe[hourKey] = 0
  }

  errors.forEach(error => {
    const errorHour = error.timestamp.getHours().toString().padStart(2, '0')
    if (Object.prototype.hasOwnProperty.call(metrics.errorsByTimeframe, errorHour)) {
      metrics.errorsByTimeframe[errorHour]++
    }
  })

  // Top error messages
  const messageCounts: Record<string, number> = {}
  errors.forEach(error => {
    messageCounts[error.message] = (messageCounts[error.message] || 0) + 1
  })

  metrics.topErrors = Object.entries(messageCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([message, count]) => ({ message, count }))

  return metrics
}

// Development utilities
export function logErrorInDevelopment(error: AppError, context?: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 ${error.type.toUpperCase()} ERROR ${context ? `(${context})` : ''}`)
    console.error('Message:', error.message)
    console.error('Code:', error.code)
    console.error('Timestamp:', error.timestamp)
    if ('stack' in error && error.stack) {
      console.error('Stack:', error.stack)
    }
    if (error.metadata) {
      console.error('Metadata:', error.metadata)
    }
    console.groupEnd()
  }
}

// These types are already exported above, no need to re-export