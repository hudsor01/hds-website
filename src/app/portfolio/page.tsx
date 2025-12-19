import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { ExternalLink, Sparkles, Rocket } from 'lucide-react';
import { Analytics } from '@/components/Analytics';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/glass-card';
import { ProjectCard } from '@/components/project-card';
import { getProjects, parseProjectStats } from '@/lib/projects';

// Enable ISR with 1-hour revalidation for Supabase data
// React cache() handles request deduplication at data layer
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Portfolio - Our Work | Hudson Digital Solutions',
  description: 'Real projects delivering measurable results. From SaaS platforms to business websites, see how we transform ideas into success stories.',
  openGraph: {
    title: 'Portfolio - Our Work | Hudson Digital Solutions',
    description: 'Real projects delivering measurable results. From SaaS platforms to business websites, see how we transform ideas into success stories.',
    type: 'website',
  },
};

// Async component for dynamic project data
async function PortfolioProjects() {
  const projects = await getProjects();

  return (
    <>
      {/* Stats Section */}
      <section className="relative section-spacing page-padding-x">
        <div className="container-wide">
          <div className="grid-4 mb-content-block">
            {[
              { value: `${projects.length}+`, label: "Projects Delivered" },
              { value: "100%", label: "Client Satisfaction" },
              { value: "Proven", label: "ROI Results" },
              { value: "24/7", label: "Support Available" },
            ].map((stat, index) => (
              <GlassCard
                key={index}
                variant="default"
                padding="md"
                hover
                className="relative text-center"
              >
                <div className="text-page-title font-bold text-foreground mb-subheading">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Projects */}
      <section className="relative section-spacing page-padding-x">
        <div className="container-wide">
          <div className="text-center mb-content-block">
            <h2 className="text-clamp-xl font-black text-foreground mb-heading">
              <span className="text-accent">
                Featured Projects
              </span>
            </h2>
            <div className="typography">
              <p className="text-subheading text-muted-foreground container-narrow">
                Real projects delivering measurable results for clients across industries.
              </p>
            </div>
          </div>

          {/* Desktop Grid / Mobile Horizontal Scroll */}
          <div className="md:grid md:grid-cols-2 md:gap-sections mb-16 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide md:overflow-visible -mx-4 px-4 md:mx-0 md:px-0 space-x-4 md:space-x-0">
            {projects.map((project) => {
              const stats = parseProjectStats(project.stats);

              return (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  slug={project.slug}
                  title={project.title}
                  description={project.description}
                  category={project.category}
                  featured={project.featured}
                  stats={stats}
                  tech_stack={project.tech_stack}
                />
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

export default function PortfolioPage() {
  return (
    <>
      <Analytics />
      <main className="min-h-screen bg-background text-foreground">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-info rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        {/* Hero Section - Static */}
        <section className="relative min-h-screen flex-center overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-20 rounded-full blur-3xl" />
            <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-info/20 rounded-full blur-3xl" />
            <div className="absolute inset-0 grid-pattern" />
          </div>

          <div className="relative z-sticky container-wide text-center">
            <div className="space-y-comfortable">
              <div>
                <span className="inline-flex items-center gap-tight px-4 py-2 rounded-full border border-accent/60/30 bg-accent/10 text-accent font-semibold text-sm blur-backdrop">
                  <Sparkles className="w-4 h-4" />
                  Award-Winning Projects
                </span>
              </div>

              <div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-foreground leading-none tracking-tight text-balance">
                  <span className="inline-block mr-4">Our</span>
                  <span className="inline-block mr-4 text-accent">Portfolio</span>
                </h1>
              </div>

              <div className="typography">
                <p className="text-responsive-md text-muted-foreground container-wide leading-relaxed text-pretty">
                  Real projects delivering measurable results. From SaaS platforms to business websites, see how we transform ideas into success stories.
                </p>
              </div>

              <div>
                <div className="flex flex-col sm:flex-row flex-center gap-content mt-content-block">
                  <Button asChild variant="default" size="lg" trackConversion={true}>
                    <Link href="/contact">
                      Start Your Project
                      <Rocket className="w-5 h-5" />
                    </Link>
                  </Button>

                  <Button asChild variant="outline" size="lg">
                    <Link href="/services">
                      View Services
                      <ExternalLink className="w-5 h-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic content with Suspense */}
        <Suspense fallback={
          <div className="container-wide py-section text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-border border-t-cyan-500" />
            <p className="text-muted-foreground text-lg mt-4">Loading projects...</p>
          </div>
        }>
          <PortfolioProjects />
        </Suspense>

        {/* CTA Section */}
        <section className="relative section-spacing page-padding-x">
          <div className="container-wide">
            <GlassCard variant="section" padding="md" className="relative z-sticky text-center">
              <h2 className="text-clamp-xl font-black text-foreground mb-heading">
                Ready to create your
                <span className="text-accent">
                  {" "}success story?
                </span>
              </h2>

              <div className="typography">
                <p className="text-subheading text-muted container-narrow mb-content-block">
                  Join these industry leaders in transforming your digital presence into a competitive advantage. Let&apos;s build something amazing together.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row flex-center gap-content">
                <Button asChild variant="default" size="xl" trackConversion={true}>
                  <Link href="/contact">
                    Start Your Project
                    <Rocket className="w-5 h-5" />
                  </Link>
                </Button>

                <Button asChild variant="outline" size="xl">
                  <Link href="/services">
                    View Services
                    <ExternalLink className="w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </GlassCard>
          </div>
        </section>
      </main>
    </>
  );
}
