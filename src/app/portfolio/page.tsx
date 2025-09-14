'use client';

import Link from 'next/link';
import { Analytics } from '@/components/Analytics';
// Removed motion animations for simplified build
import { ArrowTopRightOnSquareIcon, SparklesIcon, CodeBracketIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

const projects = [
  {
    id: 1,
    title: "TenantFlow.app",
    category: "SaaS Platform",
    description: "Modern property management platform helping landlords streamline operations, tenant communications, and financial tracking with automated workflows.",
    image: "/portfolio/tenantflow.jpg",
    gradient: "from-blue-500 to-indigo-600",
    stats: {
      properties: "1K+",
      efficiency: "+300%",
      uptime: "99.9%"
    },
    tech: ["Next.js 14", "TypeScript", "Prisma", "PostgreSQL", "Stripe"],
    link: "https://tenantflow.app",
    featured: true
  },
  {
    id: 2,
    title: "Ink37 Tattoos",
    category: "Business Website",
    description: "Premium tattoo studio website featuring artist portfolios, online booking system, and customer gallery with modern design aesthetics.",
    image: "/portfolio/ink37.jpg",
    gradient: "from-purple-500 to-pink-600",
    stats: {
      bookings: "+180%",
      engagement: "4.8/5",
      conversion: "+120%"
    },
    tech: ["React", "Next.js", "Tailwind CSS", "Vercel", "CMS"],
    link: "https://ink37tattoos.com"
  },
  {
    id: 3,
    title: "Richard W Hudson Jr",
    category: "Personal Portfolio",
    description: "Professional portfolio showcasing leadership experience, technical expertise, and project management capabilities with clean, modern design.",
    image: "/portfolio/richard-portfolio.jpg",
    gradient: "from-green-500 to-emerald-600",
    stats: {
      projects: "50+",
      experience: "10+ years",
      satisfaction: "98%"
    },
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "Vercel Analytics"],
    link: "https://richardwhudsonjr.com"
  },
  {
    id: 4,
    title: "Hudson Digital Solutions",
    category: "Business Website",
    description: "Company website showcasing full-stack development, revenue operations, and partnership management services with conversion-optimized design.",
    image: "/portfolio/hudson-digital.jpg",
    gradient: "from-cyan-500 to-blue-600",
    stats: {
      leads: "+250%",
      performance: "98/100",
      conversion: "+180%"
    },
    tech: ["Next.js 15", "React 19", "TypeScript", "Tailwind CSS", "PostHog"],
    link: "https://hudsondigitalsolutions.com",
    featured: true
  }
];

export default function PortfolioPage() {

  return (
    <>
      <Analytics />
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 text-white">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob will-change-transform"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 will-change-transform"></div>
        </div>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(34,211,238,0.1)_50%,transparent_51%)] bg-size-[60px_60px]" />
            <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_49%,rgba(34,211,238,0.1)_50%,transparent_51%)] bg-size-[60px_60px]" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-8">
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 text-cyan-400 font-semibold text-sm backdrop-blur-sm">
                  <SparklesIcon className="w-4 h-4" />
                  Award-Winning Projects
                </span>
              </div>

              <div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-none tracking-tight text-balance">
                  <span className="inline-block mr-4">Our</span>
                  <span className="inline-block mr-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Portfolio</span>
                </h1>
              </div>

              <div className="typography">
                <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed text-pretty">
                  Real projects delivering measurable results. From SaaS platforms to business websites, see how we transform ideas into success stories.
                </p>
              </div>

              <div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
                  <Link href="/contact">
                    <button className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold text-lg rounded-lg overflow-hidden hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105 will-change-transform">
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <span className="relative z-10">Start Your Project</span>
                      <RocketLaunchIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>

                  <Link href="/services">
                    <button className="group inline-flex items-center gap-3 px-8 py-4 border-2 border-gray-700 text-white font-semibold text-lg rounded-lg hover:border-cyan-400 hover:text-cyan-400 transition-all duration-300">
                      View Services
                      <ArrowTopRightOnSquareIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              {[
                { value: "10+", label: "Projects Delivered" },
                { value: "100%", label: "Client Satisfaction" },
                { value: "250%", label: "Average ROI" },
                { value: "24/7", label: "Support Available" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 p-8 hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 text-center"
                >
                  <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Portfolio Projects */}
        <section className="relative py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
                <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Featured Projects
                </span>
              </h2>
              <div className="typography">
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  Real projects delivering measurable results for clients across industries.
                </p>
              </div>
            </div>

            {/* Desktop Grid / Mobile Horizontal Scroll */}
            <div className="md:grid md:grid-cols-2 md:gap-8 mb-16 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide md:overflow-visible -mx-4 px-4 md:mx-0 md:px-0 space-x-4 md:space-x-0">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`group relative snap-center flex-shrink-0 w-[85vw] md:w-auto ${project.featured ? 'md:col-span-2' : ''}`}
                >
                  <div className="relative h-full overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300">
                    {/* Project Header */}
                    <div className={`${project.featured ? 'h-80' : 'h-64'} bg-gradient-to-br ${project.gradient} relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/20" />
                      
                      {/* Grid pattern overlay */}
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(255,255,255,0.05)_50%,transparent_51%)] bg-size-[20px_20px]" />
                      <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_49%,rgba(255,255,255,0.05)_50%,transparent_51%)] bg-size-[20px_20px]" />
                      
                      <div className="relative z-10 p-8 h-full flex flex-col justify-center text-center text-white">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm mb-4 mx-auto">
                          <CodeBracketIcon className="w-4 h-4" />
                          {project.category}
                        </div>
                        <h3 className="text-3xl md:text-4xl font-black mb-3">{project.title}</h3>
                        {project.featured && (
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-300 text-sm font-medium mx-auto">
                            <SparklesIcon className="w-4 h-4" />
                            Featured Project
                          </span>
                        )}
                      </div>
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                        <Link 
                          href={project.link}
                          target="_blank"
                          className="group/btn inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold text-lg rounded-lg hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105 will-change-transform"
                        >
                          View Live Site
                          <ArrowTopRightOnSquareIcon className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>

                    {/* Project Details */}
                    <div className="p-8">
                      <div className="typography mb-8">
                        <p className="text-gray-300 leading-relaxed text-lg">
                          {project.description}
                        </p>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-6 mb-8">
                        {Object.entries(project.stats).map(([key, value]) => (
                          <div key={key} className="text-center">
                            <div className="text-2xl font-bold text-white mb-1">{value}</div>
                            <div className="text-sm text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                          </div>
                        ))}
                      </div>

                      {/* Tech Stack */}
                      <div className="flex flex-wrap gap-2">
                        {project.tech.map((tech) => (
                          <span 
                            key={tech}
                            className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300 hover:border-cyan-400/50 hover:text-cyan-400 transition-colors duration-300"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 text-center bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-12 md:p-16">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
                Ready to create your 
                <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  {" "}success story?
                </span>
              </h2>
              
              <div className="typography">
                <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
                  Join these industry leaders in transforming your digital presence into a competitive advantage. Let&apos;s build something amazing together.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/contact"
                  className="group relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-lg rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105 will-change-transform"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <span className="relative z-10">Start Your Project</span>
                  <RocketLaunchIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link
                  href="/services"
                  className="group inline-flex items-center gap-3 px-10 py-5 border-2 border-gray-600 text-white font-semibold text-lg rounded-xl hover:border-cyan-400 hover:text-cyan-400 transition-all duration-300"
                >
                  View Services
                  <ArrowTopRightOnSquareIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </>
  );
}