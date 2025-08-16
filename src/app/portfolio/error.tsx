'use client';

import { useEffect } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { trackEvent } from '@/lib/analytics';

export default function PortfolioError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {

  useEffect(() => {
    // Track in analytics
    trackEvent('route_error', 'error', `portfolio: ${error.message}`);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Portfolio page error:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/20">
          <ExclamationTriangleIcon className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
          
          <h1 className="text-2xl font-bold text-white mb-4">
            Portfolio Loading Error
          </h1>
          
          <p className="text-gray-300 mb-8">
            We couldn&apos;t load our portfolio showcase. Please try again.
          </p>
          
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 bg-cyan-400 text-black font-bold py-3 px-6 rounded-lg hover:bg-cyan-300 transition-colors mx-auto"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Reload Portfolio
          </button>
        </div>
      </div>
    </div>
  );
}