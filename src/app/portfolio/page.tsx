'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowTopRightOnSquareIcon, SparklesIcon, CodeBracketIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import { Analytics } from '@/components/Analytics';
import './portfolio.css';

// Define the project type to match the API response
interface PortfolioProject {
  id: number;
  title: string;
  category: string;
  description: string;
  image: string;
  gradient: string;
  stats: {
    [key: string]: string;
  };
  tech: string[];
  link: string;
  featured?: boolean;
}

// API service function to fetch portfolio projects
async function fetchPortfolioProjects(): Promise<PortfolioProject[]> {
  const response = await fetch('/api/portfolio/projects');
  if (!response.ok) {
    throw new Error('Failed to fetch portfolio projects');
  }
  return response.json();
}

export default function PortfolioPage() {
  const { 
    data: projects = [], 
    isLoading, 
    error 
  } = useQuery<PortfolioProject[]>({
    queryKey: ['portfolio-projects'],
    queryFn: fetchPortfolioProjects,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,  // 10 minutes
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mb-4"></div>
          <p className="text-gray-300">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-hero text-white flex-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Error Loading Projects</h2>
          <p className="text-gray-300 mb-4">{(error as Error).message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Analytics />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/10 blur-3xl rounded-full"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 blur-3xl rounded-full"></div>
        </div>

        <div className="relative z-10 container-wide">
          <div className="text-center space-y-6">
            <div>
              <span className="px-4 py-2 rounded-full border border-cyan-400/30 bg-cyan-400/5 text-cyan-400 text-sm font-medium inline-block">
                Award-Winning Projects
              </span>
            </div>

            <div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-none tracking-tight text-balance">
                <span className="inline-block">Our</span>
                <span className="inline-block mx-4 gradient-text">Portfolio</span>
                <span className="inline-block">Showcase</span>
              </h1>
            </div>

            <div className="typography">
              <p className="text-responsive-md text-muted-foreground container-wide leading-relaxed text-pretty">
                Real projects delivering measurable results. See how we transform business visions into successful digital realities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 px-4 border-y border-border">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "100%", label: "Client Satisfaction" },
              { value: "150+", label: "Projects Delivered" },
              { value: "250%", label: "Average ROI" },
              { value: "24hr", label: "Avg Response Time" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-responsive-lg font-black text-cyan-400">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Projects */}
      <section className="py-20 px-4">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-clamp-xl font-black text-white mb-6">
              <span className="gradient-text">
                Featured Projects
              </span>
            </h2>
            <p className="text-xl text-muted-foreground container-narrow">
              Each project represents a business challenge we transformed into a success story
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div
                key={project.id}
                className={`glass-card-light p-8 transition-all duration-300 ${
                  project.featured 
                    ? 'lg:col-span-2 border-cyan-400/30 ring-2 ring-cyan-400/20' 
                    : 'border-border'
                }`}
              >
                {/* Project Header */}
                <div className={`${project.gradient} p-6 rounded-lg mb-6 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10"></div>
                  
                  {/* Grid pattern overlay */}
                  <div className="absolute inset-0 grid-pattern-light" />
                  
                  <div className="relative z-10 text-center">
                    <div className="inline-flex-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-sm mb-3">
                      <CodeBracketIcon className="w-4 h-4" />
                      {project.category}
                    </div>
                    <h3 className="text-responsive-lg font-black text-white mb-2">{project.title}</h3>
                    {project.featured && (
                      <span className="inline-flex-center gap-2 px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-400 text-sm font-medium">
                        <SparklesIcon className="w-4 h-4" />
                        Featured Project
                      </span>
                    )}
                  </div>
                </div>

                {/* Project Description */}
                <div className="typography mb-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {Object.entries(project.stats).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-lg font-bold text-white">{value}</div>
                      <div className="text-xs text-gray-400 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tech.map((tech) => (
                    <span 
                      key={tech}
                      className="px-3 py-1 glass-card-extra-small rounded-full text-xs text-gray-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex justify-between items-center">
                  <Link
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    View Project
                    <ArrowTopRightOnSquareIcon className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </Link>
                  
                  <Link
                    href={`/contact?project=${encodeURIComponent(project.title)}`}
                    className="px-4 py-2 glass-card-small text-sm font-medium hover:bg-white/10 transition-colors"
                  >
                    Discuss a Project
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container-wide">
          <div className="glass-section p-12 md:p-16 text-center">
            <h2 className="text-clamp-xl font-black text-white mb-6">
              Ready to start your
              <span className="block gradient-text mt-2">
                next success story?
              </span>
            </h2>
            
            <div className="typography">
              <p className="text-xl text-gray-300 container-narrow mb-10">
                Let's discuss how we can transform your business challenges into digital success stories.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="group inline-flex-center px-8 py-4 text-base font-bold text-black bg-gradient-secondary-hover rounded-lg"
              >
                Start Your Project
                <RocketLaunchIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="/services"
                className="inline-flex-center px-8 py-4 text-base font-semibold text-white border-2 border-gray-700 rounded-lg hover:border-cyan-400/50 hover:bg-gray-900/50 transition-all duration-200"
              >
                View Services
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}