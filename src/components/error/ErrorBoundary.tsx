'use client';

import { useState, type ComponentType, type ReactNode, type ErrorInfo as ReactErrorInfo } from 'react';
import { Card } from "@/components/ui/card";
import { ErrorBoundary as ReactErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { AlertTriangle, RotateCw, Clipboard, Check } from 'lucide-react';
import { trackError } from '@/lib/analytics';
import { logger } from '@/lib/logger';
import { castError } from '@/lib/utils/errors';
import { Button } from '@/components/ui/button';

// Use FallbackProps from react-error-boundary for compatibility
// error is 'unknown' in the library's type, so we cast to Error where needed
type ErrorFallbackProps = FallbackProps;

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ReactErrorInfo) => void;
  onReset?: () => void;
  resetKeys?: Array<string | number>;
}

interface CopyButtonProps {
  copied: boolean;
  onClick: () => void;
  variant: 'icon' | 'text';
}

/**
 * Reusable copy button with copied state feedback
 */
function CopyButton({ copied, onClick, variant }: CopyButtonProps) {
  if (variant === 'icon') {
    return (
      <Button
        type="button"
        onClick={onClick}
        variant="ghost"
        size="icon-sm"
        className="ml-2"
        title="Copy error details"
        aria-label="Copy error details"
      >
        {copied ? (
          <Check className="w-4 h-4 text-success" />
        ) : (
          <Clipboard className="w-4 h-4 text-muted-foreground" />
        )}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      onClick={onClick}
      variant="link"
      size="sm"
      className="h-auto px-0 text-xs"
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
    </Button>
  );
}

/**
 * Builds error details string for clipboard/reporting
 */
function buildErrorDetails(error: Error): string {
  return [
    `Error: ${error.message}`,
    '',
    'Stack Trace:',
    error.stack ?? 'No stack trace available',
    '',
    `Timestamp: ${new Date().toISOString()}`,
    `User Agent: ${navigator.userAgent}`,
    `URL: ${window.location.href}`,
    `Platform: ${navigator.platform}`,
    `Language: ${navigator.language}`,
  ].join('\n');
}

/**
 * Copies text to clipboard with fallback for older browsers
 */
async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Fallback for browsers without clipboard API support
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
}

function DefaultErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const [copied, setCopied] = useState(false);
  // Cast unknown error to Error type for consistent handling
  const typedError = error instanceof Error ? error : new Error(String(error));

  const copyErrorDetails = async () => {
    try {
      await copyToClipboard(buildErrorDetails(typedError));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error('Failed to copy error details to clipboard', castError(err));
    }
  };

  const reportError = () => {
    const errorReport = {
      message: typedError.message,
      stack: typedError.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      platform: navigator.platform,
      language: navigator.language,
    };

    logger.info('Error report prepared for submission', errorReport);
    alert('Error report has been prepared. Please contact support with the error details.');
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

          {typedError && (
            <details className="text-left mb-content-block bg-bg-overlay/30 rounded-lg border border-danger/20">
              <summary className="text-danger cursor-pointer mb-subheading flex-between">
                <span>Error Details</span>
                <CopyButton copied={copied} onClick={copyErrorDetails} variant="icon" />
              </summary>
              <div className="mt-3">
                <pre className="text-xs text-secondary-foreground overflow-auto scrollbar-hide whitespace-pre-wrap">
                  {typedError.message}
                  {'\n'}
                  {typedError.stack}
                </pre>
                <div className="mt-3 pt-3 border-t border-danger/20 flex flex-col sm:flex-row gap-tight">
                  <CopyButton copied={copied} onClick={copyErrorDetails} variant="text" />
                  <Button
                    type="button"
                    onClick={reportError}
                    variant="link"
                    size="sm"
                    className="h-auto px-0 text-xs"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    Report Error
                  </Button>
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
  const handleError = (error: unknown, errorInfo: ReactErrorInfo) => {
    // Cast unknown error to Error type for consistent handling
    const typedError = error instanceof Error ? error : new Error(String(error));

    // Track error in analytics
    trackError(typedError, true);

    // Call custom error handler if provided
    onError?.(typedError, errorInfo);

    // Log error with structured context
    logger.error('Error Boundary Caught', {
      error: {
        name: typedError.name,
        message: typedError.message,
        stack: typedError.stack,
        cause: (typedError as Error & { cause?: unknown }).cause
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
          <Button
            type="button"
            onClick={resetErrorBoundary}
            variant="link"
            size="sm"
            className="mt-2 h-auto px-0 text-xs text-warning hover:text-warning"
          >
            Retry
          </Button>
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
