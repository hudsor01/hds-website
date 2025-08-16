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
    title: 'TenantFlow - Property Management Platform',
    description: 'Complete property management solution with tenant portals, maintenance tracking, automated rent collection, and comprehensive analytics dashboard.',
    technologies: ['Next.js 15', 'React 19', 'TypeScript', 'Prisma', 'PostgreSQL', 'Stripe', 'Vercel'],
    results: ['500+ properties managed', '99.8% uptime', '85% reduction in admin overhead', '$1.2M+ rent processed'],
    category: 'PropTech',
    image: '/portfolio/tenantflow.jpg',
    liveUrl: 'https://tenantflow.app',
    caseStudyUrl: '#',
    featured: true,
    year: '2024',
    status: 'Live'
  },
  {
    id: 2,
    title: 'Ink37 Tattoos - Studio Management & Booking',
    description: 'Modern tattoo studio website with online booking, artist portfolios, aftercare guidance, and client management system.',
    technologies: ['Next.js 15', 'React 19', 'TypeScript', 'Supabase', 'Stripe', 'Vercel'],
    results: ['50+ weekly bookings', '300% increase in online inquiries', '98% client satisfaction', '4.9/5 rating'],
    category: 'Creative',
    image: '/portfolio/ink37tattoos.jpg',
    liveUrl: 'https://ink37tattoos.com',
    caseStudyUrl: '#',
    featured: true,
    year: '2024',
    status: 'Live'
  },
  {
    id: 3,
    title: 'E-Commerce Platform Enhancement',
    description: 'Custom e-commerce platform with advanced inventory management, real-time analytics, and performance optimization.',
    technologies: ['Next.js', 'TypeScript', 'PostgreSQL', 'Stripe', 'Redis'],
    results: ['340% increase in conversion rate', '$850K additional revenue', '99.2% uptime'],
    category: 'E-Commerce',
    image: '/portfolio/ecommerce-platform.jpg',
    liveUrl: '#',
    caseStudyUrl: '#',
    featured: false,
    year: '2023',
    status: 'Completed'
  },
  {
    id: 4,
    title: 'Healthcare Management System',
    description: 'HIPAA-compliant patient management system with appointment scheduling, billing integration, and telemedicine capabilities.',
    technologies: ['React', 'Node.js', 'MongoDB', 'Socket.io', 'Docker'],
    results: ['60% reduction in admin time', '1000+ patients managed', '99.5% data accuracy'],
    category: 'Healthcare',
    image: '/portfolio/healthcare-system.jpg',
    liveUrl: '#',
    caseStudyUrl: '#',
    featured: false,
    year: '2023',
    status: 'Completed'
  },
  {
    id: 5,
    title: 'Real Estate CRM Platform',
    description: 'Custom CRM solution for real estate agencies with lead tracking, automated follow-ups, and performance analytics.',
    technologies: ['Vue.js', 'Express.js', 'MySQL', 'Redis', 'Twilio'],
    results: ['45% more qualified leads', '200% faster response time', '$650K in closed deals'],
    category: 'CRM',
    image: '/portfolio/real-estate-crm.jpg',
    liveUrl: '#',
    caseStudyUrl: '#',
    featured: false,
    year: '2023',
    status: 'Completed'
  },
];

// const categories = ['All', 'E-Commerce', 'Healthcare', 'CRM', 'FinTech', 'Logistics', 'Education'];

export default function Portfolio() {
  return (
    <main className="min-h-screen bg-gradient-hero">
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
                <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                  <div className="text-xs uppercase tracking-wide text-secondary-400 font-bold">
                    {project.category}
                  </div>
                  <div className={`text-xs uppercase tracking-wide font-bold px-2 py-1 rounded ${
                    project.status === 'Live' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  }`}>
                    {project.status} • {project.year}
                  </div>
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
                  <div className="flex flex-col items-end gap-1">
                    {project.featured && (
                      <div className="px-2 py-1 bg-accent-400/20 border border-accent-400/30 rounded text-xs text-accent-400 font-bold">
                        FEATURED
                      </div>
                    )}
                    <div className={`text-xs uppercase tracking-wide font-bold px-2 py-1 rounded ${
                      project.status === 'Live' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}>
                      {project.status} • {project.year}
                    </div>
                  </div>
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
    </main>
  );
}