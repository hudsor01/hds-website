'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BUSINESS_INFO } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { trackError } from '@/lib/analytics';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log structured error with context
    logger.error('Application Error Caught', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        digest: error.digest
      },
      page: 'error-page',
      route: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown'
    });

    // Track error in analytics
    trackError(error, true);
  }, [error]);

  return (
    <div className="min-h-screen flex-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-comfortable">
          <div className="inline-flex flex-center w-16 h-16 bg-destructive-muted dark:bg-destructive-bg-dark/20 rounded-full mb-heading">
            <svg
              className="w-8 h-8 text-destructive-dark dark:text-destructive-text"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground dark:text-foreground mb-subheading">
            Something went wrong
          </h1>
          <p className="text-muted-foreground dark:text-muted-foreground mb-content-block">
            We encountered an unexpected error. Our team has been notified.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground dark:text-muted-foreground mb-content-block font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="default"
            size="default"
            onClick={reset}
          >
            Try again
          </Button>
          <Button
            asChild
            variant="outline"
            size="default"
          >
            <Link href="/">
              Go home
            </Link>
          </Button>
        </div>

        <Card size="sm" className="mt-heading bg-muted dark:bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground dark:text-muted-foreground">
            Need immediate assistance?{' '}
            <a
              href={`mailto:${BUSINESS_INFO.email}`}
              className="link-primary"
            >
              Contact support
            </a>
          </p>
        </Card>
      </div>
    </div>
  );
}