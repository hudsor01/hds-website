import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Zap, Target, Download, CheckCircle2, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: "Free Website Performance Checklist 2025 - Download PDF | Hudson Digital",
  description: "Get our comprehensive 47-point website performance checklist. Boost conversion rates, improve SEO, and increase revenue. Free PDF download with actionable steps.",
  keywords: "website performance checklist, conversion optimization checklist, website audit checklist, SEO performance checklist, web development checklist, site speed optimization, conversion rate optimization",
  openGraph: {
    title: "Free Website Performance Checklist 2025 - Download PDF",
    description: "47-point checklist to boost website performance, conversions, and SEO. Free PDF download with proven strategies.",
    url: "https://hudsondigitalsolutions.com/resources/website-performance-checklist",
    type: "article",
    images: [
      {
        url: "https://hudsondigitalsolutions.com/HDS-Logo.webp",
        width: 1200,
        height: 630,
        alt: "Website Performance Checklist - Hudson Digital Solutions",
      },
    ],
    siteName: "Hudson Digital Solutions",
    locale: "en_US",
  },
  alternates: {
    canonical: "https://hudsondigitalsolutions.com/resources/website-performance-checklist",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const checklistItems = [
  {
    category: "Speed Optimization",
    items: [
      "Page load time under 3 seconds",
      "First Contentful Paint under 1.5s",
      "Largest Contentful Paint under 2.5s",
      "Cumulative Layout Shift under 0.1",
      "Images optimized (WebP/AVIF format)",
      "Critical CSS inlined",
      "JavaScript bundles minified",
      "CDN implementation",
    ]
  },
  {
    category: "Conversion Optimization",
    items: [
      "Clear value proposition above fold",
      "Single, prominent call-to-action",
      "Trust signals visible",
      "Mobile-optimized forms",
      "Exit-intent popups configured",
      "A/B testing setup",
      "Conversion tracking active",
      "User journey optimized",
    ]
  },
  {
    category: "SEO Foundation",
    items: [
      "Title tags optimized (50-60 characters)",
      "Meta descriptions compelling (150-160 chars)",
      "Header structure (H1-H6) logical",
      "Schema markup implemented",
      "XML sitemap submitted",
      "Core Web Vitals passing",
      "Mobile-first indexing ready",
      "Internal linking strategy",
    ]
  },
  {
    category: "Security & Trust",
    items: [
      "SSL certificate active",
      "Security headers configured",
      "Privacy policy accessible",
      "Contact information visible",
      "Professional email address",
      "Social proof displayed",
      "Customer testimonials",
      "Trust badges positioned",
    ]
  },
  {
    category: "Analytics & Tracking",
    items: [
      "PostHog analytics configured",
      "Goal tracking setup",
      "Conversion events defined",
      "Heat mapping active",
      "User behavior tracking",
      "Performance monitoring",
      "Error tracking enabled",
      "Regular reporting schedule",
    ]
  },
  {
    category: "Content & UX",
    items: [
      "Content addresses user needs",
      "Reading level appropriate",
      "Visual hierarchy clear",
      "White space utilized effectively",
      "Typography readable",
      "Color contrast WCAG compliant",
      "Navigation intuitive",
      "Search functionality (if applicable)",
    ]
  }
];

export default function WebsiteChecklistPage() {
  return (
    <main className="min-h-screen bg-gradient-primary">
      {/* Hero Section */}
      <section className="relative bg-gradient-hero py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.15)_0%,transparent_50%)]"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center px-6 sm:px-8 lg:px-12">
          <div className="inline-flex flex-center gap-2 px-4 py-2 mb-8 rounded-full border border-green-300 bg-green-400/10 text-green-400 font-semibold text-lg">
            <FileText className="w-5 h-5" />
            Free Resource
          </div>
          
          <h1 className="text-clamp-xl font-black text-white mb-6">
            Website Performance <span className="gradient-text">Checklist</span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            47 actionable checkpoints to boost conversion rates by 300%+, improve SEO rankings, and increase revenue. Based on $10M+ in client results.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="#download"
              className="inline-flex flex-center gap-2 bg-green-400 text-black font-bold py-4 px-8 rounded-lg hover:bg-green-300 transition-colors text-lg"
            >
              <Download className="w-5 h-5" />
              Download Free Checklist
            </Link>
            <Link
              href="/contact"
              className="inline-flex flex-center gap-2 border border-cyan-400 text-cyan-400 font-semibold py-4 px-8 rounded-lg hover:bg-cyan-400/10 transition-colors"
            >
              Get Professional Audit
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-cyan-400">47</div>
              <div className="text-gray-400">Checkpoints</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400">300%+</div>
              <div className="text-gray-400">Avg ROI Boost</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400">6</div>
              <div className="text-gray-400">Key Categories</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-400">FREE</div>
              <div className="text-gray-400">No Cost</div>
            </div>
          </div>
        </div>
      </section>

      {/* Checklist Preview */}
      <section className="py-16 bg-gradient-primary">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-4">Checklist Preview</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Get a glimpse of what&apos;s inside our comprehensive performance checklist. Each section includes detailed action items with clear success criteria.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {checklistItems.map((section, index) => (
              <div key={section.category} className="glass-card rounded-xl p-6 hover:border-cyan-300/50 transition-all duration-300">
                <h3 className="text-xl font-bold text-white mb-4 flex flex-center gap-2">
                  <span className="w-8 h-8 bg-cyan-400 text-black rounded-full flex-center text-sm font-bold">
                    {index + 1}
                  </span>
                  {section.category}
                </h3>
                <ul className="space-y-2">
                  {section.items.slice(0, 4).map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2 text-gray-300 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                  {section.items.length > 4 && (
                    <li className="text-cyan-400 text-sm font-medium">
                      +{section.items.length - 4} more items in full checklist
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gradient-primary">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-4">Why This Checklist Works</h2>
            <p className="text-gray-300">Based on real results from 150+ client projects</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-400/20 rounded-lg flex-center shrink-0">
                  <BarChart3 className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Data-Driven Results</h3>
                  <p className="text-gray-300">Every checkpoint is based on analysis of high-performing websites and conversion optimization best practices.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-cyan-400/20 rounded-lg flex-center shrink-0">
                  <Zap className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Quick Implementation</h3>
                  <p className="text-gray-300">Each item includes clear action steps that can be implemented immediately, no technical expertise required.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-400/20 rounded-lg flex-center shrink-0">
                  <Target className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">ROI-Focused</h3>
                  <p className="text-gray-300">Prioritized by impact - tackle the highest-return optimizations first to maximize your results.</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-secondary-20 border border-green-400/30 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-3">Real Client Results</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Conversion Rate Increase:</span>
                    <span className="text-green-400 font-bold">340% avg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Page Speed Improvement:</span>
                    <span className="text-cyan-400 font-bold">65% faster</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">SEO Ranking Boost:</span>
                    <span className="text-purple-400 font-bold">2.3x increase</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Revenue Impact:</span>
                    <span className="text-yellow-400 font-bold">$50K-500K+</span>
                  </div>
                </div>
              </div>

              <div className="glass-card-light rounded-lg p-6">
                <blockquote className="text-gray-300 italic mb-3">
                  &quot;This checklist helped us identify 12 critical issues we didn&apos;t even know we had. Revenue increased 180% in 8 weeks.&quot;
                </blockquote>
                <div className="text-cyan-400 font-semibold">— Sarah M., E-commerce Director</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="py-16 bg-gradient-primary">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="glass-card rounded-2xl p-8 lg:p-12 text-center">
            <FileText className="w-16 h-16 text-green-400 mx-auto mb-6" />
            
            <h2 className="text-3xl font-black text-white mb-4">
              Download Your Free Checklist
            </h2>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Get instant access to our 47-point website performance checklist. No spam, just actionable insights that drive results.
            </p>

            {/* Download Form */}
            <div className="max-w-md mx-auto">
              <form className="space-y-4" action="/api/lead-magnet" method="POST">
                <input type="hidden" name="resource" value="website-performance-checklist" />
                
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your business email"
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus-ring transition-colors"
                  />
                </div>
                
                <div>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First name"
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus-ring transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-400 text-black font-bold py-4 px-8 rounded-lg hover:bg-green-300 transition-colors flex-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Get My Free Checklist
                </button>
              </form>

              <p className="text-xs text-gray-500 mt-4">
                No spam, ever. We respect your privacy and will only send valuable insights.
              </p>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4">Need Professional Implementation?</h3>
              <p className="text-gray-300 mb-4">
                Want us to handle the optimization for you? Our team has implemented these strategies for 150+ businesses with an average 340% ROI.
              </p>
              <Link
                href="/contact"
                className="inline-flex flex-center gap-2 border border-cyan-400 text-cyan-400 font-semibold py-3 px-6 rounded-lg hover:bg-cyan-400/10 transition-colors"
              >
                Get Professional Help
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}