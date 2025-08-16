import { Metadata } from "next";
import { SEO_CONFIG } from "@/utils/seo";
import { RocketLaunchIcon, EyeIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { OptimizedImage } from "@/components/OptimizedImage";

// Next.js 15: SSR meta for SEO/TTFB
export const metadata: Metadata = {
  title: SEO_CONFIG.home.title,
  description: SEO_CONFIG.home.description,
  keywords: SEO_CONFIG.home.keywords,
  openGraph: {
    title: SEO_CONFIG.home.ogTitle ?? SEO_CONFIG.home.title,
    description: SEO_CONFIG.home.ogDescription ?? SEO_CONFIG.home.description,
    url: SEO_CONFIG.home.canonical,
    images: [
      {
        url: SEO_CONFIG.home.ogImage ?? "",
        alt: SEO_CONFIG.home.title,
      },
    ],
  },
  alternates: {
    canonical: SEO_CONFIG.home.canonical,
  },
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
    "max-video-preview": -1,
  },
  other: {
    // JSON-LD structured data for SSR
    "ld+json": JSON.stringify(SEO_CONFIG.home.structuredData),
  },
};

export default function HomePage() {
  return (
    <main>
      {/* Hero Section */}
      <section
        className="relative min-h-screen bg-gradient-hero flex items-center overflow-hidden"
        aria-label="Hero section"
      >
        {/* Power Grid Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.15)_0%,transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(34,211,238,0.05)_50%,transparent_51%)] bg-[length:80px_80px]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_49%,rgba(34,211,238,0.05)_50%,transparent_51%)] bg-[length:80px_80px]"></div>
        </div>
        {/* Dynamic Energy Elements */}
        <div className="absolute top-20 right-16 w-96 h-96 bg-gradient-secondary opacity-5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-accent opacity-5 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/3 left-1/3 w-32 h-32 bg-secondary-400/10 rounded-full blur-2xl animate-pulse animation-delay-500"></div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <div>
              <h1
                className="text-5xl lg:text-7xl font-black text-white mb-8 leading-tight"
                id="main-heading"
              >
                DIGITAL.
                <br />
                <span className="text-gradient-neon glow-cyan">MASTERMIND.</span>
                <br />
                <span className="text-secondary-400">UNLEASHED.</span>
              </h1>
              <p className="text-xl text-gray-300 mb-6 leading-relaxed max-w-2xl">
                Meet the <strong className="text-secondary-400 glow-cyan">digital architect</strong> who builds{" "}
                <strong className="text-white">production-ready platforms</strong> that compete with{" "}
                <strong className="text-accent-400">enterprise-grade solutions</strong>.
              </p>
              <div className="mb-10 p-4 bg-gradient-to-r from-secondary-400/10 to-accent-400/10 rounded-lg border border-secondary-400/20 max-w-2xl">
                <p className="text-white text-sm">
                  🚀 <strong>Live Portfolio:</strong> TenantFlow.app & Ink37Tattoos.com — 
                  fully operational businesses serving real customers with zero downtime.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 mb-8">
                <Link href="/contact" passHref>
                  <button
                    type="button"
                    className="flex items-center gap-2 bg-cyan-400 hover:bg-cyan-500 text-white font-bold py-4 px-8 rounded-lg text-lg shadow-lg transition-all duration-300 glow-cyan"
                  >
                    <RocketLaunchIcon className="w-6 h-6" />
                    Launch Project
                  </button>
                </Link>
                <Link href="/portfolio" passHref>
                  <button
                    type="button"
                    className="flex items-center gap-2 border-2 border-cyan-400 text-white font-bold py-4 px-8 rounded-lg text-lg bg-cyan-400/10 hover:bg-cyan-400/20 backdrop-blur-md transition-all duration-300"
                  >
                    <EyeIcon className="w-6 h-6" />
                    View Arsenal
                  </button>
                </Link>
              </div>
            </div>
            {/* Terminal Mockup Placeholder */}
            <aside
              className="relative"
              aria-labelledby="terminal-heading"
              aria-label="Deployment Terminal Example"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-gray-400 text-sm font-mono">
                  hudson-deploy.sh
                </div>
              </div>
              <div className="font-mono text-sm space-y-2" role="log">
                <div className="text-accent-400">$ npm run deploy --production</div>
                <div className="text-primary-200">✓ Build completed in 1.8s</div>
                <div className="text-primary-200">✓ Tests passed (147/147)</div>
                <div className="text-primary-200">✓ Security scan clean</div>
                <div className="text-secondary-400">→ Deploying to production...</div>
                <div className="text-accent-400">✓ Deployment successful</div>
                <div className="text-warning-400">🚀 Live at https://client-app.com</div>
                <div className="text-primary-400 mt-4">Performance: 100/100</div>
                <div className="text-primary-400">Accessibility: 100/100</div>
                <div className="text-primary-400">SEO: 98/100</div>
                <div className="text-accent-400 animate-pulse mt-4 glow-green">$█</div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="relative py-20 bg-black/90">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="w-2 h-2 bg-secondary-400 rounded-full animate-pulse"></span>
              <span className="text-gray-400 uppercase tracking-wider text-sm font-semibold">
                🏆 LEGENDARY CREATIONS
              </span>
              <span className="w-2 h-2 bg-secondary-400 rounded-full animate-pulse"></span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              DIGITAL <span className="text-secondary-400 glow-cyan">MASTERPIECES</span>
            </h2>
            
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Witness the <strong className="text-secondary-400 glow-cyan">architectural brilliance</strong> behind these 
              <strong className="text-accent-400"> revenue-generating digital empires</strong>. 
              Each platform represents months of strategic development, cutting-edge technology, 
              and <strong className="text-white">pure engineering excellence</strong> that transforms industries.
            </p>
            
            <div className="flex justify-center gap-8 mt-8 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-accent-400 rounded-full"></span>
                <span className="text-gray-400">Live Production Platforms</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-secondary-400 rounded-full"></span>
                <span className="text-gray-400">Latest Tech Stack</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-accent-400 rounded-full"></span>
                <span className="text-gray-400">Enterprise-Grade Architecture</span>
              </div>
            </div>
          </div>

          {/* Featured Projects Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* TenantFlow */}
            <div className="group relative bg-gradient-to-br from-black/80 to-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 hover:border-secondary-400/50 transition-all duration-500 hover:-translate-y-2 shadow-2xl">
              <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-10">
                <div className="text-xs uppercase tracking-wide text-secondary-400 font-bold">
                  🏢 PropTech Empire
                </div>
                <div className="text-xs uppercase tracking-wide font-bold px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 shadow-lg">
                  🟢 LIVE • CRUSHING IT
                </div>
              </div>
              
              {/* Website Screenshot */}
              <div className="mb-6 relative overflow-hidden rounded-lg border border-gray-700">
                <OptimizedImage
                  src="/portfolio/tenantflow.png" 
                  alt="TenantFlow.app - Property Management Platform Screenshot"
                  aspectRatio="landscape"
                  priority={true}
                  className="w-full h-48 hover:scale-105 transition-transform duration-500"
                  objectFit="cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-secondary-400 transition-colors">
                  TenantFlow.app
                </h3>
                <div className="bg-gradient-to-r from-secondary-400/10 to-transparent p-4 rounded-lg border-l-4 border-secondary-400 mb-4">
                  <p className="text-secondary-400 font-semibold text-sm">🎯 ARCHITECTURAL MASTERPIECE</p>
                  <p className="text-white text-sm">Built from scratch using Next.js 15, React 19, and enterprise-grade infrastructure</p>
                </div>
                <p className="text-gray-300 leading-relaxed mb-6">
                  A <strong className="text-white">complete property management platform</strong> featuring tenant portals, 
                  maintenance tracking, automated rent collection with Stripe integration, 
                  and comprehensive analytics — <strong className="text-secondary-400">competing with solutions that cost $100K+</strong>.
                </p>
              </div>

              <div className="mb-6">
                <h4 className="text-sm uppercase tracking-wide text-gray-400 font-bold mb-3">
                  Tech Stack
                </h4>
                <div className="flex flex-wrap gap-2">
                  {['Next.js 15', 'React 19', 'TypeScript', 'Prisma', 'PostgreSQL', 'Stripe'].map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-secondary-400/10 border border-secondary-400/30 rounded-full text-xs text-secondary-400 font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-sm uppercase tracking-wide text-gray-400 font-bold mb-3">
                  🚀 TECHNICAL ACHIEVEMENTS
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-accent-400/10 p-3 rounded-lg border border-accent-400/20">
                    <div className="text-accent-400 font-bold text-lg">LIVE</div>
                    <div className="text-gray-300 text-xs">Production Platform</div>
                  </div>
                  <div className="bg-secondary-400/10 p-3 rounded-lg border border-secondary-400/20">
                    <div className="text-secondary-400 font-bold text-lg">Next.js 15</div>
                    <div className="text-gray-300 text-xs">Latest Framework</div>
                  </div>
                  <div className="bg-green-400/10 p-3 rounded-lg border border-green-400/20">
                    <div className="text-green-400 font-bold text-lg">Stripe</div>
                    <div className="text-gray-300 text-xs">Payment Processing</div>
                  </div>
                  <div className="bg-yellow-400/10 p-3 rounded-lg border border-yellow-400/20">
                    <div className="text-yellow-400 font-bold text-lg">TypeScript</div>
                    <div className="text-gray-300 text-xs">Type Safety</div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gradient-to-r from-secondary-400/5 to-accent-400/5 rounded-lg border border-gray-700">
                  <p className="text-xs text-gray-400">
                    🏗️ <strong className="text-white">Engineering Excellence:</strong> Full-stack platform with PostgreSQL, Prisma ORM, 
                    and Vercel deployment — enterprise-grade architecture at indie scale
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Link
                  href="https://tenantflow.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-secondary-400 to-accent-400 text-black font-bold rounded-lg hover:scale-105 transition-all duration-300 text-sm shadow-lg"
                >
                  <span>🏆</span>
                  Experience the Empire
                </Link>
                <Link
                  href="/portfolio"
                  className="flex items-center gap-2 px-6 py-3 border-2 border-secondary-400 text-secondary-400 font-bold rounded-lg hover:bg-secondary-400 hover:text-black transition-all duration-300 text-sm"
                >
                  <span>🧠</span>
                  See the Genius
                </Link>
              </div>
            </div>

            {/* Ink37 Tattoos */}
            <div className="group relative bg-gradient-to-br from-black/80 to-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 hover:border-secondary-400/50 transition-all duration-500 hover:-translate-y-2 shadow-2xl">
              <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-10">
                <div className="text-xs uppercase tracking-wide text-secondary-400 font-bold">
                  🎨 Creative Powerhouse
                </div>
                <div className="text-xs uppercase tracking-wide font-bold px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 shadow-lg">
                  🟢 LIVE • DOMINATING
                </div>
              </div>
              
              {/* Website Screenshot */}
              <div className="mb-6 relative overflow-hidden rounded-lg border border-gray-700">
                <OptimizedImage
                  src="/portfolio/ink37tattoos.png" 
                  alt="Ink37Tattoos.com - Tattoo Studio Website Screenshot"
                  aspectRatio="landscape"
                  priority={true}
                  className="w-full h-48 hover:scale-105 transition-transform duration-500"
                  objectFit="cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-secondary-400 transition-colors">
                  Ink37Tattoos.com
                </h3>
                <div className="bg-gradient-to-r from-accent-400/10 to-transparent p-4 rounded-lg border-l-4 border-accent-400 mb-4">
                  <p className="text-accent-400 font-semibold text-sm">🎯 CREATIVE + TECHNICAL MASTERY</p>
                  <p className="text-white text-sm">Modern tattoo studio website with advanced booking system and artist portfolio showcase</p>
                </div>
                <p className="text-gray-300 leading-relaxed mb-6">
                  A <strong className="text-white">professional studio platform</strong> featuring online booking systems, 
                  dynamic artist portfolio galleries, client management, and Stripe payment integration — 
                  <strong className="text-accent-400">bringing traditional artistry into the digital age</strong>.
                </p>
              </div>

              <div className="mb-6">
                <h4 className="text-sm uppercase tracking-wide text-gray-400 font-bold mb-3">
                  Tech Stack
                </h4>
                <div className="flex flex-wrap gap-2">
                  {['Next.js 15', 'React 19', 'TypeScript', 'Supabase', 'Stripe'].map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-secondary-400/10 border border-secondary-400/30 rounded-full text-xs text-secondary-400 font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-sm uppercase tracking-wide text-gray-400 font-bold mb-3">
                  🎨 DESIGN + DEVELOPMENT FUSION
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-400/10 p-3 rounded-lg border border-purple-400/20">
                    <div className="text-purple-400 font-bold text-lg">LIVE</div>
                    <div className="text-gray-300 text-xs">Studio Website</div>
                  </div>
                  <div className="bg-pink-400/10 p-3 rounded-lg border border-pink-400/20">
                    <div className="text-pink-400 font-bold text-lg">React 19</div>
                    <div className="text-gray-300 text-xs">Modern Frontend</div>
                  </div>
                  <div className="bg-orange-400/10 p-3 rounded-lg border border-orange-400/20">
                    <div className="text-orange-400 font-bold text-lg">Supabase</div>
                    <div className="text-gray-300 text-xs">Backend Database</div>
                  </div>
                  <div className="bg-cyan-400/10 p-3 rounded-lg border border-cyan-400/20">
                    <div className="text-cyan-400 font-bold text-lg">Custom</div>
                    <div className="text-gray-300 text-xs">Booking System</div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gradient-to-r from-purple-400/5 to-pink-400/5 rounded-lg border border-gray-700">
                  <p className="text-xs text-gray-400">
                    🎯 <strong className="text-white">Creative Technology:</strong> Custom-built booking system with artist portfolios, 
                    client management, and payment processing — bridging art and technology
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Link
                  href="https://ink37tattoos.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-400 to-pink-400 text-black font-bold rounded-lg hover:scale-105 transition-all duration-300 text-sm shadow-lg"
                >
                  <span>🎨</span>
                  See the Artistry
                </Link>
                <Link
                  href="/portfolio"
                  className="flex items-center gap-2 px-6 py-3 border-2 border-accent-400 text-accent-400 font-bold rounded-lg hover:bg-accent-400 hover:text-black transition-all duration-300 text-sm"
                >
                  <span>🧠</span>
                  Study the Genius
                </Link>
              </div>
            </div>
          </div>

          {/* CTA to Portfolio */}
          <div className="text-center">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-secondary-400/10 to-accent-400/10 border border-secondary-400/30 text-white font-bold rounded-lg hover:bg-secondary-400/20 transition-all duration-300 transform hover:scale-105"
            >
              <span>🎯</span>
              View Complete Arsenal
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
