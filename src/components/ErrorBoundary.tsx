"use client";
import React from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { trackEvent } from '@/lib/analytics';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorFallbackProps {
  error?: Error;
  resetError: () => void;
  retry: () => void;
}

function DefaultErrorFallback({ error, resetError, retry }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-red-500/20">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-6" />
          
          <h2 className="text-2xl font-bold text-white mb-4">
            Oops! Something went wrong
          </h2>
          
          <p className="text-gray-300 mb-6">
            We&apos;re sorry for the inconvenience. Please try refreshing the page or contact us if the problem persists.
          </p>
          
          {process.env.NODE_ENV === 'development' && error && (
            <details className="text-left mb-6 p-4 bg-black/30 rounded-lg border border-red-500/20">
              <summary className="text-red-400 cursor-pointer mb-2">
                Error Details (Development)
              </summary>
              <pre className="text-xs text-gray-300 overflow-auto">
                {error.message}
                {'\n'}
                {error.stack}
              </pre>
            </details>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={retry}
              className="flex items-center justify-center gap-2 bg-cyan-400 text-black font-bold py-3 px-6 rounded-lg hover:bg-cyan-300 transition-colors"
            >
              <ArrowPathIcon className="w-5 h-5" />
              Try Again
            </button>
            
            <button
              onClick={resetError}
              className="flex items-center justify-center gap-2 bg-gray-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Reset
            </button>
          </div>
          
          <p className="text-sm text-gray-400 mt-6">
            Need help? Contact us at{' '}
            <a 
              href="mailto:hello@hudsondigitalsolutions.com" 
              className="text-cyan-400 hover:text-cyan-300"
            >
              hello@hudsondigitalsolutions.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to analytics
    trackEvent('error_boundary_triggered', 'error', error.message);
    
    // Log to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry, LogRocket, etc.
      // Sentry.captureException(error);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    trackEvent('error_boundary_reset', 'error', 'manual_reset');
  };

  retry = () => {
    // Clear any existing timeout
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }

    trackEvent('error_boundary_retry', 'error', 'manual_retry');
    
    // Reset the error state
    this.resetError();
    
    // Optional: Add a small delay before retry to prevent immediate re-error
    this.retryTimeoutId = window.setTimeout(() => {
      // Force a re-render by updating the key prop or state
      this.forceUpdate();
    }, 100);
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
          retry={this.retry}
        />
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to handle errors
export function useErrorHandler() {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    trackEvent('error_handler_used', 'error', error.message);
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    
    // You could throw the error to be caught by an ErrorBoundary
    // throw error;
  };
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<ErrorFallbackProps>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}