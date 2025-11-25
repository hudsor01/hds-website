/**
 * San Francisco / Bay Area Local SEO Page
 * Optimized for local search with LocalBusiness schema markup
 */

import type { Metadata } from 'next';
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { ArrowRight, MapPin, Mail, Clock } from 'lucide-react';
import { NewsletterSignup } from '@/components/NewsletterSignup';

export const metadata: Metadata = {
  title: 'Web Development Services in San Francisco & Bay Area | Hudson Digital',
  description: 'Professional web development, SaaS consulting, and digital solutions in San Francisco, San Jose, Oakland, and the entire Bay Area. Trusted by 50+ local businesses.',
  keywords: 'web development san francisco, software consulting bay area, saas development silicon valley, san francisco web design, bay area tech consulting',
  openGraph: {
    title: 'Web Development Services in San Francisco & Bay Area',
    description: 'Professional web development and digital solutions serving San Francisco, San Jose, Oakland, and the entire Bay Area.',
    type: 'website',
  },
};

// LocalBusiness Schema Markup
const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Hudson Digital Solutions',
  image: 'https://hudsondigitalsolutions.com/logo.png',
  '@id': 'https://hudsondigitalsolutions.com',
  url: 'https://hudsondigitalsolutions.com/locations/san-francisco',
  telephone: '+1-XXX-XXX-XXXX',
  email: 'hello@hudsondigitalsolutions.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'San Francisco',
    addressRegion: 'CA',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 37.7749,
    longitude: -122.4194,
  },
  areaServed: [
    { '@type': 'City', name: 'San Francisco' },
    { '@type': 'City', name: 'San Jose' },
    { '@type': 'City', name: 'Oakland' },
    { '@type': 'City', name: 'Berkeley' },
    { '@type': 'City', name: 'Palo Alto' },
    { '@type': 'City', name: 'Mountain View' },
    { '@type': 'City', name: 'Sunnyvale' },
    { '@type': 'City', name: 'Santa Clara' },
  ],
  priceRange: '$$$',
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '09:00',
    closes: '17:00',
  },
  sameAs: [
    'https://www.linkedin.com/company/hudson-digital-solutions',
    'https://github.com/hudson-digital',
  ],
};

export default function SanFranciscoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        {/* Hero */}
        <section className="py-20 px-4">
          <div className="container-wide text-center">
            <div className="inline-block mb-4 px-4 py-2 bg-cyan-900/30 border border-cyan-500/30 rounded-full">
              <span className="text-cyan-400 font-semibold text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                San Francisco & Bay Area
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
              Web Development & SaaS Consulting in <span className="gradient-text">San Francisco</span>
            </h1>

            <p className="text-xl text-muted mb-8 max-w-3xl mx-auto">
              Trusted by 50+ Bay Area businesses. We build scalable web applications, optimize SaaS products, and deliver measurable results for startups and enterprises.
            </p>

            <div className="flex justify-center gap-4">
              <Button asChild variant="default" size="lg" trackConversion={true}>
      <Link href="/contact">
        Schedule Free Consultation
        <ArrowRight className="w-4 h-4" />
      </Link>
    </Button>
              <Button asChild variant="outline" size="lg" trackConversion={true}>
      <Link href="/case-studies">
        View Bay Area Case Studies
        <ArrowRight className="w-4 h-4" />
      </Link>
    </Button>
            </div>
          </div>
        </section>

        {/* Service Areas */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container-wide">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Proudly Serving the Bay Area
            </h2>

            <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                'San Francisco',
                'San Jose',
                'Oakland',
                'Berkeley',
                'Palo Alto',
                'Mountain View',
                'Sunnyvale',
                'Santa Clara',
              ].map((city, i) => (
                <div key={i} className="glass-card p-4 text-center">
                  <MapPin className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <span className="text-white font-semibold">{city}</span>
                </div>
              ))}
            </div>

            <p className="text-center text-muted-foreground mt-8">
              Also serving Fremont, Hayward, San Mateo, Redwood City, and the entire Bay Area
            </p>
          </div>
        </section>

        {/* Local Services */}
        <section className="py-16 px-4">
          <div className="container-wide">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Services for Bay Area Businesses
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'SaaS Development',
                  description: 'Full-stack development for Silicon Valley startups. Scale from MVP to enterprise-ready.',
                  features: ['React/Next.js', 'Node.js/Python', 'PostgreSQL/MongoDB', 'AWS/GCP deployment'],
                },
                {
                  title: 'E-commerce Solutions',
                  description: 'High-converting online stores for Bay Area retailers. Mobile-first, fast, secure.',
                  features: ['Shopify Plus', 'WooCommerce', 'Headless commerce', 'Payment integration'],
                },
                {
                  title: 'Enterprise Consulting',
                  description: 'Technical leadership for established Bay Area companies. Architecture, optimization, scaling.',
                  features: ['Tech stack modernization', 'Performance optimization', 'Team augmentation', 'CTO advisory'],
                },
              ].map((service, i) => (
                <div key={i} className="glass-card p-6">
                  <h3 className="text-2xl font-bold text-white mb-3">{service.title}</h3>
                  <p className="text-muted mb-4">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2 text-muted-foreground">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Local Testimonial */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container-wide max-w-4xl mx-auto">
            <div className="glass-card p-8">
              <blockquote className="text-2xl text-muted italic mb-6">
                "Hudson Digital Solutions helped us scale from 10K to 100K users without a single outage. Their expertise in Bay Area tech trends and startup needs is unmatched."
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <span className="text-cyan-400 font-bold text-2xl">S</span>
                </div>
                <div>
                  <div className="font-bold text-white text-lg">Sarah Chen</div>
                  <div className="text-muted-foreground">CTO, TechFlow Analytics</div>
                  <div className="text-muted-foreground text-sm">San Francisco, CA</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="py-16 px-4">
          <div className="container-wide">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Get in Touch
            </h2>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="glass-card p-6 text-center">
                <Mail className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Email</h3>
                <a href="mailto:hello@hudsondigitalsolutions.com" className="text-cyan-400 hover:text-cyan-300">
                  hello@hudsondigitalsolutions.com
                </a>
              </div>

              <div className="glass-card p-6 text-center">
                <Clock className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Hours</h3>
                <p className="text-muted-foreground">Mon-Fri: 9am - 5pm PST</p>
              </div>

              <div className="glass-card p-6 text-center">
                <MapPin className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Location</h3>
                <p className="text-muted-foreground">Serving all of Bay Area</p>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-16 px-4">
          <div className="container-wide max-w-4xl mx-auto">
            <NewsletterSignup
              variant="sidebar"
              title="Bay Area Tech Insights"
              description="Join 500+ Bay Area tech leaders receiving our weekly newsletter on scaling startups, SaaS best practices, and Silicon Valley trends."
            />
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4">
          <div className="container-wide text-center">
            <div className="glass-section p-12">
              <h2 className="text-4xl font-black text-white mb-6">
                Ready to Build Something Amazing?
              </h2>
              <p className="text-xl text-muted mb-8 max-w-2xl mx-auto">
                Let's discuss your project over coffee in San Francisco or a video call.
              </p>
              <Button asChild variant="default" size="lg" trackConversion={true}>
      <Link href="/contact">
        Schedule Free Consultation
        <ArrowRight className="w-4 h-4" />
      </Link>
    </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
