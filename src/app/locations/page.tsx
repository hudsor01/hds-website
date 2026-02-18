/**
 * Locations Index Page
 * Lists all 75 service area cities grouped by state
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { getLocationsByState } from '@/lib/locations';

export const metadata: Metadata = {
  title: 'Service Locations | Hudson Digital Solutions',
  description:
    'Hudson Digital Solutions serves businesses across the US. Find web development services in your city — Texas, Florida, Georgia, Colorado, and more.',
  openGraph: {
    title: 'Service Locations | Hudson Digital Solutions',
    description: 'Web development services across the US.',
  },
};

export default function LocationsPage() {
  const locationsByState = getLocationsByState();
  const states = Object.keys(locationsByState).sort();
  const totalCities = Object.values(locationsByState).reduce((sum, cities) => sum + cities.length, 0);

  return (
    <main className="min-h-screen bg-primary/10">
      {/* Hero Section */}
      <section className="px-4 py-section sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Serving Businesses Across the US
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {totalCities} cities across {states.length} states — find web development services near you.
          </p>
        </div>
      </section>

      {/* Locations Grid */}
      <section className="px-4 py-section-sm sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-12">
          {states.map((state) => (
            <div key={state}>
              <h2 className="mb-heading text-2xl font-semibold text-foreground border-b border-border pb-2">
                {state}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {(locationsByState[state] ?? []).map((location) => (
                  <Link
                    key={location.slug}
                    href={`/locations/${location.slug}`}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent/10 hover:text-primary"
                  >
                    <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    {location.city}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-section-sm sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-heading text-2xl font-semibold text-foreground">
            Don&apos;t see your city?
          </h2>
          <p className="mb-comfortable text-muted-foreground">
            We work with clients remotely across the entire US. Get in touch to discuss your project.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-semibold text-foreground shadow-xs transition-colors hover:bg-primary/80 focus:outline-hidden focus:ring-2 focus:ring-primary"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
}
