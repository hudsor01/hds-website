import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { ExternalLink, Sparkles, Code2, Rocket } from 'lucide-react';
import { Analytics } from '@/components/Analytics';
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
              { value: "250%", label: "Average ROI" },
              { value: "24/7", label: "Support Available" },
            ].map((stat, index) => (
              <div
                key={index}
                className="relative glass-card card-padding card-hover-glow transition-smooth text-center"
              >
                <div className="text-page-title font-bold text-foreground mb-subheading">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
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
                <div
                  key={project.id}
                  className={`group relative snap-center shrink-0 w-[85vw] md:w-auto ${project.featured ? 'md:col-span-2' : ''}`}
                >
                  <Link href={`/portfolio/${project.slug}`}>
                    <div className="relative h-full overflow-hidden glass-card card-hover-glow transition-all duration-300">
                      {/* Project Header */}
                      <div className={`${project.featured ? 'h-80' : 'h-64'} ${project.gradient_class} relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-background/20" />

                        {/* Grid pattern overlay */}
                        <div className="absolute inset-0 grid-pattern-light" />

                        <div className="relative z-sticky card-padding-lg h-full flex flex-col justify-center text-center text-foreground">
                          <div className="inline-flex flex-center gap-tight px-3 py-1 rounded-full glass-card-light text-sm mb-heading mx-auto">
                            <Code2 className="w-4 h-4" />
                            {project.category}
                          </div>
                          <h3 className="text-responsive-lg font-black mb-3">{project.title}</h3>
                          {project.featured && (
                            <span className="inline-flex flex-center gap-tight px-3 py-1 rounded-full bg-warning-text/20 text-warning-muted text-sm font-medium mx-auto">
                              <Sparkles className="w-4 h-4" />
                              Featured Project
                            </span>
                          )}
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-center z-fixed">
                          <div className="button-base group cta-primary px-8 py-4 text-lg font-bold transform hover:scale-105 will-change-transform transform-gpu">
                            View Project
                            <ExternalLink className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>

                      {/* Project Details */}
                      <div className="card-padding-lg">
                        <div className="typography mb-comfortable">
                          <p className="text-muted-foreground leading-relaxed text-lg">
                            {project.description}
                          </p>
                        </div>

                        {/* Stats Grid */}
                        {Object.keys(stats).length > 0 && (
                          <div className="grid grid-cols-3 gap-comfortable mb-comfortable">
                            {Object.entries(stats).map(([key, value]) => (
                              <div key={key} className="text-center">
                                <div className="text-2xl font-bold text-foreground mb-1">{value}</div>
                                <div className="text-sm text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Tech Stack */}
                        <div className="flex flex-wrap gap-tight">
                          {project.tech_stack.map((tech) => (
                            <span
                              key={tech}
                              className="px-3 py-1 glass-card-light rounded-full text-sm text-muted-foreground hover:border-accent/50 hover:text-accent transition-colors duration-300"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
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
                  <Link href="/contact">
                    <button className="button-base group cta-primary px-8 py-4 text-lg font-bold overflow-hidden transform hover:scale-105 will-change-transform transform-gpu focus-ring">
                      <span className="absolute inset-0 shine-effect -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <span className="relative z-sticky">Start Your Project</span>
                      <Rocket className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>

                  <Link href="/services">
                    <button className="button-base group cta-secondary button-hover-glow px-8 py-4 text-lg font-semibold focus-ring">
                      View Services
                      <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
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
            <div className="relative z-sticky text-center glass-section card-padding">
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
                <Link
                  href="/contact"
                  className="button-base group cta-primary px-10 py-5 text-body-lg font-bold rounded-xl overflow-hidden transform hover:scale-105 will-change-transform transform-gpu"
                >
                  <span className="absolute inset-0 shine-effect -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <span className="relative z-sticky">Start Your Project</span>
                  <Rocket className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/services"
                  className="button-base group cta-secondary button-hover-glow px-10 py-5 text-body-lg font-semibold rounded-xl"
                >
                  View Services
                  <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
