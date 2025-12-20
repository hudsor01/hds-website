/**
 * Case Studies Page
 * Displays portfolio of completed projects with video testimonials
 */

import { Button } from '@/components/ui/button';
import { Card } from "@/components/ui/card";
import { getCaseStudies } from '@/lib/case-studies';
import { ArrowRight, Clock, ExternalLink, Users } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Case Studies | Real Results From Real Projects',
  description: 'See how we\'ve helped businesses scale, increase conversions, and solve complex technical challenges. Real metrics, real testimonials.',
  keywords: 'case studies, portfolio, client success stories, development projects',
};

// Separate component for async data fetching
async function CaseStudiesContent() {
  const caseStudies = await getCaseStudies();

  return (
    <>
      {caseStudies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Case studies coming soon. Contact us to discuss your project!
              </p>
              <Button asChild variant="default" size="lg" trackConversion={true} className="mt-content-block">
      <Link href="/contact">
        Get Started
        <ArrowRight className="w-4 h-4" />
      </Link>
    </Button>
            </div>
          ) : (
            <div className="grid gap-sections">
              {caseStudies.map((study) => (
                <Card key={study.id} variant="glass" size="lg" >
                  <div className="grid md:grid-cols-2 gap-sections">
                    {/* Left Column - Project Details */}
                    <div>
                      <div className="flex items-center gap-3 mb-heading">
                        <span className="px-3 py-1 bg-primary-hover/30 border border-primary/30 rounded-full text-accent text-sm font-semibold">
                          {study.industry}
                        </span>
                        {study.featured && (
                          <span className="px-3 py-1 bg-warning-bg-dark/30 border border-warning/30 rounded-full text-warning-text text-sm font-semibold">
                            Featured
                          </span>
                        )}
                      </div>

                      <h2 className="text-3xl font-bold text-foreground mb-3">
                        {study.title}
                      </h2>

                      <p className="text-lg text-muted mb-content-block">
                        {study.description}
                      </p>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-content mb-content-block">
                        {study.metrics.map((metric, i) => (
                          <div key={i} className="bg-muted/50 rounded-lg">
                            <div className="text-2xl font-black text-accent mb-1">
                              {metric.value}
                            </div>
                            <div className="text-sm text-muted-foreground">{metric.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Project Info */}
                      <div className="flex gap-comfortable text-sm text-muted-foreground mb-content-block">
                        <div className="flex items-center gap-tight">
                          <Clock className="w-4 h-4" />
                          <span>{study.project_duration}</span>
                        </div>
                        <div className="flex items-center gap-tight">
                          <Users className="w-4 h-4" />
                          <span>{study.team_size} team members</span>
                        </div>
                      </div>

                      <Button asChild variant="outline" size="default" trackConversion={true}>
                        <Link href={`/case-studies/${study.slug}`}>
                          Read Full Case Study
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </div>

                    {/* Right Column - Testimonial */}
                    <div className="bg-muted/50 rounded-lg">
                      {study.testimonial_video_url ? (
                        <div className="mb-heading">
                          <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                            <iframe
                              src={study.testimonial_video_url.replace('watch?v=', 'embed/')}
                              title={`Video testimonial from ${study.testimonial_author}`}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="w-full h-full"
                            />
                          </div>
                        </div>
                      ) : null}

                      <blockquote className="text-lg text-muted italic mb-heading">
                        "{study.testimonial_text}"
                      </blockquote>

                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/80/20 flex items-center justify-center">
                          <span className="text-accent font-bold text-xl">
                            {study.testimonial_author.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">
                            {study.testimonial_author}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {study.testimonial_role}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {study.client_name}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
    </>
  );
}

export default function CaseStudiesPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero - Static, prerendered */}
      <section className="py-section px-4">
        <div className="container-wide text-center">
          <h1 className="text-4xl md:text-6xl font-black text-foreground mb-content-block">
            Real Results From <span className="text-accent">Real Projects</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-comfortable max-w-3xl mx-auto">
            See how we've helped businesses scale, increase conversions, and solve complex technical challenges.
          </p>

          <div className="flex justify-center gap-content">
            <Button asChild variant="default" size="lg" trackConversion={true}>
              <Link href="/contact">
                Start Your Project
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Case Studies Grid - Dynamic with Suspense */}
      <section className="py-section-sm px-4">
        <div className="container-wide">
          <Suspense fallback={
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-border border-t-cyan-500" />
              <p className="text-muted-foreground text-lg mt-4">Loading case studies...</p>
            </div>
          }>
            <CaseStudiesContent />
          </Suspense>
        </div>
      </section>

      {/* CTA - Static, prerendered */}
      <section className="py-section px-4">
        <div className="container-wide">
          <Card variant="glassSection" size="xl" className="text-center">
            <h2 className="text-4xl font-black text-foreground mb-content-block">
              Ready to Get Results Like These?
            </h2>
            <p className="text-xl text-muted mb-comfortable max-w-2xl mx-auto">
              Let's discuss your project and create a custom solution that drives real business results.
            </p>
            <Button asChild variant="default" size="lg" trackConversion={true}>
              <Link href="/contact">
                Start Your Project Today
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </Card>
        </div>
      </section>
    </main>
  );
}
