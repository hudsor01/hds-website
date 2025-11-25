/**
 * Case Studies Page
 * Displays portfolio of completed projects with video testimonials
 */

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { ArrowRight, Clock, Users, ExternalLink } from 'lucide-react';
import { getCaseStudies } from '@/lib/case-studies';

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
              <Button asChild variant="default" size="lg" trackConversion={true} className="mt-6">
      <Link href="/contact">
        Get Started
        <ArrowRight className="w-4 h-4" />
      </Link>
    </Button>
            </div>
          ) : (
            <div className="grid gap-8">
              {caseStudies.map((study) => (
                <div key={study.id} className="glass-card p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Left Column - Project Details */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-cyan-900/30 border border-cyan-500/30 rounded-full text-cyan-400 text-sm font-semibold">
                          {study.industry}
                        </span>
                        {study.featured && (
                          <span className="px-3 py-1 bg-yellow-900/30 border border-yellow-500/30 rounded-full text-yellow-400 text-sm font-semibold">
                            Featured
                          </span>
                        )}
                      </div>

                      <h2 className="text-3xl font-bold text-white mb-3">
                        {study.title}
                      </h2>

                      <p className="text-lg text-muted mb-6">
                        {study.description}
                      </p>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        {study.metrics.map((metric, i) => (
                          <div key={i} className="bg-muted/50 rounded-lg p-4">
                            <div className="text-2xl font-black gradient-text mb-1">
                              {metric.value}
                            </div>
                            <div className="text-sm text-muted-foreground">{metric.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Project Info */}
                      <div className="flex gap-6 text-sm text-muted-foreground mb-6">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{study.project_duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
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
                    <div className="bg-muted/50 rounded-lg p-6">
                      {study.testimonial_video_url ? (
                        <div className="mb-4">
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

                      <blockquote className="text-lg text-muted italic mb-4">
                        "{study.testimonial_text}"
                      </blockquote>

                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                          <span className="text-cyan-400 font-bold text-xl">
                            {study.testimonial_author.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-white">
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
                </div>
              ))}
            </div>
          )}
    </>
  );
}

export default function CaseStudiesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Hero - Static, prerendered */}
      <section className="py-20 px-4">
        <div className="container-wide text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
            Real Results From <span className="gradient-text">Real Projects</span>
          </h1>

          <p className="text-xl text-muted mb-8 max-w-3xl mx-auto">
            See how we've helped businesses scale, increase conversions, and solve complex technical challenges.
          </p>

          <div className="flex justify-center gap-4">
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
      <section className="py-16 px-4">
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
      <section className="py-20 px-4">
        <div className="container-wide text-center">
          <div className="glass-section p-12">
            <h2 className="text-4xl font-black text-white mb-6">
              Ready to Get Results Like These?
            </h2>
            <p className="text-xl text-muted mb-8 max-w-2xl mx-auto">
              Let's discuss your project and create a custom solution that drives real business results.
            </p>
            <Button asChild variant="default" size="lg" trackConversion={true}>
      <Link href="/contact">
        Start Your Project Today
        <ArrowRight className="w-4 h-4" />
      </Link>
    </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
