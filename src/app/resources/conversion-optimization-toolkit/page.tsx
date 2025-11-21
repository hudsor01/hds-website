import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDownTrayIcon, CheckCircleIcon, ChartBarIcon, CogIcon } from "@heroicons/react/24/outline";
import { TrendingUp, DollarSign, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: "Free Conversion Optimization Toolkit 2025 - Templates & Guides | Hudson Digital",
  description: "Get our complete conversion optimization toolkit: A/B testing templates, CRO audit checklist, psychology triggers guide, and ROI calculator. Free download.",
  keywords: "conversion optimization toolkit, A/B testing templates, CRO templates, conversion rate optimization guide, website conversion templates, free CRO resources",
  openGraph: {
    title: "Free Conversion Optimization Toolkit 2025 - Complete CRO Resources",
    description: "Complete toolkit with templates, guides, and calculators to boost your conversion rates by 300%+. Free download.",
    url: "https://hudsondigitalsolutions.com/resources/conversion-optimization-toolkit",
    type: "article",
    images: [
      {
        url: "https://hudsondigitalsolutions.com/HDS-Logo.webp",
        width: 1200,
        height: 630,
        alt: "Conversion Optimization Toolkit - Hudson Digital Solutions",
      },
    ],
  },
  alternates: {
    canonical: "https://hudsondigitalsolutions.com/resources/conversion-optimization-toolkit",
  },
};

const toolkitItems = [
  {
    icon: ChartBarIcon,
    title: "A/B Testing Templates",
    description: "Ready-to-use templates for testing headlines, CTAs, and page layouts",
    items: ["Headline testing framework", "CTA button variations", "Landing page layouts", "Email subject lines"]
  },
  {
    icon: CogIcon,
    title: "CRO Audit Checklist",
    description: "Comprehensive checklist to identify conversion bottlenecks",
    items: ["Page-by-page audit guide", "Conversion funnel analysis", "User experience evaluation", "Technical optimization checks"]
  },
  {
    icon: CheckCircleIcon,
    title: "Psychology Triggers Guide",
    description: "Proven psychological principles that drive conversions",
    items: ["Urgency and scarcity tactics", "Social proof strategies", "Trust building elements", "Decision-making shortcuts"]
  },
  {
    icon: ChartBarIcon,
    title: "ROI Calculator",
    description: "Calculate the potential return on your optimization investments",
    items: ["Conversion impact calculator", "Revenue projection tool", "Cost-benefit analysis", "Timeline estimator"]
  }
];

export default function ConversionToolkitPage() {
  return (
    <main className="min-h-screen bg-gradient-primary">
      {/* Hero Section */}
      <section className="relative bg-gradient-hero section-spacing overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.15)_0%,transparent_50%)]"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center page-padding-x">
          <div className="inline-flex flex-center gap-tight px-4 py-2 mb-comfortable rounded-full border border-green-300 bg-green-400/10 text-green-400 font-semibold text-body-lg">
            <CogIcon className="w-5 h-5" />
            Complete Toolkit
          </div>

          <h1 className="text-clamp-xl font-black text-white mb-heading">
            Conversion Optimization <span className="gradient-text">Toolkit</span>
          </h1>

          <p className="text-subheading text-gray-300 mb-comfortable max-w-2xl mx-auto">
            Everything you need to boost conversion rates by 300%+. Templates, checklists, calculators, and proven strategies used by top-performing websites.
          </p>

          <div className="flex flex-col sm:flex-row gap-content justify-center mb-content-block">
            <Link
              href="#download"
              className="inline-flex flex-center gap-tight bg-green-400 text-black font-bold py-4 px-8 rounded-lg hover:bg-green-300 transition-colors text-body-lg"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              Download Complete Toolkit
            </Link>
            <Link
              href="/contact"
              className="inline-flex flex-center gap-tight border border-cyan-400 text-cyan-400 font-semibold py-4 px-8 rounded-lg hover:bg-cyan-400/10 transition-colors"
            >
              Get Professional Implementation
            </Link>
          </div>

          <div className="grid-4 gap-comfortable text-center">
            <div>
              <div className="text-section-title font-bold text-cyan-400">4</div>
              <div className="text-gray-400">Tool Categories</div>
            </div>
            <div>
              <div className="text-section-title font-bold text-green-400">15+</div>
              <div className="text-gray-400">Templates</div>
            </div>
            <div>
              <div className="text-section-title font-bold text-purple-400">$0</div>
              <div className="text-gray-400">Cost</div>
            </div>
            <div>
              <div className="text-section-title font-bold text-yellow-400">300%+</div>
              <div className="text-gray-400">Avg ROI Boost</div>
            </div>
          </div>
        </div>
      </section>

      {/* Toolkit Contents */}
      <section className="section-spacing bg-gradient-primary">
        <div className="max-w-7xl mx-auto page-padding-x">
          <div className="text-center mb-content-block">
            <h2 className="text-section-title font-black text-white mb-subheading">What&apos;s Inside the Toolkit</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Complete set of tools and templates to systematically improve your conversion rates
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-comfortable">
            {toolkitItems.map((item, index) => (
              <div key={index} className="glass-card rounded-xl card-padding hover:border-cyan-300/50 transition-smooth">
                <div className="flex items-start gap-content">
                  <div className="w-12 h-12 bg-gradient-secondary-br-20 rounded-lg flex-center shrink-0">
                    <item.icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-subheading font-bold text-white mb-subheading">{item.title}</h3>
                    <p className="text-gray-300 mb-subheading">{item.description}</p>
                    <ul className="space-y-tight">
                      {item.items.map((subItem, subIndex) => (
                        <li key={subIndex} className="flex items-start gap-tight text-gray-300 text-caption">
                          <CheckCircleIcon className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                          {subItem}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="section-spacing bg-gradient-primary">
        <div className="max-w-6xl mx-auto page-padding-x">
          <div className="text-center mb-content-block">
            <h2 className="text-section-title font-black text-white mb-subheading">Proven Results</h2>
            <p className="text-gray-300">Real outcomes from businesses using these tools</p>
          </div>

          <div className="grid-3 gap-comfortable">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-400/20 rounded-full flex-center mx-auto mb-subheading">
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
              <div className="text-section-title font-bold text-green-400 mb-subheading">340%</div>
              <div className="text-gray-300">Average conversion increase</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-400/20 rounded-full flex-center mx-auto mb-subheading">
                <DollarSign className="w-8 h-8 text-cyan-400" />
              </div>
              <div className="text-section-title font-bold text-cyan-400 mb-subheading">$185K</div>
              <div className="text-gray-300">Average revenue increase</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-400/20 rounded-full flex-center mx-auto mb-subheading">
                <Clock className="w-8 h-8 text-purple-400" />
              </div>
              <div className="text-section-title font-bold text-purple-400 mb-subheading">8 weeks</div>
              <div className="text-gray-300">Average time to results</div>
            </div>
          </div>

          <div className="mt-content-block grid md:grid-cols-2 gap-comfortable">
            <div className="glass-card-light rounded-lg card-padding-sm">
              <blockquote className="text-gray-300 italic mb-subheading">
                &quot;The A/B testing templates saved us months of work. We identified our best-performing headlines in just 2 weeks and saw a 67% increase in sign-ups.&quot;
              </blockquote>
              <div className="flex flex-center gap-tight">
                <div className="w-10 h-10 bg-gradient-secondary rounded-full flex-center text-white font-bold">
                  M
                </div>
                <div>
                  <div className="text-cyan-400 font-semibold">Mike Chen</div>
                  <div className="text-gray-500 text-caption">SaaS Founder</div>
                </div>
              </div>
            </div>

            <div className="glass-card-light rounded-lg card-padding-sm">
              <blockquote className="text-gray-300 italic mb-subheading">
                &quot;The psychology triggers guide completely changed how we write our copy. Revenue per visitor increased 142% in the first quarter.&quot;
              </blockquote>
              <div className="flex flex-center gap-tight">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex-center text-white font-bold">
                  S
                </div>
                <div>
                  <div className="text-green-400 font-semibold">Sarah Williams</div>
                  <div className="text-gray-500 text-caption">E-commerce Director</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="section-spacing bg-gradient-primary">
        <div className="max-w-4xl mx-auto page-padding-x">
          <div className="glass-card rounded-2xl card-padding text-center">
            <CogIcon className="w-16 h-16 text-green-400 mx-auto mb-comfortable" />

            <h2 className="text-section-title font-black text-white mb-subheading">
              Download Your Complete Toolkit
            </h2>

            <p className="text-subheading text-gray-300 mb-comfortable max-w-2xl mx-auto">
              Get instant access to templates, checklists, and calculators that have helped 150+ businesses achieve 340% average ROI improvement.
            </p>

            {/* Download Form */}
            <div className="max-w-md mx-auto">
              <form className="space-y-content" action="/api/lead-magnet" method="POST">
                <input type="hidden" name="resource" value="conversion-optimization-guide" />

                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your business email"
                    required
                    className="w-full p-input bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus-ring transition-colors"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First name"
                    required
                    className="w-full p-input bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus-ring transition-colors"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    name="company"
                    placeholder="Company name (optional)"
                    className="w-full p-input bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus-ring transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-400 text-black font-bold py-4 px-8 rounded-lg hover:bg-green-300 transition-colors flex-center gap-tight"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  Get My Complete Toolkit
                </button>
              </form>

              <p className="text-caption text-gray-500 mt-4">
                No spam. We&apos;ll only send you valuable conversion optimization insights.
              </p>
            </div>

            <div className="mt-comfortable pt-8 border-t border-gray-700">
              <h3 className="text-body-lg font-bold text-white mb-subheading">Want Professional Implementation?</h3>
              <p className="text-gray-300 mb-subheading">
                Our conversion optimization specialists can implement these strategies for you. We&apos;ve helped 150+ businesses achieve an average 340% ROI.
              </p>
              <Link
                href="/contact"
                className="inline-flex flex-center gap-tight border border-cyan-400 text-cyan-400 font-semibold py-3 px-6 rounded-lg hover:bg-cyan-400/10 transition-colors"
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