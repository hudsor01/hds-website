'use client';

import { useState, type ComponentType, type ReactNode, type ErrorInfo as ReactErrorInfo } from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { AlertTriangle, RotateCw, Clipboard, Check } from 'lucide-react';
import { trackError } from '@/lib/analytics';
import { logger, castError } from '@/lib/logger';
// Error handling is now managed by React Query for API calls

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ReactErrorInfo) => void;
  onReset?: () => void;
  resetKeys?: Array<string | number>;
}

function DefaultErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const [copied, setCopied] = useState(false);

  const copyErrorDetails = async () => {
    if (!error) {return;}
    
    const errorDetails = `Error: ${error.message}\n\nStack Trace:\n${error.stack}\n\nTimestamp: ${new Date().toISOString()}\nUser Agent: ${navigator.userAgent}\nURL: ${window.location.href}`;
    
    try {
      await navigator.clipboard.writeText(errorDetails);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error('Failed to copy error details to clipboard', castError(err));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="glass-card p-8 border border-red-500/20">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-6" />
          
          <h2 className="text-2xl font-bold text-white mb-4">
            Oops! Something went wrong
          </h2>
          
          <p className="text-gray-300 mb-6">
            We&apos;re sorry for the inconvenience. Please try refreshing the page or contact us if the problem persists.
          </p>
          
          {error && (
            <details className="text-left mb-6 p-4 bg-black/30 rounded-lg border border-red-500/20">
              <summary className="text-red-400 cursor-pointer mb-2 flex-between">
                <span>Error Details</span>
                <button
                  onClick={copyErrorDetails}
                  className="ml-2 p-1 hover:bg-red-500/20 rounded transition-colors"
                  title="Copy error details"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Clipboard className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </summary>
              <div className="mt-3">
                <pre className="text-xs text-gray-300 overflow-auto scrollbar-hide whitespace-pre-wrap">
                  {error.message}
                  {'\n'}
                  {error.stack}
                </pre>
                <div className="mt-3 pt-3 border-t border-red-500/20">
                  <button
                    onClick={copyErrorDetails}
                    className="flex items-center gap-2 text-xs link-primary"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Clipboard className="w-3 h-3" />
                        Copy Error Details
                      </>
                    )}
                  </button>
                </div>
              </div>
            </details>
          )}
          
          <div className="flex-center">
            <button
              onClick={resetErrorBoundary}
              className="cta-primary flex items-center gap-2"
            >
              <RotateCw className="w-5 h-5" />
              Try Again
            </button>
          </div>
          
          <p className="text-sm text-gray-400 mt-6">
            Need help? Contact us at{' '}
            <a 
              href="mailto:hello@hudsondigitalsolutions.com" 
              className="link-primary"
            >
              hello@hudsondigitalsolutions.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary({
  children,
  fallback = DefaultErrorFallback,
  onError,
  onReset,
  resetKeys,
}: ErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: ReactErrorInfo) => {
    // Track error in analytics
    trackError(error, true);

    // Call custom error handler if provided
    onError?.(error, errorInfo);

    // Log error with structured context
    logger.error('Error Boundary Caught', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      componentStack: errorInfo.componentStack,
      errorBoundary: 'React Error Boundary',
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown'
    });
  };

  const handleReset = () => {
    trackError('Error boundary manually reset', false);
    onReset?.();
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={fallback}
      onError={handleError}
      onReset={handleReset}
      resetKeys={resetKeys}
    >
      {children}
    </ReactErrorBoundary>
  );
}

// Export default for backwards compatibility
export default ErrorBoundary;

// Component-specific error boundary with minimal UI
export function ComponentErrorBoundary({
  children,
  name,
}: {
  children: ReactNode;
  name: string;
}) {
  return (
    <ErrorBoundary
      fallback={({ resetErrorBoundary }) => (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Failed to load {name}
          </p>
          <button
            onClick={resetErrorBoundary}
            className="mt-2 text-xs text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 link-hover"
          >
            Retry
          </button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

// Error handling for API calls is now managed by React Query
// Use React Query's error handling: useMutation({ onError }) or useQuery({ onError })

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  fallback?: ComponentType<ErrorFallbackProps>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Error recovery component for async errors
export function AsyncErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      resetKeys={['async-error']}
      onError={(error) => {
        // Special handling for async errors
        if (error.message.includes('ChunkLoadError') || error.message.includes('Loading chunk')) {
          // Reload the page for chunk loading errors
          window.location.reload();
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
}