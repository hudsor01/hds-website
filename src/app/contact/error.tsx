'use client';

import { useEffect } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';

export default function ContactError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Track in analytics
    trackEvent('route_error', 'error', `contact: ${error.message}`);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Contact page error:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-yellow-500/20">
          <ExclamationTriangleIcon className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
          
          <h1 className="text-2xl font-bold text-white mb-4">
            Contact Form Temporarily Unavailable
          </h1>
          
          <p className="text-gray-300 mb-6">
            We&apos;re having trouble loading the contact form. You can still reach us directly while we fix this issue.
          </p>
          
          <div className="bg-black/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-300 mb-2">Email us directly at:</p>
            <a 
              href="mailto:hello@hudsondigitalsolutions.com" 
              className="flex items-center justify-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium"
            >
              <EnvelopeIcon className="w-5 h-5" />
              hello@hudsondigitalsolutions.com
            </a>
          </div>
          
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 bg-cyan-400 text-black font-bold py-3 px-6 rounded-lg hover:bg-cyan-300 transition-colors mx-auto"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Try Loading Form Again
          </button>
          
          <Link
            href="/"
            className="inline-block mt-4 text-sm text-gray-400 hover:text-gray-300"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}