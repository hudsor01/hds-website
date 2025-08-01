'use client';

import { useEffect } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon, HomeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useErrorStore, createErrorRecord } from '@/stores/error';
import { trackEvent } from '@/lib/analytics';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const addError = useErrorStore((state) => state.addError);

  useEffect(() => {
    // Log error to error store
    const errorRecord = createErrorRecord(error, 'runtime', 'high');
    addError({
      ...errorRecord,
      metadata: {
        ...errorRecord.metadata,
        digest: error.digest,
        route: 'root',
      },
    });

    // Track in analytics
    trackEvent('route_error', 'error', `root: ${error.message}`);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Root route error:', error);
    }
  }, [error, addError]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-red-500/20">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-6" />
          
          <h1 className="text-3xl font-bold text-white mb-4">
            Something went wrong!
          </h1>
          
          <p className="text-gray-300 mb-8">
            We encountered an unexpected error. Please try again or return to the homepage.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="flex items-center justify-center gap-2 bg-cyan-400 text-black font-bold py-3 px-6 rounded-lg hover:bg-cyan-300 transition-colors"
            >
              <ArrowPathIcon className="w-5 h-5" />
              Try Again
            </button>
            
            <Link
              href="/"
              className="flex items-center justify-center gap-2 bg-gray-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <HomeIcon className="w-5 h-5" />
              Go Home
            </Link>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-8 text-left p-4 bg-black/30 rounded-lg border border-red-500/20">
              <summary className="text-red-400 cursor-pointer">
                Error Details
              </summary>
              <pre className="mt-2 text-xs text-gray-300 overflow-auto whitespace-pre-wrap">
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}