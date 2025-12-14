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
      <section className="bg-(--primary) text-(--primary-foreground) py-section-sm md:py-section">
        <div className="container-wide text-center">
          <Badge variant="secondary" className="mb-heading bg-(--primary-foreground)/10 text-(--primary-foreground) border-0">
            <MapPin className="size-4 mr-1" />
            Serving Texas
          </Badge>

          <h1 className="text-4xl md:text-5xl font-bold mb-content-block">
            Our Texas Service Areas
          </h1>

          <p className="text-xl text-(--primary-foreground)/90 max-w-3xl mx-auto">
            Hudson Digital Solutions is a Texas-based digital agency serving businesses across the Lone Star State. From startups to enterprises, we deliver exceptional web solutions.
          </p>
        </div>
      </section>

      {/* Locations Grid */}
      <section className="py-section-sm md:py-section bg-background">
        <div className="container-wide">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-comfortable">
            {TEXAS_LOCATIONS.map((location) => (
              <Link key={location.slug} href={`/locations/${location.slug}`} className="group">
                <Card className="h-full hover:border-(--primary) hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-subheading">
                      <div className="size-10 rounded-lg bg-(--primary)/10 flex items-center justify-center text-(--primary)">
                        <MapPin className="size-5" />
                      </div>
                      <ArrowRight className="size-5 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-(--primary) transition-colors">
                      {location.city}, {location.stateCode}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-heading line-clamp-2">
                      {location.tagline}
                    </p>
                    <div className="flex flex-wrap gap-tight">
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
      <section className="py-section-sm md:py-section bg-muted/30">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto text-center">
            <Building2 className="size-12 mx-auto text-(--primary) mb-content-block" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-heading">
              Why Texas Businesses Trust Us
            </h2>
            <p className="text-lg text-muted-foreground mb-comfortable">
              As a Texas-based agency, we understand the local market, share your timezone, and are committed to helping Texas businesses succeed in the digital economy.
            </p>

            <div className="grid md:grid-cols-3 gap-comfortable text-left">
              <Card>
                <CardContent className="card-padding">
                  <h3 className="font-semibold text-foreground mb-subheading">Local Expertise</h3>
                  <p className="text-sm text-muted-foreground">
                    We understand the Texas business landscape and what local customers expect.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="card-padding">
                  <h3 className="font-semibold text-foreground mb-subheading">Same Timezone</h3>
                  <p className="text-sm text-muted-foreground">
                    Real-time collaboration with no timezone hassles or delayed responses.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="card-padding">
                  <h3 className="font-semibold text-foreground mb-subheading">Texas Values</h3>
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
      <section className="py-section-sm md:py-section bg-background">
        <div className="container-wide text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-heading">
            Don&apos;t See Your City?
          </h2>
          <p className="text-lg text-muted-foreground mb-comfortable max-w-2xl mx-auto">
            We serve businesses throughout Texas and beyond. Contact us to discuss your project, regardless of your location.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-tight px-6 py-3 bg-(--primary) text-(--primary-foreground) rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Contact Us
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
