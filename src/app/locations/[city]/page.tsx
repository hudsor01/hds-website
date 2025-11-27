/**
 * Dynamic Location Page
 * SEO-optimized pages for Texas cities
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, ArrowRight, Building2, CheckCircle, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  getAllLocationSlugs,
  getLocationBySlug,
  generateLocalBusinessSchema,
} from '@/lib/locations';

interface PageProps {
  params: Promise<{ city: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllLocationSlugs();
  return slugs.map((city) => ({ city }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city } = await params;
  const location = getLocationBySlug(city);

  if (!location) {
    return {
      title: 'Location Not Found | Hudson Digital Solutions',
    };
  }

  return {
    title: `Web Development in ${location.city}, ${location.stateCode} | Hudson Digital Solutions`,
    description: location.metaDescription,
    keywords: `web development ${location.city.toLowerCase()}, software consulting ${location.state.toLowerCase()}, ecommerce development ${location.city.toLowerCase()}, ${location.city.toLowerCase()} web design`,
    openGraph: {
      title: `Web Development Services in ${location.city} | Hudson Digital Solutions`,
      description: location.metaDescription,
      url: `https://hudsondigitalsolutions.com/locations/${location.slug}`,
    },
  };
}

export default async function LocationPage({ params }: PageProps) {
  const { city } = await params;
  const location = getLocationBySlug(city);

  if (!location) {
    notFound();
  }

  const schema = generateLocalBusinessSchema(location);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-[var(--color-brand-primary)] text-[var(--color-text-inverted)] py-20 md:py-28">
          <div className="container-wide text-center">
            <Badge variant="secondary" className="mb-4 bg-[var(--color-text-inverted)]/10 text-[var(--color-text-inverted)] border-0">
              <MapPin className="size-4 mr-1" />
              {location.city}, {location.stateCode}
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Web Development & Digital Solutions in{' '}
              <span className="text-[var(--color-brand-secondary)]">{location.city}</span>
            </h1>

            <p className="text-xl text-[var(--color-text-inverted)]/90 mb-8 max-w-3xl mx-auto">
              {location.description}
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-text-inverted)] text-[var(--color-brand-primary)] rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Schedule Free Consultation
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent border-2 border-[var(--color-text-inverted)]/30 text-[var(--color-text-inverted)] rounded-lg font-semibold hover:bg-[var(--color-text-inverted)]/10 transition-colors"
              >
                View Our Services
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-background border-b">
          <div className="container-wide">
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
              <div>
                <p className="text-3xl md:text-4xl font-bold text-[var(--color-brand-primary)]">
                  {location.stats.businesses}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Local Businesses
                </p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-[var(--color-brand-primary)]">
                  {location.stats.projects}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Projects Delivered
                </p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-[var(--color-brand-primary)]">
                  {location.stats.satisfaction}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Client Satisfaction
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16 md:py-20 bg-muted/30">
          <div className="container-wide">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Our Services in {location.city}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Tailored digital solutions designed for the unique needs of {location.city} businesses.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {location.features.map((feature, index) => (
                <Card key={index} className="hover:border-[var(--color-brand-primary)] transition-colors">
                  <CardHeader>
                    <div className="size-12 rounded-lg bg-[var(--color-brand-primary)]/10 flex items-center justify-center text-[var(--color-brand-primary)] mb-4">
                      <Building2 className="size-6" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Areas Served */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container-wide">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Serving the {location.city} Area
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We work with businesses across the greater {location.city} metropolitan area.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {location.neighborhoods.map((area) => (
                <Card key={area} className="text-center hover:border-[var(--color-brand-primary)] transition-colors">
                  <CardContent className="p-4">
                    <MapPin className="size-5 text-[var(--color-brand-primary)] mx-auto mb-2" />
                    <span className="font-medium text-foreground text-sm">{area}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 md:py-20 bg-muted/30">
          <div className="container-wide">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Why {location.city} Businesses Choose Us
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: 'Local Understanding',
                    description: `We understand the ${location.city} market and the unique challenges local businesses face.`,
                  },
                  {
                    title: 'Texas-Based Team',
                    description: 'Work with a team that shares your timezone and understands Texas business culture.',
                  },
                  {
                    title: 'Proven Track Record',
                    description: `${location.stats.projects} successful projects delivered for ${location.city} area businesses.`,
                  },
                  {
                    title: 'Full-Service Support',
                    description: 'From strategy to development to ongoing support, we handle everything.',
                  },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="size-8 rounded-full bg-[var(--color-brand-primary)]/10 flex items-center justify-center shrink-0">
                      <CheckCircle className="size-5 text-[var(--color-brand-primary)]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                      <p className="text-muted-foreground text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28 bg-[var(--color-brand-primary)] text-[var(--color-text-inverted)]">
          <div className="container-wide text-center">
            <Users className="size-12 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Grow Your {location.city} Business?
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Let&apos;s discuss how we can help you achieve your digital goals. Schedule a free consultation today.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--color-text-inverted)] text-[var(--color-brand-primary)] rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Get Started Today
              <ArrowRight className="size-5" />
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
