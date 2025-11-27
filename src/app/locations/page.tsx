/**
 * Locations Index Page
 * Lists all service areas in Texas
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, ArrowRight, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TEXAS_LOCATIONS } from '@/lib/locations';

export const metadata: Metadata = {
  title: 'Service Locations in Texas | Hudson Digital Solutions',
  description: 'Hudson Digital Solutions provides web development and digital services across Texas, including Dallas, Houston, Austin, San Antonio, and Fort Worth.',
  keywords: 'web development texas, software consulting dallas, houston web design, austin web development, san antonio digital solutions, fort worth web services',
};

export default function LocationsPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-[var(--color-brand-primary)] text-[var(--color-text-inverted)] py-16 md:py-24">
        <div className="container-wide text-center">
          <Badge variant="secondary" className="mb-4 bg-[var(--color-text-inverted)]/10 text-[var(--color-text-inverted)] border-0">
            <MapPin className="size-4 mr-1" />
            Serving Texas
          </Badge>

          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Our Texas Service Areas
          </h1>

          <p className="text-xl text-[var(--color-text-inverted)]/90 max-w-3xl mx-auto">
            Hudson Digital Solutions is a Texas-based digital agency serving businesses across the Lone Star State. From startups to enterprises, we deliver exceptional web solutions.
          </p>
        </div>
      </section>

      {/* Locations Grid */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container-wide">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEXAS_LOCATIONS.map((location) => (
              <Link key={location.slug} href={`/locations/${location.slug}`} className="group">
                <Card className="h-full hover:border-[var(--color-brand-primary)] hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="size-10 rounded-lg bg-[var(--color-brand-primary)]/10 flex items-center justify-center text-[var(--color-brand-primary)]">
                        <MapPin className="size-5" />
                      </div>
                      <ArrowRight className="size-5 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-[var(--color-brand-primary)] transition-colors">
                      {location.city}, {location.stateCode}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {location.tagline}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {location.neighborhoods.slice(0, 3).map((area) => (
                        <Badge key={area} variant="secondary" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                      {location.neighborhoods.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{location.neighborhoods.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Texas Section */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto text-center">
            <Building2 className="size-12 mx-auto text-[var(--color-brand-primary)] mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Texas Businesses Trust Us
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              As a Texas-based agency, we understand the local market, share your timezone, and are committed to helping Texas businesses succeed in the digital economy.
            </p>

            <div className="grid md:grid-cols-3 gap-6 text-left">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-2">Local Expertise</h3>
                  <p className="text-sm text-muted-foreground">
                    We understand the Texas business landscape and what local customers expect.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-2">Same Timezone</h3>
                  <p className="text-sm text-muted-foreground">
                    Real-time collaboration with no timezone hassles or delayed responses.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-2">Texas Values</h3>
                  <p className="text-sm text-muted-foreground">
                    Honest pricing, hard work, and a commitment to quality that Texas is known for.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container-wide text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Don&apos;t See Your City?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            We serve businesses throughout Texas and beyond. Contact us to discuss your project, regardless of your location.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-brand-primary)] text-[var(--color-text-inverted)] rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Contact Us
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
