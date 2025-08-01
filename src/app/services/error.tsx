'use client';

import { useEffect } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useErrorStore, createErrorRecord } from '@/stores/error';
import { trackEvent } from '@/lib/analytics';

export default function ServicesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const addError = useErrorStore((state) => state.addError);

  useEffect(() => {
    // Log error to error store
    const errorRecord = createErrorRecord(error, 'runtime', 'medium');
    addError({
      ...errorRecord,
      metadata: {
        ...errorRecord.metadata,
        digest: error.digest,
        route: 'services',
      },
    });

    // Track in analytics
    trackEvent('route_error', 'error', `services: ${error.message}`);
  }, [error, addError]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/20">
          <ExclamationTriangleIcon className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
          
          <h1 className="text-2xl font-bold text-white mb-4">
            Unable to Load Services
          </h1>
          
          <p className="text-gray-300 mb-8">
            We&apos;re having trouble displaying our services. Please try again or contact us directly.
          </p>
          
          <div className="flex flex-col gap-4">
            <button
              onClick={reset}
              className="flex items-center justify-center gap-2 bg-cyan-400 text-black font-bold py-3 px-6 rounded-lg hover:bg-cyan-300 transition-colors"
            >
              <ArrowPathIcon className="w-5 h-5" />
              Try Again
            </button>
            
            <Link
              href="/contact"
              className="text-cyan-400 hover:text-cyan-300 font-medium"
            >
              Contact Us for Service Information
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}