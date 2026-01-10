'use client';

import { useState, type ComponentType, type ReactNode, type ErrorInfo as ReactErrorInfo } from 'react';
import { Card } from "@/components/ui/card";
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { TIMEOUTS } from '@/lib/constants';
import { AlertTriangle, RotateCw, Clipboard, Check } from 'lucide-react';
import { trackError } from '@/lib/analytics';
import { logger, castError } from '@/lib/logger';
import { Button } from '@/components/ui/button';
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

    const errorDetails = `Error: ${error.message}\n\nStack Trace:\n${error.stack}\n\nTimestamp: ${new Date().toISOString()}\nUser Agent: ${navigator.userAgent}\nURL: ${window.location.href}\nPlatform: ${navigator.platform}\nLanguage: ${navigator.language}`;

    try {
      await navigator.clipboard.writeText(errorDetails);
      setCopied(true);
      setTimeout(() => setCopied(false), TIMEOUTS.COPY_FEEDBACK);
    } catch (err) {
      logger.error('Failed to copy error details to clipboard', castError(err));
      // Fallback to a textarea method if clipboard API fails
      const textArea = document.createElement('textarea');
      textArea.value = errorDetails;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), TIMEOUTS.COPY_FEEDBACK);
    }
  };

  // Function to send error report to support
  const reportError = async () => {
    if (!error) {return;}

    try {
      const errorReport = {
        message: error.message,
        stack: error.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        platform: navigator.platform,
        language: navigator.language
      };

      // In a real app, you would send this to your backend
      // await fetch('/api/error-report', {
      //   method: 'POST',
      //   body: JSON.stringify(errorReport)
      // });

      logger.info('Error report prepared for submission', errorReport);
      alert('Error report has been prepared. Please contact support with the error details.');
    } catch (err) {
      logger.error('Failed to report error', castError(err));
    }
  };

  return (
    <div className="min-h-screen bg-background flex-center">
      <div className="max-w-md w-full text-center">
        <Card variant="glass" size="lg" className="border border-danger/20">
          <AlertTriangle className="w-16 h-16 text-danger mx-auto mb-content-block" />

          <h2 className="text-2xl font-bold text-foreground mb-heading">
            Oops! Something went wrong
          </h2>

          <p className="text-secondary-foreground mb-content-block">
            We&apos;re sorry for the inconvenience. Please try refreshing the page or contact us if the problem persists.
          </p>

          {error && (
            <details className="text-left mb-content-block bg-bg-overlay/30 rounded-lg border border-danger/20">
              <summary className="text-danger cursor-pointer mb-subheading flex-between">
                <span>Error Details</span>
                <button
                  onClick={copyErrorDetails}
                  className="ml-2 p-1 hover:bg-danger/20 rounded transition-colors"
                  title="Copy error details"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <Clipboard className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </summary>
              <div className="mt-3">
                <pre className="text-xs text-secondary-foreground overflow-auto scrollbar-hide whitespace-pre-wrap">
                  {error.message}
                  {'\n'}
                  {error.stack}
                </pre>
                <div className="mt-3 pt-3 border-t border-danger/20 flex flex-col sm:flex-row gap-tight">
                  <button
                    onClick={copyErrorDetails}
                    className="flex items-center gap-tight text-xs link-primary py-1"
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
                  <button
                    onClick={reportError}
                    className="flex items-center gap-tight text-xs link-primary py-1"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    Report Error
                  </button>
                </div>
              </div>
            </details>
          )}

          <div className="flex-center">
            <Button
              onClick={resetErrorBoundary}
              variant="default"
              size="default"
            >
              <RotateCw className="w-5 h-5" />
              Try Again
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-content-block">
            Need help? Contact us at{' '}
            <a
              href="mailto:hello@hudsondigitalsolutions.com"
              className="link-primary"
            >
              hello@hudsondigitalsolutions.com
            </a>
          </p>
        </Card>
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
        stack: error.stack,
        cause: (error as Error & { cause?: unknown }).cause
      },
      componentStack: errorInfo.componentStack,
      errorBoundary: 'React Error Boundary',
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown',
      platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
      language: typeof navigator !== 'undefined' ? navigator.language : 'unknown',
      cookieEnabled: typeof navigator !== 'undefined' ? navigator.cookieEnabled : 'unknown',
      online: typeof navigator !== 'undefined' ? navigator.onLine : 'unknown'
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
        <div className="bg-warning/10 dark:bg-warning/20 border border-warning/30 dark:border-warning/40 rounded-lg">
          <p className="text-sm text-warning dark:text-warning">
            Failed to load {name}
          </p>
          <button
            onClick={resetErrorBoundary}
            className="mt-2 text-xs text-warning hover:text-warning dark:text-warning dark:hover:text-warning link-hover"
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
