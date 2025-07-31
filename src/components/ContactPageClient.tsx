'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Loading skeletons
function ContactFormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 gap-4">
        <div className="h-12 bg-gray-800 rounded-lg"></div>
        <div className="h-12 bg-gray-800 rounded-lg"></div>
      </div>
      <div className="h-12 bg-gray-800 rounded-lg"></div>
      <div className="h-32 bg-gray-800 rounded-lg"></div>
      <div className="h-12 bg-gray-800 rounded-lg"></div>
    </div>
  );
}

function MapSkeleton() {
  return (
    <div className="h-96 bg-gray-800 rounded-lg animate-pulse"></div>
  );
}

// Lazy load components with ssr: false in client component
const ContactFormLight = dynamic(() => import('@/components/ContactFormLight'), {
  loading: () => <ContactFormSkeleton />,
  ssr: false
});

const GoogleMap = dynamic(() => import('@/components/GoogleMap'), {
  loading: () => <MapSkeleton />,
  ssr: false
});

export default function ContactPageClient() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Left Column - Map (lazy loaded) */}
      <div className="order-2 lg:order-1">
        <div className="sticky top-24">
          <Suspense fallback={<MapSkeleton />}>
            <GoogleMap />
          </Suspense>
        </div>
      </div>
      
      {/* Right Column - Contact Form (lazy loaded) */}
      <div className="order-1 lg:order-2">
        <div className="bg-gray-900/90 backdrop-blur-sm border border-cyan-400/20 rounded-xl p-8 shadow-2xl">
          <Suspense fallback={<ContactFormSkeleton />}>
            <ContactFormLight />
          </Suspense>
        </div>
      </div>
    </div>
  );
}