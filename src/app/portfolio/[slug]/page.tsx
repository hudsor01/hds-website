import { notFound } from 'next/navigation';
import { Card } from "@/components/ui/card";
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ExternalLink, ArrowLeft, Code2, Calendar, Eye } from 'lucide-react';
import { Analytics } from '@/components/Analytics';
import { Button } from '@/components/ui/button';
import {
  getProjectBySlug,
  getAllProjectSlugs,
  parseProjectStats,
  getProjects,
} from '@/lib/projects';

// Enable ISR with 1-hour revalidation for Supabase data
// React cache() handles request deduplication at data layer
export const revalidate = 3600;

// Generate static params for all projects
export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs();
  const results = slugs.map((slug) => ({ slug }));

  // Next.js 16: cacheComponents requires at least one static param
  if (results.length === 0) {
    return [{ slug: '__placeholder__' }];
  }

  return results;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return {
      title: 'Project Not Found',
      description: 'The requested project could not be found.',
    };
  }

  const title = project.meta_title || `${project.title} - Case Study | Hudson Digital`;
  const description =
    project.meta_description || project.description || 'View this project case study.';
  const ogImage = project.og_image_url || project.image_url || '/og-image.jpg';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [ogImage],
      type: 'article',
      publishedTime: project.published_at || project.created_at,
      modifiedTime: project.updated_at,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: `/portfolio/${project.slug}`,
    },
  };
}

// Async component that fetches project data
async function ProjectContent({ slug }: { slug: string }) {
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const stats = parseProjectStats(project.stats);
  const allProjects = await getProjects();
  const relatedProjects = allProjects
    .filter(
      (p) =>
        p.id !== project.id &&
        (p.category === project.category || p.tech_stack.some((t) => project.tech_stack.includes(t)))
    )
    .slice(0, 3);

  // Schema markup for rich results
  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description,
    image: project.image_url,
    author: {
      '@type': 'Organization',
      name: 'Hudson Digital Solutions',
      url: 'https://hudsondigitalsolutions.com',
    },
    datePublished: project.published_at || project.created_at,
    dateModified: project.updated_at,
    url: `https://hudsondigitalsolutions.com/portfolio/${project.slug}`,
  };

  return (
    <>
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

        {/* Hero Section */}
        <section className="relative py-12">
          <div className="container-wide sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Project Info */}
              <div className="space-y-comfortable">
                <Card variant="glass" className="inline-flex items-center gap-tight px-3 py-1 rounded-full -light text-sm">
                  <Code2 className="w-4 h-4" />
                  {project.category}
                </Card>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-foreground leading-tight">
                  {project.title}
                </h1>

                <p className="text-xl text-muted leading-relaxed">{project.description}</p>

                {project.long_description && (
                  <div className="typography">
                    <p className="text-muted-foreground leading-relaxed">{project.long_description}</p>
                  </div>
                )}

                {/* Meta Info */}
                <div className="flex flex-wrap gap-comfortable text-sm text-muted-foreground">
                  {project.published_at && (
                    <div className="flex items-center gap-tight">
                      <Calendar className="w-4 h-4" />
                      {new Date(project.published_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                      })}
                    </div>
                  )}
                  {project.view_count > 0 && (
                    <div className="flex items-center gap-tight">
                      <Eye className="w-4 h-4" />
                      {project.view_count.toLocaleString()} views
                    </div>
                  )}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-content">
                  {project.external_link && (
                    <Button asChild variant="default" size="lg">
                      <Link
                        href={project.external_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Live Site
                        <ExternalLink className="w-5 h-5" />
                      </Link>
                    </Button>
                  )}
                  {project.github_link && (
                    <Button asChild variant="outline" size="lg">
                      <Link
                        href={project.github_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Code
                        <Code2 className="w-5 h-5" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>

              {/* Project Image */}
              <div className={`relative overflow-hidden rounded-2xl ${project.gradient_class} p-1`}>
                <div className="relative h-96 lg:h-[500px] overflow-hidden bg-background/20">
                  <Image
                    src={project.image_url}
                    alt={project.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        {Object.keys(stats).length > 0 && (
          <section className="relative py-12">
            <div className="container-wide sm:px-6 lg:px-8">
              <Card variant="glassSection" size="lg" >
                <h2 className="text-2xl font-bold text-foreground mb-comfortable">Project Impact</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-sections">
                  {Object.entries(stats).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-3xl md:text-4xl font-bold text-foreground mb-subheading">
                        {value}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* Tech Stack */}
        <section className="relative py-12">
          <div className="container-wide sm:px-6 lg:px-8">
            <Card variant="glassSection" size="lg" >
              <h2 className="text-2xl font-bold text-foreground mb-content-block">Technologies Used</h2>
              <div className="flex flex-wrap gap-3">
                {project.tech_stack.map((tech) => (
                  <span
                    key={tech}
                    className="px-4 py-2 glass-card-light rounded-full text-sm text-muted hover:border-accent/50 hover:text-accent transition-colors"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </Card>
          </div>
        </section>

        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <section className="relative py-12">
            <div className="container-wide sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-foreground mb-comfortable">Related Projects</h2>
              <div className="grid md:grid-cols-3 gap-sections">
                {relatedProjects.map((relatedProject) => (
                  <Link
                    key={relatedProject.id}
                    href={`/portfolio/${relatedProject.slug}`}
                    className="group glass-card card-hover-glow transition-all duration-300"
                  >
                    <div
                      className={`${relatedProject.gradient_class} h-48 relative overflow-hidden`}
                    >
                      <Image
                        src={relatedProject.image_url}
                        alt={relatedProject.title}
                        fill
                        className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <div >
                      <div className="text-sm text-accent mb-subheading">{relatedProject.category}</div>
                      <h3 className="text-xl font-bold text-foreground mb-subheading group-hover:text-accent transition-colors">
                        {relatedProject.title}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {relatedProject.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="relative py-section px-4">
          <div className="container-wide">
            <Card variant="glassSection" className="p-12 md:p-16 text-center">
              <h2 className="text-4xl font-black text-foreground mb-content-block">
                Ready to create your
                <span className="text-accent"> success story?</span>
              </h2>
              <p className="text-xl text-muted mb-10 max-w-2xl mx-auto">
                Let&apos;s build something amazing together. Get in touch to discuss your project.
              </p>
              <Button asChild variant="default" size="lg" trackConversion={true}>
                <Link href="/contact">
                  Start Your Project
                  <ExternalLink className="w-5 h-5" />
                </Link>
              </Button>
            </Card>
          </div>
        </section>
    </>
  );
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Analytics />

      {/* Back Button - Static, prerendered */}
      <div className="container-wide sm:px-6 lg:px-8 pt-24 pb-8">
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-tight text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Portfolio
        </Link>
      </div>

      {/* Dynamic content with Suspense */}
      <Suspense fallback={
        <div className="container-wide sm:px-6 lg:px-8 py-section text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-border border-t-cyan-500" />
          <p className="text-muted-foreground text-lg mt-4">Loading project...</p>
        </div>
      }>
        <ProjectContent slug={slug} />
      </Suspense>
    </main>
  );
}
