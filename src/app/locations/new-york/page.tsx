/**
 * New York City Local SEO Page
 * Optimized for local search with LocalBusiness schema markup
 */

import type { Metadata } from 'next';
import { CTAButton } from '@/components/cta-button';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Web Development Services in New York City | Hudson Digital Solutions',
  description: 'Professional web development, e-commerce, and digital solutions in NYC, Brooklyn, Queens, Manhattan. Trusted by 30+ New York businesses.',
  keywords: 'web development nyc, software consulting new york, ecommerce development manhattan, nyc web design, new york tech consulting',
};

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Hudson Digital Solutions',
  url: 'https://hudsondigitalsolutions.com/locations/new-york',
  email: 'hello@hudsondigitalsolutions.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'New York',
    addressRegion: 'NY',
    addressCountry: 'US',
  },
  areaServed: [
    { '@type': 'City', name: 'New York' },
    { '@type': 'City', name: 'Brooklyn' },
    { '@type': 'City', name: 'Queens' },
    { '@type': 'City', name: 'Bronx' },
    { '@type': 'City', name: 'Staten Island' },
  ],
};

export default function NewYorkPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        <section className="py-20 px-4">
          <div className="container-wide text-center">
            <div className="inline-block mb-4 px-4 py-2 bg-cyan-900/30 border border-cyan-500/30 rounded-full">
              <span className="text-cyan-400 font-semibold text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                New York City
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
              Web Development & Digital Solutions in <span className="gradient-text">New York City</span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Trusted by 30+ NYC businesses. We build high-performing websites, e-commerce platforms, and custom software for businesses across all five boroughs.
            </p>

            <div className="flex justify-center gap-4">
              <CTAButton href="/contact" variant="primary" size="lg">
                Schedule Free Consultation
              </CTAButton>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-gray-800/30">
          <div className="container-wide">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Serving All of New York City
            </h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island', 'Jersey City'].map((area) => (
                <div key={area} className="glass-card p-4 text-center">
                  <MapPin className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <span className="text-white font-semibold">{area}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container-wide max-w-4xl mx-auto">
            <NewsletterSignup variant="sidebar" />
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="container-wide text-center">
            <div className="glass-section p-12">
              <h2 className="text-4xl font-black text-white mb-6">
                Let's Build Something Great in NYC
              </h2>
              <CTAButton href="/contact" variant="primary" size="lg">
                Get Started Today
              </CTAButton>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
