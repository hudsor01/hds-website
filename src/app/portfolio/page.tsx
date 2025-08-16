import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { 
  ArrowTopRightOnSquareIcon, 
  RocketLaunchIcon,
  ChartBarIcon,
  SparklesIcon,
  TrophyIcon 
} from '@heroicons/react/24/outline';

// Lazy load the heavy showcase component
const PortfolioShowcase = dynamic(
  () => import('@/components/portfolio/PortfolioShowcase'),
  { 
    loading: () => (
      <div className="animate-pulse">
        <div className="h-96 bg-gray-800/50 rounded-xl"></div>
      </div>
    )
  }
);

export const metadata: Metadata = {
  title: 'Portfolio | Hudson Digital Solutions - Proven Results',
  description: 'Explore our portfolio of successful web applications and digital transformations. See real results: 300% traffic increases, $1.2M+ processed, 85% efficiency gains.',
  keywords: 'portfolio, web development projects, case studies, TenantFlow, Ink37 Tattoos, property management software, booking systems, React developer portfolio',
  openGraph: {
    title: 'Portfolio - Real Projects, Real Results | Hudson Digital',
    description: 'See how we\'ve helped businesses achieve 300% growth with custom web solutions. View live projects and detailed case studies.',
    url: 'https://hudsondigitalsolutions.com/portfolio',
    siteName: 'Hudson Digital Solutions',
    type: 'website',
    images: [
      {
        url: 'https://hudsondigitalsolutions.com/portfolio/tenantflow-hero-desktop.png',
        width: 1920,
        height: 1080,
        alt: 'TenantFlow Property Management Platform'
      }
    ]
  },
};

// Stats to showcase at the top
const impactStats = [
  { label: 'Revenue Generated', value: '$3.7M+', icon: <ChartBarIcon className="w-6 h-6" /> },
  { label: 'Efficiency Gains', value: '85%', icon: <RocketLaunchIcon className="w-6 h-6" /> },
  { label: 'Client Satisfaction', value: '4.9/5', icon: <TrophyIcon className="w-6 h-6" /> },
  { label: 'Projects Delivered', value: '50+', icon: <SparklesIcon className="w-6 h-6" /> },
];

export default function Portfolio() {
  return (
    <main className="min-h-screen bg-gradient-primary">
      {/* Enhanced Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/6 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl animate-pulse animation-delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
            <span className="text-gray-400 uppercase tracking-wider text-sm font-semibold">
              PROVEN RESULTS
            </span>
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Success Stories</span>
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12">
            Real projects. Real results. See how we've transformed businesses with 
            <strong className="text-cyan-400"> cutting-edge web solutions</strong> that deliver 
            <strong className="text-green-400"> measurable ROI</strong>.
          </p>

          {/* Impact Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16">
            {impactStats.map((stat, index) => (
              <div
                key={index}
                className="p-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl hover:border-cyan-500/50 transition-all duration-300"
              >
                <div className="text-cyan-400 mb-2 flex justify-center">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Portfolio Showcase */}
        <PortfolioShowcase />

        {/* Why Choose Us Section */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl hover:border-cyan-500/50 transition-all duration-300">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-bold text-white mb-2">Performance First</h3>
            <p className="text-gray-400">
              Every project is optimized for speed. Average load time under 1 second, 
              with 95+ Lighthouse scores across the board.
            </p>
          </div>
          
          <div className="p-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl hover:border-cyan-500/50 transition-all duration-300">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-xl font-bold text-white mb-2">Proven ROI</h3>
            <p className="text-gray-400">
              Our clients see average returns of 300% within the first year. 
              We focus on metrics that matter to your business.
            </p>
          </div>
          
          <div className="p-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl hover:border-cyan-500/50 transition-all duration-300">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-xl font-bold text-white mb-2">Built to Scale</h3>
            <p className="text-gray-400">
              Enterprise-grade architecture that grows with your business. 
              From startup to scale-up, we've got you covered.
            </p>
          </div>
        </div>

        {/* Client Logos Section */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold text-white mb-8">
            Trusted by Industry Leaders
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
            <div className="text-gray-400 font-bold text-xl">TenantFlow</div>
            <div className="text-gray-400 font-bold text-xl">Ink37 Tattoos</div>
            <div className="text-gray-400 font-bold text-xl">Premier Properties</div>
            <div className="text-gray-400 font-bold text-xl">Digital Ventures</div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20 p-12 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-xl border border-cyan-500/30 rounded-2xl">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Be Our Next Success Story?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto text-lg">
            Join the ranks of businesses that have transformed their digital presence. 
            Let's build something extraordinary together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105"
            >
              Start Your Project
              <ArrowTopRightOnSquareIcon className="w-5 h-5" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-gray-600 text-gray-300 font-bold rounded-lg hover:border-cyan-500 hover:text-cyan-400 transition-all duration-300"
            >
              View Our Services
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}