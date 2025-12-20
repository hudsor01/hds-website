/**
 * Individual Case Study Page
 * Detailed view of a single case study with full story
 */

import { Button } from '@/components/ui/button';
import { Card } from "@/components/ui/card";
import { getAllCaseStudySlugs, getCaseStudyBySlug } from '@/lib/case-studies';
import { ArrowLeft, ArrowRight, Clock, ExternalLink, Users } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

// Generate static params for all case studies
export async function generateStaticParams() {
  const slugs = await getAllCaseStudySlugs();
  const results = slugs.map((slug) => ({ slug }));

  // Next.js 16: cacheComponents requires at least one static param
  if (results.length === 0) {
    return [{ slug: '__placeholder__' }];
  }

  return results;
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = await getCaseStudyBySlug(slug);

  if (!caseStudy) {
    return {
      title: 'Case Study Not Found',
    };
  }

  return {
    title: `${caseStudy.title} | Case Study`,
    description: caseStudy.description,
    keywords: `case study, ${caseStudy.industry}, ${caseStudy.project_type}, ${caseStudy.technologies?.join(', ') || ''}`,
  };
}

// Async component for case study content
async function CaseStudyContent({ slug }: { slug: string }) {
  const caseStudy = await getCaseStudyBySlug(slug);

  if (!caseStudy) {
    notFound();
  }

  return (
    <>

      {/* Hero */}
      <section className="py-12 px-4">
        <div className="container-wide">
          <div className="mb-content-block">
            <span className="px-3 py-1 bg-primary-hover/30 border border-primary/30 rounded-full text-accent text-sm font-semibold">
              {caseStudy.industry} • {caseStudy.project_type}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-foreground mb-content-block">
            {caseStudy.title}
          </h1>

          <p className="text-2xl text-muted mb-comfortable max-w-4xl">
            {caseStudy.description}
          </p>

          <div className="flex gap-comfortable text-muted-foreground">
            <div className="flex items-center gap-tight">
              <Clock className="w-5 h-5" />
              <span>{caseStudy.project_duration}</span>
            </div>
            <div className="flex items-center gap-tight">
              <Users className="w-5 h-5" />
              <span>{caseStudy.team_size} team members</span>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Showcase */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container-wide">
          <div className="grid md:grid-cols-4 gap-comfortable">
            {caseStudy.metrics.map((metric, i) => (
              <Card key={i} variant="glass" className="text-center">
                <div className="text-5xl font-black text-accent mb-subheading">
                  {metric.value}
                </div>
                <div className="text-muted">{metric.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-section-sm px-4">
        <div className="container-wide max-w-5xl">
          <div className="grid gap-12">
            {/* Challenge */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-content-block">The Challenge</h2>
              <Card variant="glass" size="lg" >
                <p className="text-lg text-muted leading-relaxed whitespace-pre-line">
                  {caseStudy.challenge}
                </p>
              </Card>
            </div>

            {/* Solution */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-content-block">Our Solution</h2>
              <Card variant="glass" size="lg" >
                <p className="text-lg text-muted leading-relaxed whitespace-pre-line">
                  {caseStudy.solution}
                </p>

                {/* Technologies Used */}
                {caseStudy.technologies && caseStudy.technologies.length > 0 && (
                  <div className="mt-content-block">
                    <h3 className="text-xl font-semibold text-foreground mb-heading">Technologies Used</h3>
                    <div className="flex flex-wrap gap-tight">
                      {caseStudy.technologies.map((tech, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-muted/50 border border-border rounded-full text-muted text-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Results */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-content-block">The Results</h2>
              <Card variant="glass" size="lg" >
                <p className="text-lg text-muted leading-relaxed whitespace-pre-line">
                  {caseStudy.results}
                </p>

                {caseStudy.project_url && (
                  <div className="mt-content-block">
                    <a
                      href={caseStudy.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-tight text-accent hover:text-accent/80 transition-colors"
                    >
                      View Live Project
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </Card>
            </div>

            {/* Testimonial */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-content-block">Client Testimonial</h2>
              <Card variant="glass" size="lg" >
                {caseStudy.testimonial_video_url && (
                  <div className="mb-content-block">
                    <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                      <iframe
                        src={caseStudy.testimonial_video_url.replace('watch?v=', 'embed/')}
                        title={`Video testimonial from ${caseStudy.testimonial_author}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                )}

                <blockquote className="text-2xl text-muted italic mb-content-block">
                  "{caseStudy.testimonial_text}"
                </blockquote>

                <div className="flex items-center gap-content">
                  <div className="w-16 h-16 rounded-full bg-primary/80/20 flex items-center justify-center">
                    <span className="text-accent font-bold text-2xl">
                      {caseStudy.testimonial_author.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-foreground text-lg">
                      {caseStudy.testimonial_author}
                    </div>
                    <div className="text-muted-foreground">
                      {caseStudy.testimonial_role}
                    </div>
                    <div className="text-muted-foreground">
                      {caseStudy.client_name}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-section px-4">
        <div className="container-wide">
          <Card variant="glassSection" size="xl" className="text-center">
            <h2 className="text-4xl font-black text-foreground mb-content-block">
              Want Results Like This?
            </h2>
            <p className="text-xl text-muted mb-comfortable max-w-2xl mx-auto">
              Let's discuss how we can help you achieve similar results for your business.
            </p>
            <Button asChild variant="default" size="lg" trackConversion={true}>
              <Link href="/contact">
                Start Your Project
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </Card>
        </div>
      </section>
    </>
  );
}

export default async function CaseStudyPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;

  return (
    <main className="min-h-screen bg-background">
      {/* Back Button - Static */}
      <section className="py-8 px-4">
        <div className="container-wide">
          <Link href="/case-studies" className="inline-flex items-center gap-tight text-accent hover:text-accent/80 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Case Studies
          </Link>
        </div>
      </section>

      {/* Dynamic content with Suspense */}
      <Suspense fallback={
        <div className="container-wide py-section text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-border border-t-cyan-500" />
          <p className="text-muted-foreground text-lg mt-4">Loading case study...</p>
        </div>
      }>
        <CaseStudyContent slug={slug} />
      </Suspense>
    </main>
  );
}
