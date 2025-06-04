'use client'

import React, { Component, type ReactNode } from 'react'
import type { ErrorInfo } from 'react'
import { logger } from '@/lib/logger'
import { 
  PageErrorFallback, 
  FormErrorFallback, 
  SectionErrorFallback, 
  ApiErrorFallback,
} from './error-fallbacks'
import type { BaseErrorBoundaryProps, BaseErrorBoundaryState } from '@/types/ui-types'

/**
 * Base error boundary class with common functionality
 */
abstract class BaseErrorBoundary extends Component<BaseErrorBoundaryProps, BaseErrorBoundaryState> {
  constructor(props: BaseErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): BaseErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error with context
    const context = this.getErrorContext()
    
    if (typeof logger !== 'undefined') {
      logger.error(`Error in ${context}`, {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        context,
      })
    } else {
      console.error(`Error in ${context}:`, error, errorInfo)
    }

    // Call the optional onError callback
    if (this.props.onError) {
    this.props.onError(error, errorInfo)
    }

    // Track error for analytics (if tracking is set up)
    if (typeof window !== 'undefined' && 'gtag' in window) {
      ;(window as { gtag: (command: string, eventName: string, parameters: Record<string, unknown>) => void }).gtag('event', 'exception', {
        description: `${context}: ${error.message}`,
        fatal: false,
      })
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  // Abstract method to be implemented by subclasses
  abstract getErrorContext(): string
  abstract renderFallback(): ReactNode

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return this.renderFallback()
    }

    return this.props.children
  }
}

/**
 * Page-level error boundary for entire pages
 */
export class PageErrorBoundary extends BaseErrorBoundary {
  getErrorContext() {
    return 'Page'
  }

  renderFallback() {
    return (
      <PageErrorFallback 
        error={this.state.error} 
        reset={this.reset}
        className={this.props.className}
      />
    )
  }
}

/**
 * Form-specific error boundary
 */
export class FormErrorBoundary extends BaseErrorBoundary {
  getErrorContext() {
    return 'Form'
  }

  renderFallback() {
    return (
      <FormErrorFallback 
        error={this.state.error} 
        reset={this.reset}
        className={this.props.className}
      />
    )
  }
}

/**
 * Section-level error boundary for page sections
 */
export class SectionErrorBoundary extends BaseErrorBoundary {
  getErrorContext() {
    return 'Section'
  }

  renderFallback() {
    return (
      <SectionErrorFallback 
        error={this.state.error} 
        reset={this.reset}
        className={this.props.className}
      />
    )
  }
}

/**
 * API/Data fetching error boundary
 */
export class ApiErrorBoundary extends BaseErrorBoundary {
  getErrorContext() {
    return 'API'
  }

  renderFallback() {
    return (
      <ApiErrorFallback 
        error={this.state.error} 
        reset={this.reset}
        className={this.props.className}
      />
    )
  }
}

/**
 * Service-specific error boundaries
 */
export class ServicesErrorBoundary extends BaseErrorBoundary {
  getErrorContext() {
    return 'Services Page'
  }

  renderFallback() {
    return (
      <PageErrorFallback 
        error={this.state.error} 
        reset={this.reset}
        className={this.props.className}
      />
    )
  }
}

export class ContactErrorBoundary extends BaseErrorBoundary {
  getErrorContext() {
    return 'Contact Page'
  }

  renderFallback() {
    return (
      <PageErrorFallback 
        error={this.state.error} 
        reset={this.reset}
        className={this.props.className}
      />
    )
  }
}

export class BlogErrorBoundary extends BaseErrorBoundary {
  getErrorContext() {
    return 'Blog Page'
  }

  renderFallback() {
    return (
      <PageErrorFallback 
        error={this.state.error} 
        reset={this.reset}
        className={this.props.className}
      />
    )
  }
}

/**
 * Higher-order component for wrapping components with error boundaries
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  ErrorBoundaryComponent: typeof BaseErrorBoundary = PageErrorBoundary,
  errorBoundaryProps?: Partial<BaseErrorBoundaryProps>,
) {
  const WithErrorBoundaryComponent = (props: P) => (
    <ErrorBoundaryComponent {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundaryComponent>
  )

  WithErrorBoundaryComponent.displayName = 
    `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`

  return WithErrorBoundaryComponent
}

/**
 * Hook for error boundary integration (for functional components)
 */
export function useErrorHandler() {
  return (error: Error) => {
    // This would typically trigger a parent error boundary
    throw error
  }
}