import { Metadata } from "next";
import { SEO_CONFIG } from "@/utils/seo";
import { 
  RocketLaunchIcon, 
  EyeIcon, 
  CodeBracketIcon,
  ChartBarIcon,
  LightBulbIcon,
  CogIcon,
  ShieldCheckIcon,
  BoltIcon
} from "@heroicons/react/24/solid";

// Next.js 15: SSR meta for SEO/TTFB
export const metadata: Metadata = {
  title: SEO_CONFIG.about.title,
  description: SEO_CONFIG.about.description,
  keywords: SEO_CONFIG.about.keywords,
  openGraph: {
    title: SEO_CONFIG.about.ogTitle ?? SEO_CONFIG.about.title,
    description: SEO_CONFIG.about.ogDescription ?? SEO_CONFIG.about.description,
    url: SEO_CONFIG.about.canonical,
    images: [
      {
        url: SEO_CONFIG.about.ogImage ?? "",
        alt: SEO_CONFIG.about.title,
      },
    ],
  },
  alternates: {
    canonical: SEO_CONFIG.about.canonical,
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
    "ld+json": JSON.stringify(SEO_CONFIG.about.structuredData),
  },
};

export default function AboutPage() {
  return (
    <main>
      {/* Header - Dark Tech */}
      <section className="relative bg-gradient-hero py-24 overflow-hidden">
        {/* Tech Grid Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.15)_0%,transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(34,211,238,0.05)_50%,transparent_51%)] bg-[length:80px_80px]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_49%,rgba(34,211,238,0.05)_50%,transparent_51%)] bg-[length:80px_80px]"></div>
        </div>
        {/* Dynamic Energy Elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-secondary opacity-5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-accent opacity-5 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="relative max-w-4xl mx-auto text-center px-6 sm:px-8 lg:px-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-cyan-300 bg-cyan-400/10 text-cyan-400 font-semibold text-lg">
            <span className="w-2 h-2 bg-secondary-400 rounded-full animate-pulse"></span>
            Our Story
          </span>
          <h1 className="text-5xl font-black text-white mb-6">
            Forged in <span className="text-gradient-neon glow-cyan">Excellence</span>
          </h1>
          <p className="text-xl text-gray-300">
            Crafting digital solutions with the precision of master engineers.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="relative py-24 bg-gradient-primary overflow-hidden">
        {/* Subtle tech pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(34,211,238,0.1)_50%,transparent_51%)] bg-[length:60px_60px]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_49%,rgba(34,211,238,0.1)_50%,transparent_51%)] bg-[length:60px_60px]"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Story Content */}
            <div className="glass-morphism rounded-xl shadow-xl p-12 bg-black/80 border border-cyan-200">
              <h2 className="text-3xl font-black text-white mb-6 glow-cyan">Built from Experience</h2>
              <div className="space-y-6 text-gray-300 leading-relaxed">
                <p>
                  Hudson Digital was forged in the fires of enterprise-level challenges. With a foundation built on{" "}
                  <strong className="text-secondary-400 glow-cyan">$3.7M+ in revenue impact</strong>, we don&apos;t just build websites—we engineer business transformation tools.
                </p>
                <p>
                  Our approach combines the precision of revenue operations with the craftsmanship of modern development. Every line of code, every design decision, every optimization is driven by one goal:{" "}
                  <strong className="text-accent-400 glow-green">measurable business results</strong>.
                </p>
                <p>
                  We&apos;re not another agency promising the world. We&apos;re engineers who&apos;ve proven that technology, when properly applied, can generate{" "}
                  <strong className="text-warning-400 glow-orange">340% ROI</strong> and transform businesses.
                </p>
              </div>
            </div>
            {/* Mission & Vision Cards */}
            <div className="flex flex-col gap-8">
              <div className="glass-morphism rounded-xl shadow-xl p-8 bg-black/80 border border-cyan-200 flex flex-col items-center">
                <div className="mb-6 flex items-center gap-4">
                  <span className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-700 shadow-lg glow-cyan">
                    <RocketLaunchIcon className="w-8 h-8 text-white" />
                  </span>
                  <h3 className="text-xl font-black text-white">Our Mission</h3>
                </div>
                <p className="text-gray-300 text-center">
                  To forge digital solutions that don&apos;t just work—they dominate. We engineer competitive advantages, not just websites.
                </p>
              </div>
              <div className="glass-morphism rounded-xl shadow-xl p-8 bg-black/80 border border-green-200 flex flex-col items-center">
                <div className="mb-6 flex items-center gap-4">
                  <span className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-green-700 shadow-lg glow-green">
                    <EyeIcon className="w-8 h-8 text-white" />
                  </span>
                  <h3 className="text-xl font-black text-white">Our Vision</h3>
                </div>
                <p className="text-gray-300 text-center">
                  To be the premier digital forge where ambitious businesses come to build their market dominance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="relative py-24 bg-black/95 overflow-hidden">
        {/* Power Grid Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.15)_0%,transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(34,211,238,0.05)_50%,transparent_51%)] bg-[length:80px_80px]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_49%,rgba(34,211,238,0.05)_50%,transparent_51%)] bg-[length:80px_80px]"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-6 glow-cyan">Technical Arsenal</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Forged through enterprise-level battles, refined through startup agility, and sharpened by revenue-focused engineering.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="glass-morphism rounded-xl p-6 bg-black/80 border border-cyan-300/30 hover:border-cyan-300 transition-all duration-300 group">
              <div className="mb-4 flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-700 shadow-lg glow-cyan">
                  <CodeBracketIcon className="w-6 h-6 text-white" />
                </span>
                <h3 className="text-lg font-bold text-white">Development</h3>
              </div>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Next.js 15 & React 19</li>
                <li>• TypeScript & Node.js</li>
                <li>• Progressive Web Apps</li>
                <li>• Performance Optimization</li>
              </ul>
            </div>

            <div className="glass-morphism rounded-xl p-6 bg-black/80 border border-green-300/30 hover:border-green-300 transition-all duration-300 group">
              <div className="mb-4 flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-700 shadow-lg glow-green">
                  <ChartBarIcon className="w-6 h-6 text-white" />
                </span>
                <h3 className="text-lg font-bold text-white">Analytics</h3>
              </div>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Revenue Attribution</li>
                <li>• Conversion Optimization</li>
                <li>• A/B Testing</li>
                <li>• Performance Monitoring</li>
              </ul>
            </div>

            <div className="glass-morphism rounded-xl p-6 bg-black/80 border border-orange-300/30 hover:border-orange-300 transition-all duration-300 group">
              <div className="mb-4 flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-700 shadow-lg glow-orange">
                  <BoltIcon className="w-6 h-6 text-white" />
                </span>
                <h3 className="text-lg font-bold text-white">Operations</h3>
              </div>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Process Automation</li>
                <li>• CRM Integration</li>
                <li>• Email Marketing</li>
                <li>• Lead Nurturing</li>
              </ul>
            </div>

            <div className="glass-morphism rounded-xl p-6 bg-black/80 border border-purple-300/30 hover:border-purple-300 transition-all duration-300 group">
              <div className="mb-4 flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-700 shadow-lg glow-purple">
                  <ShieldCheckIcon className="w-6 h-6 text-white" />
                </span>
                <h3 className="text-lg font-bold text-white">Security</h3>
              </div>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Zero-Trust Architecture</li>
                <li>• GDPR Compliance</li>
                <li>• Performance Security</li>
                <li>• Vulnerability Assessment</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* The Founder Section */}
      <section className="relative py-24 bg-gradient-primary overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(34,211,238,0.1)_50%,transparent_51%)] bg-[length:60px_60px]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_49%,rgba(34,211,238,0.1)_50%,transparent_51%)] bg-[length:60px_60px]"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-6 glow-cyan">Meet the Architect</h2>
            <p className="text-xl text-gray-300">
              Hudson Digital Solutions was born from a simple realization: businesses don&apos;t need more technology—they need the right technology, implemented correctly.
            </p>
          </div>
          
          <div className="glass-morphism rounded-xl shadow-2xl p-12 bg-black/80 border border-cyan-200">
            <div className="space-y-8 text-gray-300 leading-relaxed">
              <p className="text-lg">
                As a <strong className="text-secondary-400 glow-cyan">revenue operations professional</strong> turned full-stack engineer, 
                I&apos;ve seen both sides of the equation: the business need for measurable results and the technical precision required to deliver them.
              </p>
              
              <p className="text-lg">
                My journey began in enterprise revenue operations, where I learned that every system, every process, and every line of code must serve one master: 
                <strong className="text-accent-400 glow-green"> business growth</strong>. This isn&apos;t about building pretty websites—it&apos;s about engineering competitive advantages.
              </p>
              
              <p className="text-lg">
                When I discovered that businesses were paying premium prices for basic websites that couldn&apos;t scale, couldn&apos;t convert, and couldn&apos;t adapt, 
                I knew there was a better way. Hudson Digital Solutions was founded on the principle that 
                <strong className="text-warning-400 glow-orange"> technology should be an investment, not an expense</strong>.
              </p>
              
              <div className="grid md:grid-cols-3 gap-8 mt-12 pt-8 border-t border-cyan-300/20">
                <div className="text-center">
                  <div className="text-3xl font-black text-secondary-400 glow-cyan mb-2">5+</div>
                  <div className="text-sm text-gray-400">Years in RevOps</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-accent-400 glow-green mb-2">$3.7M+</div>
                  <div className="text-sm text-gray-400">Revenue Impact</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-warning-400 glow-orange mb-2">340%</div>
                  <div className="text-sm text-gray-400">Average ROI</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="relative py-24 bg-black/95 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.15)_0%,transparent_50%)]"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-6 glow-cyan">Engineering Principles</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              The core beliefs that drive every line of code, every design decision, and every strategic recommendation.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="glass-morphism rounded-xl p-8 bg-black/80 border border-cyan-300/30 hover:border-cyan-300 transition-all duration-300 group">
              <div className="mb-6 flex items-center gap-4">
                <span className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-700 shadow-lg glow-cyan">
                  <LightBulbIcon className="w-8 h-8 text-white" />
                </span>
                <h3 className="text-xl font-black text-white">Performance First</h3>
              </div>
              <p className="text-gray-300">
                Every millisecond matters. We engineer for speed because fast sites convert better, rank higher, and deliver superior user experiences.
              </p>
            </div>

            <div className="glass-morphism rounded-xl p-8 bg-black/80 border border-green-300/30 hover:border-green-300 transition-all duration-300 group">
              <div className="mb-6 flex items-center gap-4">
                <span className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-green-700 shadow-lg glow-green">
                  <ChartBarIcon className="w-8 h-8 text-white" />
                </span>
                <h3 className="text-xl font-black text-white">Data Driven</h3>
              </div>
              <p className="text-gray-300">
                Assumptions kill businesses. Every decision is backed by data, every feature is measured, and every optimization is validated.
              </p>
            </div>

            <div className="glass-morphism rounded-xl p-8 bg-black/80 border border-orange-300/30 hover:border-orange-300 transition-all duration-300 group">
              <div className="mb-6 flex items-center gap-4">
                <span className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-700 shadow-lg glow-orange">
                  <CogIcon className="w-8 h-8 text-white" />
                </span>
                <h3 className="text-xl font-black text-white">Scalable Architecture</h3>
              </div>
              <p className="text-gray-300">
                We build for tomorrow&apos;s growth, not just today&apos;s needs. Every solution is architected to scale with your business ambitions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-24 bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.15)_0%,transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(34,211,238,0.05)_50%,transparent_51%)] bg-[length:80px_80px]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_49%,rgba(34,211,238,0.05)_50%,transparent_51%)] bg-[length:80px_80px]"></div>
        </div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-secondary opacity-5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-accent opacity-5 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        
        <div className="relative max-w-4xl mx-auto text-center px-6 sm:px-8 lg:px-12">
          <h2 className="text-5xl font-black text-white mb-6 glow-cyan">
            Ready to Engineer Your Success?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Stop settling for ordinary. Let&apos;s build something that doesn&apos;t just work—it dominates.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold bg-gradient-to-r from-cyan-400 to-cyan-600 text-white rounded-xl hover:from-cyan-500 hover:to-cyan-700 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-cyan-500/30 glow-cyan"
            >
              Start Your Project
            </a>
            <a
              href="/services"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold border-2 border-cyan-400 text-cyan-400 rounded-xl hover:bg-cyan-400 hover:text-black transform hover:scale-105 transition-all duration-300"
            >
              Explore Services
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
