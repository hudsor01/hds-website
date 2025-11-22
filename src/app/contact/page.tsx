'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Mail, Clock } from 'lucide-react';

// Load the contact form - Server Actions need SSR
const ContactForm = dynamic(() => import('@/components/ContactForm'), {
  loading: () => <ContactFormSkeleton />
});

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
                  <span className="inline-block">Ready to</span>
                  <br />
                  <span className="inline-block gradient-text">Transform</span>
                  <br />
                  <span className="inline-block">Your Business?</span>
                </h1>
              </div>

              <div className="typography">
                <p className="text-responsive-md text-gray-300 leading-relaxed text-pretty">
                  Let&apos;s discuss your vision and create a custom solution that drives real results for your business.
                </p>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="w-12 h-12 rounded-full bg-gradient-primary-20 border border-cyan-400/30 flex-center">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Email</p>
                    <p>hello@hudsondigitalsolutions.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="w-12 h-12 rounded-full bg-gradient-decorative-purple border border-purple-400/30 flex-center">
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
              <div className="relative rounded-2xl overflow-hidden glass-card p-8 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-hero-5" />
                <div className="relative z-10">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2 text-balance">Start Your Project</h2>
                    <div className="typography">
                      <p className="text-gray-400 text-pretty">Tell us about your needs and we&apos;ll get back to you quickly.</p>
                    </div>
                  </div>

                  <ContactForm />
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