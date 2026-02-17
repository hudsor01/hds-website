/**
 * Showcase Detail Page
 * Renders differently based on showcaseType:
 * - 'quick': Portfolio-style view (image, stats, tech stack)
 * - 'detailed': Case-study-style view (challenge/solution/results narrative)
 */

import { Button } from '@/components/ui/button';
import { Card } from "@/components/ui/card";
import { getAllShowcaseSlugs, getShowcaseBySlug, isDetailedShowcase } from '@/lib/showcase';
import { ArrowLeft, ArrowRight, Clock, ExternalLink, Users } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

// Generate static params for all showcase items
export async function generateStaticParams() {
  const slugs = await getAllShowcaseSlugs();
  const results = slugs.map((slug) => ({ slug }));

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
  const item = await getShowcaseBySlug(slug);

  if (!item) {
    return {
      title: 'Project Not Found',
    };
  }

  const typeLabel = isDetailedShowcase(item) ? 'Case Study' : 'Project';

  return {
    title: `${item.title} | ${typeLabel}`,
    description: item.description,
    keywords: `${typeLabel.toLowerCase()}, ${item.industry ?? ''}, ${item.projectType ?? ''}, ${item.technologies?.join(', ') || ''}`,
  };
}

// Async component for showcase content
async function ShowcaseContent({ slug }: { slug: string }) {
  const item = await getShowcaseBySlug(slug);

  if (!item) {
    notFound();
  }

  const isDetailed = isDetailedShowcase(item);
  const metrics = Object.entries(item.metrics).map(([label, value]) => ({ label, value }));

  return (
    <>
      {/* Hero */}
      <section className="py-12 px-4">
        <div className="container-wide">
          <div className="mb-content-block">
            <span className="px-3 py-1 bg-primary/30 border border-primary/30 rounded-full text-accent text-sm font-semibold">
              {item.industry ?? item.category} {item.projectType && `\u2022 ${item.projectType}`}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-foreground mb-content-block">
            {item.title}
          </h1>

          <p className="text-2xl text-muted-foreground mb-comfortable max-w-4xl">
            {item.description}
          </p>

          {(item.projectDuration || item.teamSize) && (
            <div className="flex gap-comfortable text-muted-foreground">
              {item.projectDuration && (
                <div className="flex items-center gap-tight">
                  <Clock className="w-5 h-5" />
                  <span>{item.projectDuration}</span>
                </div>
              )}
              {item.teamSize && (
                <div className="flex items-center gap-tight">
                  <Users className="w-5 h-5" />
                  <span>{item.teamSize} team members</span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Metrics Showcase */}
      {metrics.length > 0 && (
        <section className="py-12 px-4 bg-muted/30">
          <div className="container-wide">
            <div className="grid md:grid-cols-4 gap-comfortable">
              {metrics.map((metric, i) => (
                <Card key={i} variant="glass" className="text-center">
                  <div className="text-5xl font-black text-accent mb-subheading">
                    {metric.value}
                  </div>
                  <div className="text-muted-foreground">{metric.label}</div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content - Type-aware rendering */}
      <section className="py-section-sm px-4">
        <div className="container-wide max-w-5xl">
          <div className="grid gap-12">
            {isDetailed ? (
              /* Detailed Case Study View */
              <>
                {item.challenge && (
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-content-block">The Challenge</h2>
                    <Card variant="glass" size="lg">
                      <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                        {item.challenge}
                      </p>
                    </Card>
                  </div>
                )}

                {item.solution && (
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-content-block">Our Solution</h2>
                    <Card variant="glass" size="lg">
                      <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                        {item.solution}
                      </p>

                      {item.technologies && item.technologies.length > 0 && (
                        <div className="mt-content-block">
                          <h3 className="text-xl font-semibold text-foreground mb-heading">Technologies Used</h3>
                          <div className="flex flex-wrap gap-tight">
                            {item.technologies.map((tech, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 bg-muted/50 border border-border rounded-full text-muted-foreground text-sm"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  </div>
                )}

                {item.results && (
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-content-block">The Results</h2>
                    <Card variant="glass" size="lg">
                      <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                        {item.results}
                      </p>

                      {item.externalLink && (
                        <div className="mt-content-block">
                          <a
                            href={item.externalLink}
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
                )}
              </>
            ) : (
              /* Quick Portfolio View */
              <>
                {item.longDescription && (
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-content-block">About This Project</h2>
                    <Card variant="glass" size="lg">
                      <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                        {item.longDescription}
                      </p>
                    </Card>
                  </div>
                )}

                {item.technologies && item.technologies.length > 0 && (
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-content-block">Tech Stack</h2>
                    <Card variant="glass" size="lg">
                      <div className="flex flex-wrap gap-tight">
                        {item.technologies.map((tech, i) => (
                          <span
                            key={i}
                            className="px-4 py-2 bg-muted/50 border border-border rounded-full text-muted-foreground"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}

                {item.externalLink && (
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-content-block">Links</h2>
                    <Card variant="glass" size="lg">
                      <div className="flex flex-wrap gap-content">
                        <a
                          href={item.externalLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-tight text-accent hover:text-accent/80 transition-colors"
                        >
                          View Live Project
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        {item.githubLink && (
                          <a
                            href={item.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-tight text-accent hover:text-accent/80 transition-colors"
                          >
                            View Source Code
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </Card>
                  </div>
                )}
              </>
            )}

            {/* Testimonial - shown for both types if available */}
            {item.testimonialText && (
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-content-block">Client Testimonial</h2>
                <Card variant="glass" size="lg">
                  {item.testimonialVideoUrl && (
                    <div className="mb-content-block">
                      <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                        <iframe
                          src={item.testimonialVideoUrl.replace('watch?v=', 'embed/')}
                          title={`Video testimonial from ${item.testimonialAuthor}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      </div>
                    </div>
                  )}

                  <blockquote className="text-2xl text-muted-foreground italic mb-content-block">
                    &ldquo;{item.testimonialText}&rdquo;
                  </blockquote>

                  {item.testimonialAuthor && (
                    <div className="flex items-center gap-content">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-accent font-bold text-2xl">
                          {item.testimonialAuthor.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-foreground text-lg">
                          {item.testimonialAuthor}
                        </div>
                        {item.testimonialRole && (
                          <div className="text-muted-foreground">
                            {item.testimonialRole}
                          </div>
                        )}
                        {item.clientName && (
                          <div className="text-muted-foreground">
                            {item.clientName}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            )}
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
            <p className="text-xl text-muted-foreground mb-comfortable max-w-2xl mx-auto">
              Let&apos;s discuss how we can help you achieve similar results for your business.
            </p>
            <Button asChild variant="accent" size="lg" trackConversion={true}>
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

export default async function ShowcaseDetailPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;

  return (
    <main className="min-h-screen bg-background">
      {/* Back Button */}
      <section className="py-8 px-4">
        <div className="container-wide">
          <Link href="/showcase" className="inline-flex items-center gap-tight text-accent hover:text-accent/80 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Showcase
          </Link>
        </div>
      </section>

      {/* Dynamic content with Suspense */}
      <Suspense fallback={
        <div className="container-wide py-section text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-border border-t-cyan-500" />
          <p className="text-muted-foreground text-lg mt-4">Loading project...</p>
        </div>
      }>
        <ShowcaseContent slug={slug} />
      </Suspense>
    </main>
  );
}
