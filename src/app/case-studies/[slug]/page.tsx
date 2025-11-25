/**
 * Individual Case Study Page
 * Detailed view of a single case study with full story
 */

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CTAButton } from '@/components/cta-button';
import { ArrowLeft, ExternalLink, Clock, Users } from 'lucide-react';
import { getCaseStudyBySlug, getAllCaseStudySlugs } from '@/lib/case-studies';

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
          <div className="mb-6">
            <span className="px-3 py-1 bg-cyan-900/30 border border-cyan-500/30 rounded-full text-cyan-400 text-sm font-semibold">
              {caseStudy.industry} • {caseStudy.project_type}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
            {caseStudy.title}
          </h1>

          <p className="text-2xl text-gray-300 mb-8 max-w-4xl">
            {caseStudy.description}
          </p>

          <div className="flex gap-6 text-gray-400">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{caseStudy.project_duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>{caseStudy.team_size} team members</span>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Showcase */}
      <section className="py-12 px-4 bg-gray-800/30">
        <div className="container-wide">
          <div className="grid md:grid-cols-4 gap-6">
            {caseStudy.metrics.map((metric, i) => (
              <div key={i} className="glass-card p-6 text-center">
                <div className="text-5xl font-black gradient-text mb-2">
                  {metric.value}
                </div>
                <div className="text-gray-300">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4">
        <div className="container-wide max-w-5xl">
          <div className="grid gap-12">
            {/* Challenge */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">The Challenge</h2>
              <div className="glass-card p-8">
                <p className="text-lg text-gray-300 leading-relaxed whitespace-pre-line">
                  {caseStudy.challenge}
                </p>
              </div>
            </div>

            {/* Solution */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Our Solution</h2>
              <div className="glass-card p-8">
                <p className="text-lg text-gray-300 leading-relaxed whitespace-pre-line">
                  {caseStudy.solution}
                </p>

                {/* Technologies Used */}
                {caseStudy.technologies && caseStudy.technologies.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Technologies Used</h3>
                    <div className="flex flex-wrap gap-2">
                      {caseStudy.technologies.map((tech, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-gray-700/50 border border-gray-600 rounded-full text-gray-300 text-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Results */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">The Results</h2>
              <div className="glass-card p-8">
                <p className="text-lg text-gray-300 leading-relaxed whitespace-pre-line">
                  {caseStudy.results}
                </p>

                {caseStudy.project_url && (
                  <div className="mt-6">
                    <a
                      href={caseStudy.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      View Live Project
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Testimonial */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Client Testimonial</h2>
              <div className="glass-card p-8">
                {caseStudy.testimonial_video_url && (
                  <div className="mb-6">
                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-700">
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

                <blockquote className="text-2xl text-gray-300 italic mb-6">
                  "{caseStudy.testimonial_text}"
                </blockquote>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <span className="text-cyan-400 font-bold text-2xl">
                      {caseStudy.testimonial_author.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-white text-lg">
                      {caseStudy.testimonial_author}
                    </div>
                    <div className="text-gray-400">
                      {caseStudy.testimonial_role}
                    </div>
                    <div className="text-gray-500">
                      {caseStudy.client_name}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container-wide text-center">
          <div className="glass-section p-12">
            <h2 className="text-4xl font-black text-white mb-6">
              Want Results Like This?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Let's discuss how we can help you achieve similar results for your business.
            </p>
            <CTAButton href="/contact" variant="primary" size="lg">
              Start Your Project
            </CTAButton>
          </div>
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
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Back Button - Static */}
      <section className="py-8 px-4">
        <div className="container-wide">
          <Link href="/case-studies" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Case Studies
          </Link>
        </div>
      </section>

      {/* Dynamic content with Suspense */}
      <Suspense fallback={
        <div className="container-wide py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-cyan-500" />
          <p className="text-gray-400 text-lg mt-4">Loading case study...</p>
        </div>
      }>
        <CaseStudyContent slug={slug} />
      </Suspense>
    </main>
  );
}
