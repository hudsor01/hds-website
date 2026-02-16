/**
 * Location Page
 * Dynamic SEO pages for Texas service areas with LocalBusiness structured data
 */

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { MapPin, ArrowRight, CheckCircle } from 'lucide-react';
import { JsonLd } from '@/components/utilities/JsonLd';
import {
  getAllLocationSlugs,
  getLocationBySlug,
  generateLocalBusinessSchema,
} from '@/lib/locations';

interface LocationPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllLocationSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const location = getLocationBySlug(slug);

  if (!location) {
    return {
      title: 'Location Not Found - Hudson Digital Solutions',
      description: 'The requested location page could not be found.',
    };
  }

  return {
    title: `Web Development in ${location.city}, ${location.stateCode} | Hudson Digital Solutions`,
    description: location.metaDescription,
    openGraph: {
      title: `Web Development in ${location.city}, ${location.stateCode}`,
      description: location.metaDescription,
    },
    alternates: {
      canonical: `https://hudsondigitalsolutions.com/locations/${location.slug}`,
    },
  };
}

export default async function LocationPage({ params }: LocationPageProps) {
  const { slug } = await params;
  const location = getLocationBySlug(slug);

  if (!location) {
    notFound();
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://hudsondigitalsolutions.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Locations',
        item: 'https://hudsondigitalsolutions.com/locations',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${location.city}, ${location.stateCode}`,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-background">
      <JsonLd data={generateLocalBusinessSchema(location)} />
      <JsonLd data={breadcrumbSchema} />

      {/* Hero */}
      <section className="relative bg-primary/10 py-section overflow-hidden">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-heading text-primary">
            <MapPin className="h-6 w-6" />
            <span className="text-sm font-semibold uppercase tracking-wide">
              {location.city}, {location.stateCode}
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-heading">
            {location.tagline}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {location.description}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-section-sm border-b border-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-comfortable sm:grid-cols-3 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">{location.stats.businesses}</div>
              <div className="text-sm text-muted-foreground">Local Businesses Served</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">{location.stats.projects}</div>
              <div className="text-sm text-muted-foreground">Projects Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">{location.stats.satisfaction}</div>
              <div className="text-sm text-muted-foreground">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-section-sm">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground text-center mb-comfortable">
            Our Services in {location.city}
          </h2>
          <div className="grid gap-comfortable sm:grid-cols-3">
            {location.features.map((feature) => (
              <Card key={feature.title}>
                <h3 className="text-lg font-semibold text-foreground mb-subheading">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Areas Served */}
      <section className="py-section-sm bg-muted/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground text-center mb-comfortable">
            Areas We Serve in {location.city}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {location.neighborhoods.map((area) => (
              <div key={area} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                {area}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-section-sm">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Card size="lg" className="bg-primary/10 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-heading">
              Ready to Grow Your {location.city} Business?
            </h2>
            <p className="text-lg text-muted-foreground mb-comfortable max-w-2xl mx-auto">
              Schedule a free consultation to discuss how we can help your business thrive online.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-base font-semibold text-foreground shadow-xs hover:bg-primary-hover"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        </div>
      </section>
    </main>
  );
}
