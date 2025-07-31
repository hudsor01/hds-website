import { Metadata } from "next";
import { SEO_CONFIG } from "@/utils/seo";
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load components to reduce initial bundle
const ContactFormLight = dynamic(() => import('@/components/ContactFormLight'), {
  loading: () => <ContactFormSkeleton />
});

const GoogleMap = dynamic(() => import('@/components/GoogleMap'), {
  loading: () => <MapSkeleton />
});

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

// SSR metadata for SEO
export const metadata: Metadata = {
  title: SEO_CONFIG.contact.title,
  description: SEO_CONFIG.contact.description,
  keywords: SEO_CONFIG.contact.keywords,
  openGraph: {
    title: SEO_CONFIG.contact.ogTitle ?? SEO_CONFIG.contact.title,
    description: SEO_CONFIG.contact.ogDescription ?? SEO_CONFIG.contact.description,
    url: SEO_CONFIG.contact.canonical,
    images: [
      {
        url: SEO_CONFIG.contact.ogImage ?? "",
        alt: SEO_CONFIG.contact.title,
      },
    ],
  },
  alternates: {
    canonical: SEO_CONFIG.contact.canonical,
  },
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
    "max-video-preview": -1,
  },
};

export default function ContactPageLight() {
  return (
    <main className="min-h-screen bg-gradient-primary">
      {/* Simple gradient background - no complex animations */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 -z-10" />
      
      {/* Single accent gradient */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl -z-10" />
      
      {/* Header */}
      <section className="relative py-16">
        <div className="max-w-4xl mx-auto text-center px-6 sm:px-8 lg:px-12">
          <h1 className="text-5xl font-black text-white mb-6">
            Let&apos;s Build Something Legendary
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Ready to dominate your market? Tell us about your vision and let&apos;s engineer a solution that crushes the competition.
          </p>
        </div>
      </section>
      
      {/* Contact Section - Optimized Layout */}
      <section className="relative py-12">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
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
        </div>
      </section>
    </main>
  );
}