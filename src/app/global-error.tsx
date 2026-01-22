'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { createServerLogger } from '@/lib/logger';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Create logger instance for critical error
    const logger = createServerLogger('global-error');

    // Log critical global error with comprehensive context
    logger.error('CRITICAL: Global Application Error', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        digest: error.digest
      },
      level: 'critical',
      component: 'global-error-boundary',
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown',
      sessionStorage: typeof window !== 'undefined' ? {
        hasSessionData: Boolean(window.sessionStorage.length),
        sessionLength: window.sessionStorage.length
      } : null,
      localStorage: typeof window !== 'undefined' ? {
        hasLocalData: Boolean(window.localStorage.length),
        localLength: window.localStorage.length
      } : null
    });

    // Try to send to our analytics system without third-party dependencies
    try {
      if (typeof window !== 'undefined' && window && 'analytics' in window && window.analytics) {
        const analytics = window.analytics as {
          track: (event: string, properties: Record<string, unknown>) => void;
        };
        analytics.track('global_error', {
          error_name: error.name,
          error_message: error.message,
          error_digest: error.digest,
          critical: true,
          url: window.location.href,
          userAgent: navigator.userAgent,
        });
      }
    } catch (trackingError) {
      logger.warn('Failed to track global error in analytics', {
        error: trackingError instanceof Error ? trackingError.message : String(trackingError)
      });
    }
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
          <div style={{
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 24px',
              backgroundColor: '#fee2e2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#dc2626"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            <h1 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '12px',
              color: '#111827',
            }}>
              Application Error
            </h1>

            <p style={{
              color: '#6b7280',
              marginBottom: '24px',
              lineHeight: '1.5',
            }}>
              A critical error occurred and the application could not recover.
              Please refresh the page or try again later.
            </p>

            {error.digest && (
              <p style={{
                fontSize: '12px',
                color: '#9ca3af',
                marginBottom: '24px',
                fontFamily: 'monospace',
              }}>
                Error ID: {error.digest}
              </p>
            )}

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}>
              <Button type="button" onClick={reset} variant="default">
                Try again
              </Button>
              <Button
                type="button"
                onClick={() => window.location.href = '/'}
                variant="muted"
              >
                Go home
              </Button>
            </div>

            <div style={{
              marginTop: '32px',
              padding: '16px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
              }}>
                If this issue persists, please contact{' '}
                <a
                  href="mailto:hello@hudsondigitalsolutions.com"
                  style={{
                    color: '#06b6d4',
                    textDecoration: 'underline',
                  }}
                >
                  support
                </a>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
