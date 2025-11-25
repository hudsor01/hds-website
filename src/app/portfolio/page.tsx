import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { ExternalLink, Sparkles, Code2, Rocket } from 'lucide-react';
import { Analytics } from '@/components/Analytics';
import { getProjects, parseProjectStats } from '@/lib/projects';

// Enable ISR with 1-hour revalidation
// Next.js 16: Using cacheLife instead
// export const revalidate = 3600;

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
                <div className="text-page-title font-bold text-white mb-subheading">{stat.value}</div>
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
            <h2 className="text-clamp-xl font-black text-white mb-heading">
              <span className="gradient-text">
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
          <div className="md:grid md:grid-cols-2 md:gap-8 mb-16 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide md:overflow-visible -mx-4 px-4 md:mx-0 md:px-0 space-x-4 md:space-x-0">
            {projects.map((project) => {
              const stats = parseProjectStats(project.stats);

              return (
                <div
                  key={project.id}
                  className={`group relative snap-center flex-shrink-0 w-[85vw] md:w-auto ${project.featured ? 'md:col-span-2' : ''}`}
                >
                  <Link href={`/portfolio/${project.slug}`}>
                    <div className="relative h-full overflow-hidden glass-card card-hover-glow transition-all duration-300">
                      {/* Project Header */}
                      <div className={`${project.featured ? 'h-80' : 'h-64'} ${project.gradient_class} relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-black/20" />

                        {/* Grid pattern overlay */}
                        <div className="absolute inset-0 grid-pattern-light" />

                        <div className="relative z-10 p-8 h-full flex flex-col justify-center text-center text-white">
                          <div className="inline-flex flex-center gap-2 px-3 py-1 rounded-full glass-card-light text-sm mb-4 mx-auto">
                            <Code2 className="w-4 h-4" />
                            {project.category}
                          </div>
                          <h3 className="text-responsive-lg font-black mb-3">{project.title}</h3>
                          {project.featured && (
                            <span className="inline-flex flex-center gap-2 px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-300 text-sm font-medium mx-auto">
                              <Sparkles className="w-4 h-4" />
                              Featured Project
                            </span>
                          )}
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-center z-20">
                          <div className="button-base group cta-primary px-8 py-4 text-lg font-bold transform hover:scale-105 will-change-transform transform-gpu">
                            View Project
                            <ExternalLink className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>

                      {/* Project Details */}
                      <div className="p-8">
                        <div className="typography mb-8">
                          <p className="text-muted leading-relaxed text-lg">
                            {project.description}
                          </p>
                        </div>

                        {/* Stats Grid */}
                        {Object.keys(stats).length > 0 && (
                          <div className="grid grid-cols-3 gap-6 mb-8">
                            {Object.entries(stats).map(([key, value]) => (
                              <div key={key} className="text-center">
                                <div className="text-2xl font-bold text-white mb-1">{value}</div>
                                <div className="text-sm text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Tech Stack */}
                        <div className="flex flex-wrap gap-2">
                          {project.tech_stack.map((tech) => (
                            <span
                              key={tech}
                              className="px-3 py-1 glass-card-light rounded-full text-sm text-muted hover:border-cyan-400/50 hover:text-cyan-400 transition-colors duration-300"
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
      <main className="min-h-screen bg-gradient-hero text-white">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        {/* Hero Section - Static */}
        <section className="relative min-h-screen flex-center overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-primary-20 rounded-full blur-3xl" />
            <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-gradient-decorative-purple rounded-full blur-3xl" />
            <div className="absolute inset-0 grid-pattern" />
          </div>

          <div className="relative z-10 container-wide text-center">
            <div className="space-y-comfortable">
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 text-cyan-400 font-semibold text-sm blur-backdrop">
                  <Sparkles className="w-4 h-4" />
                  Award-Winning Projects
                </span>
              </div>

              <div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-none tracking-tight text-balance">
                  <span className="inline-block mr-4">Our</span>
                  <span className="inline-block mr-4 gradient-text">Portfolio</span>
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
                      <span className="relative z-10">Start Your Project</span>
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
          <div className="container-wide py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-border border-t-cyan-500" />
            <p className="text-muted-foreground text-lg mt-4">Loading projects...</p>
          </div>
        }>
          <PortfolioProjects />
        </Suspense>

        {/* CTA Section */}
        <section className="relative section-spacing page-padding-x">
          <div className="container-wide">
            <div className="relative z-10 text-center glass-section card-padding">
              <h2 className="text-clamp-xl font-black text-white mb-heading">
                Ready to create your
                <span className="gradient-text">
                  {" "}success story?
                </span>
              </h2>

              <div className="typography">
                <p className="text-subheading text-muted container-narrow mb-content-block">
                  Join these industry leaders in transforming your digital presence into a competitive advantage. Let&apos;s build something amazing together.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row flex-center gap-4">
                <Link
                  href="/contact"
                  className="button-base group cta-primary px-10 py-5 text-body-lg font-bold rounded-xl overflow-hidden transform hover:scale-105 will-change-transform transform-gpu"
                >
                  <span className="absolute inset-0 shine-effect -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <span className="relative z-10">Start Your Project</span>
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
