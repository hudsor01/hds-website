import { Metadata } from "next";
import { SEO_CONFIG } from "@/utils/seo";
import Link from "next/link";
import { 
  RocketLaunchIcon, 
  EyeIcon, 
  CodeBracketIcon,
  ChartBarIcon,
  LightBulbIcon,
  CogIcon,
  ShieldCheckIcon,
  BoltIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";
import { BackgroundPattern } from "@/components/ui/BackgroundPattern";

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
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <BackgroundPattern variant="hero" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 text-cyan-400 font-semibold text-sm backdrop-blur-sm">
                ⚡ Our Story
              </span>
            </div>

            <div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-none tracking-tight">
                <span className="inline-block mr-4">Built for</span>
                <span className="inline-block mr-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Excellence</span>
              </h1>
            </div>

            <div>
              <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                Crafting digital solutions with the precision of master engineers and the vision of business leaders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Our Story
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Built from experience, driven by results, and focused on your success.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Story Content */}
            <div className="group relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 p-8 hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300">
              <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-cyan-400 transition-colors">
                Built from Experience
              </h3>
              <div className="space-y-6 text-gray-300 leading-relaxed">
                <p>
                  Hudson Digital was forged in the fires of enterprise-level challenges. With a foundation built on{" "}
                  <strong className="text-cyan-400">$3.7M+ in revenue impact</strong>, we don&apos;t just build websites—we engineer business transformation tools.
                </p>
                <p>
                  Our approach combines the precision of revenue operations with the craftsmanship of modern development. Every line of code, every design decision, every optimization is driven by one goal:{" "}
                  <strong className="text-purple-400">measurable business results</strong>.
                </p>
                <p>
                  We&apos;re not another agency promising the world. We&apos;re engineers who&apos;ve proven that technology, when properly applied, can generate{" "}
                  <strong className="text-pink-400">340% ROI</strong> and transform businesses.
                </p>
              </div>
            </div>

            {/* Mission & Vision Cards */}
            <div className="space-y-8">
              <div className="group relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 p-8 hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-500/30">
                    <RocketLaunchIcon className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                    Our Mission
                  </h3>
                </div>
                <p className="text-gray-300 group-hover:text-white transition-colors">
                  To forge digital solutions that don&apos;t just work—they dominate. We engineer competitive advantages, not just websites.
                </p>
              </div>

              <div className="group relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 p-8 hover:border-purple-400/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-400/20 to-pink-500/20 border border-purple-500/30">
                    <EyeIcon className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                    Our Vision
                  </h3>
                </div>
                <p className="text-gray-300 group-hover:text-white transition-colors">
                  To be the premier digital forge where ambitious businesses come to build their market dominance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Technical Arsenal
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Forged through enterprise-level battles, refined through startup agility, and sharpened by revenue-focused engineering.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-500/30">
                  <CodeBracketIcon className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">Development</h3>
              </div>
              <ul className="text-gray-300 space-y-2 text-sm group-hover:text-white transition-colors">
                <li>• Next.js 15 & React 19</li>
                <li>• TypeScript & Node.js</li>
                <li>• Progressive Web Apps</li>
                <li>• Performance Optimization</li>
              </ul>
            </div>

            <div className="group relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:border-emerald-400/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-400/20 to-green-500/20 border border-emerald-500/30">
                  <ChartBarIcon className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">Analytics</h3>
              </div>
              <ul className="text-gray-300 space-y-2 text-sm group-hover:text-white transition-colors">
                <li>• Revenue Attribution</li>
                <li>• Conversion Optimization</li>
                <li>• A/B Testing</li>
                <li>• Performance Monitoring</li>
              </ul>
            </div>

            <div className="group relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:border-orange-400/50 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-400/20 to-red-500/20 border border-orange-500/30">
                  <BoltIcon className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors">Operations</h3>
              </div>
              <ul className="text-gray-300 space-y-2 text-sm group-hover:text-white transition-colors">
                <li>• Process Automation</li>
                <li>• CRM Integration</li>
                <li>• Email Marketing</li>
                <li>• Lead Nurturing</li>
              </ul>
            </div>

            <div className="group relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:border-purple-400/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-400/20 to-pink-500/20 border border-purple-500/30">
                  <ShieldCheckIcon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">Security</h3>
              </div>
              <ul className="text-gray-300 space-y-2 text-sm group-hover:text-white transition-colors">
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
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Meet the Architect
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Hudson Digital Solutions was born from a simple realization: businesses don&apos;t need more technology—they need the right technology, implemented correctly.
            </p>
          </div>
          
          <div className="group relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 p-12 hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300">
            <div className="space-y-8 text-gray-300 leading-relaxed">
              <p className="text-lg group-hover:text-white transition-colors">
                As a <strong className="text-cyan-400">revenue operations professional</strong> turned full-stack engineer, 
                I&apos;ve seen both sides of the equation: the business need for measurable results and the technical precision required to deliver them.
              </p>
              
              <p className="text-lg group-hover:text-white transition-colors">
                My journey began in enterprise revenue operations, where I learned that every system, every process, and every line of code must serve one master: 
                <strong className="text-purple-400"> business growth</strong>. This isn&apos;t about building pretty websites—it&apos;s about engineering competitive advantages.
              </p>
              
              <p className="text-lg group-hover:text-white transition-colors">
                When I discovered that businesses were paying premium prices for basic websites that couldn&apos;t scale, couldn&apos;t convert, and couldn&apos;t adapt, 
                I knew there was a better way. Hudson Digital Solutions was founded on the principle that 
                <strong className="text-pink-400"> technology should be an investment, not an expense</strong>.
              </p>
              
              <div className="grid md:grid-cols-3 gap-8 mt-12 pt-8 border-t border-white/20">
                <div className="text-center">
                  <div className="text-3xl font-black text-cyan-400 mb-2 group-hover:text-white transition-colors">5+</div>
                  <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Years in RevOps</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-purple-400 mb-2 group-hover:text-white transition-colors">$3.7M+</div>
                  <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Revenue Impact</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-pink-400 mb-2 group-hover:text-white transition-colors">340%</div>
                  <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Average ROI</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Engineering Principles
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              The core beliefs that drive every line of code, every design decision, and every strategic recommendation.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="group relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 p-8 hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-500/30">
                  <LightBulbIcon className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">Performance First</h3>
              </div>
              <p className="text-gray-300 group-hover:text-white transition-colors">
                Every millisecond matters. We engineer for speed because fast sites convert better, rank higher, and deliver superior user experiences.
              </p>
            </div>

            <div className="group relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 p-8 hover:border-emerald-400/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-green-500/20 border border-emerald-500/30">
                  <ChartBarIcon className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">Data Driven</h3>
              </div>
              <p className="text-gray-300 group-hover:text-white transition-colors">
                Assumptions kill businesses. Every decision is backed by data, every feature is measured, and every optimization is validated.
              </p>
            </div>

            <div className="group relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 p-8 hover:border-orange-400/50 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-400/20 to-red-500/20 border border-orange-500/30">
                  <CogIcon className="w-8 h-8 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors">Scalable Architecture</h3>
              </div>
              <p className="text-gray-300 group-hover:text-white transition-colors">
                We build for tomorrow&apos;s growth, not just today&apos;s needs. Every solution is architected to scale with your business ambitions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 text-center bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-12 md:p-16">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              Ready to engineer 
              <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                {" "}your success?
              </span>
            </h2>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
              Stop settling for ordinary. Let&apos;s build something that doesn&apos;t just work—it dominates.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="group relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-lg rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative z-10">Start Your Project</span>
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="/services"
                className="group inline-flex items-center gap-3 px-10 py-5 border-2 border-gray-600 text-white font-semibold text-lg rounded-xl hover:border-cyan-400 hover:text-cyan-400 transition-all duration-300"
              >
                Explore Services
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
