'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Mail, Clock } from 'lucide-react';
import { useFeatureFlag } from '@/lib/feature-flags';
import { FEATURE_FLAGS } from '@/types/utils';
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
    <div className="h-96 bg-card rounded-lg animate-pulse"></div>
  );
}

function ContactFormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Name fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-12 bg-input rounded-lg"></div>
        <div className="h-12 bg-input rounded-lg"></div>
      </div>
      {/* Email */}
      <div className="h-12 bg-input rounded-lg"></div>
      {/* Company */}
      <div className="h-12 bg-input rounded-lg"></div>
      {/* Service select */}
      <div className="h-12 bg-input rounded-lg"></div>
      {/* Budget select */}
      <div className="h-12 bg-input rounded-lg"></div>
      {/* Message textarea */}
      <div className="h-32 bg-input rounded-lg"></div>
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
    <main className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <section className="relative min-h-screen flex-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-primary-20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-gradient-decorative-purple rounded-full blur-3xl" />
          <div className="absolute inset-0 grid-pattern" />
        </div>

        <div className="relative z-10 container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Hero Content */}
            <div className="space-y-8">
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 text-cyan-400 font-semibold text-sm blur-backdrop">
                  Let&apos;s Connect
                </span>
              </div>

              <div>
                <h1 className="text-clamp-2xl font-black text-white leading-none tracking-tight text-balance">
                  <span className="inline-block">Get Your Free</span>
                  <br />
                  <span className="inline-block gradient-text">ROI Roadmap</span>
                  <br />
                  <span className="inline-block">in 30 Minutes</span>
                </h1>
              </div>

              <div className="typography">
                <p className="text-responsive-md text-gray-300 leading-relaxed text-pretty">
                  See exactly where your tech stack is leaking revenue—and how to fix it. No sales pitch. No commitment. Just actionable insights you can use immediately.
                </p>
              </div>

              {/* Contact Info - Enhanced */}
              <div className="space-y-6">
                <div className="glass-card-light p-6 space-y-4">
                  <h3 className="text-lg font-bold text-white mb-4">What Happens Next?</h3>

                  <div className="flex items-start gap-4 text-gray-300">
                    <div className="w-10 h-10 rounded-full bg-gradient-primary-20 border border-cyan-400/30 flex-center shrink-0">
                      <span className="text-cyan-400 font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">We respond within 2 hours</p>
                      <p className="text-sm">Get a confirmation email with next steps</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 text-gray-300">
                    <div className="w-10 h-10 rounded-full bg-gradient-primary-20 border border-cyan-400/30 flex-center shrink-0">
                      <span className="text-cyan-400 font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">30-minute strategy call</p>
                      <p className="text-sm">We analyze your needs and identify revenue opportunities</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 text-gray-300">
                    <div className="w-10 h-10 rounded-full bg-gradient-primary-20 border border-cyan-400/30 flex-center shrink-0">
                      <span className="text-cyan-400 font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">Get your custom roadmap</p>
                      <p className="text-sm">Detailed plan with ROI projections you can use immediately</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-gray-300 p-4 bg-green-400/10 border border-green-400/30 rounded-lg">
                  <Clock className="w-6 h-6 text-green-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Guaranteed Response</p>
                    <p className="text-sm">Within 2 hours during business hours</p>
                  </div>
                </div>

                <div className="p-4 bg-cyan-400/10 border border-cyan-400/30 rounded-lg">
                  <p className="text-sm text-cyan-400 font-semibold mb-2">Join 50+ successful businesses</p>
                  <p className="text-xs text-gray-400">Average 250% ROI within 6 months</p>
                </div>
              </div>
            </div>

            {/* Right Column - Contact Form */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden glass-card p-8 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-hero-5" />
                <div className="relative z-10">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2 text-balance">Claim Your Free ROI Analysis</h2>
                    <div className="typography">
                      <p className="text-gray-400 text-pretty">Tell us about your business and we&apos;ll show you exactly where you&apos;re losing revenue—and how to fix it.</p>
                    </div>
                  </div>

                  {contactFormV2Enabled ? <ContactFormV2 /> : <ContactFormLight />}

                  {/* Trust badges */}
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                        <span>No sales pitch</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-cyan-400 rounded-full"></div>
                        <span>2-hour response time</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-purple-400 rounded-full"></div>
                        <span>50+ success stories</span>
                      </div>
                    </div>
                  </div>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </section>

      {/* Map Section */}
      <section className="relative py-20 px-4">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-clamp-xl font-black text-white mb-6 text-balance">
              <span className="gradient-text">
                Visit Our Office
              </span>
            </h2>
            <div className="typography">
              <p className="text-xl text-gray-300 container-narrow text-pretty">
                Located in the heart of Florida&apos;s tech corridor, ready to serve clients worldwide.
              </p>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden glass-card-light p-4">
            <Suspense fallback={<MapSkeleton />}>
              <GoogleMap />
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  );
}