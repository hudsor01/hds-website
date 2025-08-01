'use client';

import { useEffect } from 'react';
import { ArrowPathIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useErrorStore, createErrorRecord } from '@/stores/error';
import { trackEvent } from '@/lib/analytics';

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const addError = useErrorStore((state) => state.addError);

  useEffect(() => {
    // Log error to error store
    const errorRecord = createErrorRecord(error, 'runtime', 'low');
    addError({
      ...errorRecord,
      metadata: {
        ...errorRecord.metadata,
        digest: error.digest,
        route: 'blog',
      },
    });

    // Track in analytics
    trackEvent('route_error', 'error', `blog: ${error.message}`);
  }, [error, addError]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/20">
          <DocumentTextIcon className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
          
          <h1 className="text-2xl font-bold text-white mb-4">
            Blog Content Unavailable
          </h1>
          
          <p className="text-gray-300 mb-8">
            We&apos;re having trouble loading blog content. Please try again in a moment.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="flex items-center justify-center gap-2 bg-cyan-400 text-black font-bold py-3 px-6 rounded-lg hover:bg-cyan-300 transition-colors"
            >
              <ArrowPathIcon className="w-5 h-5" />
              Reload Blog
            </button>
            
            <Link
              href="/"
              className="flex items-center justify-center gap-2 bg-gray-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}