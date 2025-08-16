'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load the heavy ContactFormLight component to reduce initial bundle size
const ContactFormLight = dynamic(() => import('@/components/ContactFormLight'), {
  loading: () => <ContactFormSkeleton />,
  ssr: false // Contact form doesn't need SSR
});

const GoogleMap = dynamic(() => import('@/components/GoogleMap'), {
  loading: () => <MapSkeleton />
});

function MapSkeleton() {
  return (
    <div className="h-96 bg-gray-800 rounded-lg animate-pulse"></div>
  );
}

function ContactFormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Name fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-12 bg-gray-800/50 rounded-lg"></div>
        <div className="h-12 bg-gray-800/50 rounded-lg"></div>
      </div>
      {/* Email */}
      <div className="h-12 bg-gray-800/50 rounded-lg"></div>
      {/* Company */}
      <div className="h-12 bg-gray-800/50 rounded-lg"></div>
      {/* Service select */}
      <div className="h-12 bg-gray-800/50 rounded-lg"></div>
      {/* Budget select */}
      <div className="h-12 bg-gray-800/50 rounded-lg"></div>
      {/* Message textarea */}
      <div className="h-32 bg-gray-800/50 rounded-lg"></div>
      {/* Submit button */}
      <div className="h-12 bg-cyan-500/20 rounded-lg border border-cyan-500/30"></div>
    </div>
  );
}

// Client Component - metadata handled by layout

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-primary">
      {/* Simple gradient background - no complex animations */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 -z-10" />
      
      {/* Single accent gradient */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl -z-10" />
      
      {/* Header */}
      <section className="relative py-16">
        <div className="max-w-4xl mx-auto text-center px-6 sm:px-8 lg:px-12">
          <h1 className="text-5xl font-black text-white mb-6 glow-cyan">Let&apos;s Build Something Legendary</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Ready to dominate your market? Tell us about your vision and let&apos;s engineer a solution that crushes the competition.
          </p>
        </div>
      </section>
      
      {/* Contact Form Section - Two Column Layout */}
      <section className="relative py-12">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column - Google Map */}
            <div className="order-2 lg:order-1">
              <div className="sticky top-24">
                <Suspense fallback={<MapSkeleton />}>
                  <GoogleMap />
                </Suspense>
              </div>
            </div>
            
            {/* Right Column - Contact Form */}
            <div className="order-1 lg:order-2">
              <div className="bg-gray-900/90 backdrop-blur-sm border border-cyan-400/20 rounded-xl p-8 shadow-2xl">
                <ContactFormLight />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}