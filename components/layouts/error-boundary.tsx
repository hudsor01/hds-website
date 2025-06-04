'use client'

import React, { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'
import { logger } from '@/lib/logger'
import { Button } from '@/components/ui/button'

interface Props {
children: ReactNode
fallback?: ReactNode
onError?: (_errorToReport: Error, _errorInfoToReport: ErrorInfo) => void
variant?: 'simple' | 'detailed'
className?: string
darkMode?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error
    if (typeof logger !== 'undefined') {
      logger.error('ErrorBoundary caught an error', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      })
    } else {
      console.error('Error caught by boundary:', error, errorInfo)
    }

    // Call the optional onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      // Return custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      const {
        variant = 'simple',
        darkMode = false,
        className = '',
      } = this.props

      // Simple minimal fallback
      if (variant === 'simple') {
        return (
          <div
            className={`flex min-h-[400px] items-center justify-center px-4 ${className}`}
          >
            <div className='text-center'>
              <AlertCircle
                className={`mx-auto h-12 w-12 ${darkMode ? 'text-red-500' : 'text-red-600'}`}
              />
              <h2
                className={`mt-4 text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}
              >
                Something went wrong
              </h2>
              <p
                className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
              >
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <Button
                onClick={this.reset}
                className='mt-6'
                variant={darkMode ? 'default' : 'secondary'}
              >
                Try again
              </Button>
            </div>
          </div>
        )
      }

      // Detailed fallback with more information
      return (
        <div
          className={`flex flex-col items-center justify-center min-h-[400px] p-6 ${className}`}
        >
          <div className='max-w-md text-center'>
            <AlertCircle
              className={`mx-auto h-16 w-16 mb-4 ${darkMode ? 'text-red-500' : 'text-red-600'}`}
            />
            <h2
              className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}
            >
              Something went wrong
            </h2>
            <p
              className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}
            >
              We&apos;re sorry, but something unexpected happened.
            </p>
            {this.state.error && (
              <div className='mb-6 mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-md text-left overflow-auto max-h-[200px]'>
                <p className='font-mono text-sm text-red-600 dark:text-red-400 mb-2'>
                  {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <pre className='text-xs text-gray-600 dark:text-gray-400 overflow-auto'>
                    {this.state.error.stack.split('\n').slice(1, 5).join('\n')}
                  </pre>
                )}
              </div>
            )}
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Button
                onClick={this.reset}
                className='w-full sm:w-auto'
                variant={darkMode ? 'default' : 'secondary'}
              >
                Try again
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className='w-full sm:w-auto'
                variant='outline'
              >
                Refresh page
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
