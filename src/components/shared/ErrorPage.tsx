'use client';

import { useEffect } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
  pageType: 'root' | 'blog' | 'contact' | 'portfolio' | 'services';
}

const errorMessages = {
  root: {
    title: 'Something went wrong',
    description: 'An unexpected error occurred. Our team has been notified and is working to fix this issue.',
  },
  blog: {
    title: 'Blog Content Unavailable',
    description: 'We\'re having trouble loading the blog content. Please try again in a moment.',
  },
  contact: {
    title: 'Contact Form Temporarily Unavailable',
    description: 'We\'re having trouble loading the contact form. You can still reach us directly while we fix this issue.',
  },
  portfolio: {
    title: 'Portfolio Loading Error',
    description: 'We\'re experiencing issues loading our portfolio. Please try again shortly.',
  },
  services: {
    title: 'Services Page Error',
    description: 'We\'re having trouble loading our services information. Please try refreshing the page.',
  },
};

export default function ErrorPage({ error, reset, pageType }: ErrorPageProps) {
  const errorConfig = errorMessages[pageType];

  useEffect(() => {
    // Track in analytics
    trackEvent('route_error', 'error', `${pageType}: ${error.message}`);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`${pageType} page error:`, error);
    }
  }, [error, pageType]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-yellow-500/20">
          <ExclamationTriangleIcon className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
          
          <h1 className="text-2xl font-bold text-white mb-4">
            {errorConfig.title}
          </h1>
          
          <p className="text-gray-300 mb-6">
            {errorConfig.description}
          </p>
          
          {pageType === 'contact' && (
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
          )}
          
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 bg-cyan-400 text-black font-bold py-3 px-6 rounded-lg hover:bg-cyan-300 transition-colors mx-auto mb-4"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Try Again
          </button>
          
          <Link
            href="/"
            className="inline-block text-sm text-gray-400 hover:text-gray-300"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}