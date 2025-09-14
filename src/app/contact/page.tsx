'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { useFeatureFlag } from '@/lib/feature-flags';
import { FEATURE_FLAGS } from '@/types/utils';
import { Mail, Clock } from 'lucide-react';
// import { usePageTracking, useBusinessTracking } from '@/components/AnalyticsProvider';

// Load the contact form - Server Actions need SSR
const ContactForm = dynamic(() => import('@/components/ContactForm'), {
  loading: () => <ContactFormSkeleton />
});

// For now, use the same component for both variants
const ContactFormLight = ContactForm;
const ContactFormV2 = ContactForm;

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
  const contactFormV2Enabled = useFeatureFlag(FEATURE_FLAGS.CONTACT_FORM_V2);
  // Track page view and business events
  // usePageTracking();
  // const { trackServiceInterest } = useBusinessTracking();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(34,211,238,0.1)_50%,transparent_51%)] bg-size-[60px_60px]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_49%,rgba(34,211,238,0.1)_50%,transparent_51%)] bg-size-[60px_60px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Hero Content */}
            <div className="space-y-8">
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 text-cyan-400 font-semibold text-sm backdrop-blur-sm">
                  Let&apos;s Connect
                </span>
              </div>

              <div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-none tracking-tight text-balance">
                  <span className="inline-block">Ready to</span>
                  <br />
                  <span className="inline-block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Transform</span>
                  <br />
                  <span className="inline-block">Your Business?</span>
                </h1>
              </div>

              <div className="typography">
                <p className="text-xl md:text-2xl text-gray-300 leading-relaxed text-pretty">
                  Let&apos;s discuss your vision and create a custom solution that drives real results for your business.
                </p>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 flex items-center justify-center">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Email</p>
                    <p>hello@hudsondigitalsolutions.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Response Time</p>
                    <p>Within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Contact Form */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 p-8 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5" />
                <div className="relative z-10">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2 text-balance">Start Your Project</h2>
                    <div className="typography">
                      <p className="text-gray-400 text-pretty">Tell us about your needs and we&apos;ll get back to you quickly.</p>
                    </div>
                  </div>
                  
                  {contactFormV2Enabled ? <ContactFormV2 /> : <ContactFormLight />}
                 </div>
               </div>
             </div>
           </div>
         </div>
       </section>

      {/* Map Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 text-balance">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Visit Our Office
              </span>
            </h2>
            <div className="typography">
              <p className="text-xl text-gray-300 max-w-3xl mx-auto text-pretty">
                Located in the heart of Florida&apos;s tech corridor, ready to serve clients worldwide.
              </p>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 p-4">
            <Suspense fallback={<MapSkeleton />}>
              <GoogleMap />
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  );
}