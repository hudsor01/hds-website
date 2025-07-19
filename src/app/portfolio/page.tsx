import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowTopRightOnSquareIcon, CodeBracketIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Portfolio | Hudson Digital Solutions',
  description: 'Explore our portfolio of custom web applications, e-commerce platforms, and digital transformation projects that drive business results.',
  keywords: 'portfolio, web development projects, custom software, case studies, client success stories',
  openGraph: {
    title: 'Portfolio | Hudson Digital Solutions',
    description: 'Explore our portfolio of custom web applications, e-commerce platforms, and digital transformation projects that drive business results.',
    url: 'https://hudsondigitalsolutions.com/portfolio',
    siteName: 'Hudson Digital Solutions',
    type: 'website',
  },
};

const projects = [
  {
    id: 1,
    title: 'E-Commerce Platform Overhaul',
    description: 'Complete redesign and development of a high-traffic e-commerce platform with custom inventory management and real-time analytics.',
    technologies: ['Next.js', 'TypeScript', 'PostgreSQL', 'Stripe', 'AWS'],
    results: ['340% increase in conversion rate', '$2.1M additional revenue', '98.9% uptime'],
    category: 'E-Commerce',
    image: '/portfolio/ecommerce-platform.jpg',
    liveUrl: '#',
    caseStudyUrl: '#',
    featured: true,
  },
  {
    id: 2,
    title: 'Healthcare Management System',
    description: 'HIPAA-compliant patient management system with appointment scheduling, billing integration, and telemedicine capabilities.',
    technologies: ['React', 'Node.js', 'MongoDB', 'Socket.io', 'Docker'],
    results: ['60% reduction in admin time', '1000+ patients managed', '99.5% data accuracy'],
    category: 'Healthcare',
    image: '/portfolio/healthcare-system.jpg',
    liveUrl: '#',
    caseStudyUrl: '#',
    featured: true,
  },
  {
    id: 3,
    title: 'Real Estate CRM Platform',
    description: 'Custom CRM solution for real estate agencies with lead tracking, automated follow-ups, and performance analytics.',
    technologies: ['Vue.js', 'Express.js', 'MySQL', 'Redis', 'Twilio'],
    results: ['45% more qualified leads', '200% faster response time', '$850K in closed deals'],
    category: 'CRM',
    image: '/portfolio/real-estate-crm.jpg',
    liveUrl: '#',
    caseStudyUrl: '#',
    featured: false,
  },
  {
    id: 4,
    title: 'Financial Dashboard Analytics',
    description: 'Real-time financial dashboard with predictive analytics, automated reporting, and risk assessment tools.',
    technologies: ['React', 'Python', 'TensorFlow', 'PostgreSQL', 'D3.js'],
    results: ['90% faster financial reporting', '25% risk reduction', '$500K cost savings'],
    category: 'FinTech',
    image: '/portfolio/financial-dashboard.jpg',
    liveUrl: '#',
    caseStudyUrl: '#',
    featured: false,
  },
  {
    id: 5,
    title: 'Supply Chain Optimization',
    description: 'AI-powered supply chain management system with inventory forecasting and automated procurement workflows.',
    technologies: ['Angular', 'Spring Boot', 'Apache Kafka', 'Elasticsearch', 'ML Models'],
    results: ['30% inventory reduction', '15% cost optimization', '99.8% order accuracy'],
    category: 'Logistics',
    image: '/portfolio/supply-chain.jpg',
    liveUrl: '#',
    caseStudyUrl: '#',
    featured: false,
  },
  {
    id: 6,
    title: 'Educational Platform',
    description: 'Comprehensive learning management system with video streaming, progress tracking, and collaborative tools.',
    technologies: ['Next.js', 'Prisma', 'PostgreSQL', 'AWS S3', 'WebRTC'],
    results: ['10,000+ active users', '95% completion rate', '4.8/5 user satisfaction'],
    category: 'Education',
    image: '/portfolio/educational-platform.jpg',
    liveUrl: '#',
    caseStudyUrl: '#',
    featured: false,
  },
];

// const categories = ['All', 'E-Commerce', 'Healthcare', 'CRM', 'FinTech', 'Logistics', 'Education'];

export default function Portfolio() {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-secondary opacity-5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-gradient-accent opacity-5 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/6 w-32 h-32 bg-secondary-400/10 rounded-full blur-2xl animate-pulse animation-delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-2 h-2 bg-secondary-400 rounded-full animate-pulse"></span>
            <span className="text-gray-400 uppercase tracking-wider text-sm font-semibold">
              OUR ARSENAL
            </span>
            <span className="w-2 h-2 bg-secondary-400 rounded-full animate-pulse"></span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6">
            PORTFOLIO
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Explore our collection of <strong className="text-secondary-400 glow-cyan">game-changing digital solutions</strong> that have transformed businesses and driven 
            <strong className="text-accent-400 glow-green"> $3.7M+ in measurable revenue impact</strong> for our clients.
          </p>
        </div>

        {/* Featured Projects */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Featured <span className="text-secondary-400">Success Stories</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {projects.filter(project => project.featured).map((project) => (
              <div
                key={project.id}
                className="group relative bg-black/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 hover:border-secondary-400/50 transition-all duration-500 hover:-translate-y-2"
              >
                <div className="absolute top-4 right-4 text-xs uppercase tracking-wide text-secondary-400 font-bold">
                  {project.category}
                </div>
                
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-secondary-400 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed mb-6">
                    {project.description}
                  </p>
                </div>

                {/* Technologies */}
                <div className="mb-6">
                  <h4 className="text-sm uppercase tracking-wide text-gray-400 font-bold mb-3">
                    Tech Stack
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-secondary-400/10 border border-secondary-400/30 rounded-full text-xs text-secondary-400 font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Results */}
                <div className="mb-8">
                  <h4 className="text-sm uppercase tracking-wide text-gray-400 font-bold mb-3">
                    Key Results
                  </h4>
                  <ul className="space-y-2">
                    {project.results.map((result, index) => (
                      <li key={index} className="flex items-center gap-3 text-sm text-gray-300">
                        <div className="w-1 h-1 bg-accent-400 rounded-full"></div>
                        {result}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <Link
                    href={project.liveUrl}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary-400 text-black font-semibold rounded-lg hover:bg-secondary-400/90 transition-colors text-sm"
                  >
                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                    View Live
                  </Link>
                  <Link
                    href={project.caseStudyUrl}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-600 text-gray-300 font-semibold rounded-lg hover:border-secondary-400 hover:text-secondary-400 transition-colors text-sm"
                  >
                    <CodeBracketIcon className="w-4 h-4" />
                    Case Study
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Projects Grid */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Complete <span className="text-secondary-400">Project Archive</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group bg-black/60 backdrop-blur-lg border border-gray-800 rounded-xl p-6 hover:border-secondary-400/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-xs uppercase tracking-wide text-secondary-400 font-bold">
                    {project.category}
                  </div>
                  {project.featured && (
                    <div className="px-2 py-1 bg-accent-400/20 border border-accent-400/30 rounded text-xs text-accent-400 font-bold">
                      FEATURED
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-secondary-400 transition-colors">
                  {project.title}
                </h3>
                
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  {project.description}
                </p>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs uppercase tracking-wide text-gray-400 font-bold mb-2">
                      Key Result
                    </h4>
                    <div className="text-sm text-accent-400 font-semibold">
                      {project.results[0]}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Link
                      href={project.liveUrl}
                      className="flex-1 text-center py-2 bg-secondary-400/10 border border-secondary-400/30 text-secondary-400 font-semibold rounded-lg hover:bg-secondary-400/20 transition-colors text-sm"
                    >
                      View Project
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20 p-12 bg-black/80 backdrop-blur-xl border border-gray-800 rounded-2xl">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Build Your Success Story?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join our portfolio of successful clients. Let&apos;s create a custom solution that drives 
            <strong className="text-secondary-400"> measurable business results</strong> for your company.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 px-8 py-4 bg-secondary-400 text-black font-bold rounded-lg hover:bg-secondary-400/90 transition-all duration-300 transform hover:scale-105"
          >
            Start Your Project
            <ArrowTopRightOnSquareIcon className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}