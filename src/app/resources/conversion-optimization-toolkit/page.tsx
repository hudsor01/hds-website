import { Metadata } from "next";
import Link from "next/link";
import { ArrowDownTrayIcon, CheckCircleIcon, ChartBarIcon, CogIcon } from "@heroicons/react/24/outline";

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
      <section className="relative bg-gradient-hero py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.15)_0%,transparent_50%)]"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center px-6 sm:px-8 lg:px-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-green-300 bg-green-400/10 text-green-400 font-semibold text-lg">
            <CogIcon className="w-5 h-5" />
            Complete Toolkit
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-black text-white mb-6">
            Conversion Optimization <span className="text-gradient-neon glow-cyan">Toolkit</span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Everything you need to boost conversion rates by 300%+. Templates, checklists, calculators, and proven strategies used by top-performing websites.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="#download"
              className="inline-flex items-center gap-2 bg-green-400 text-black font-bold py-4 px-8 rounded-lg hover:bg-green-300 transition-colors text-lg"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              Download Complete Toolkit
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-cyan-400 text-cyan-400 font-semibold py-4 px-8 rounded-lg hover:bg-cyan-400/10 transition-colors"
            >
              Get Professional Implementation
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-cyan-400">4</div>
              <div className="text-gray-400">Tool Categories</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400">15+</div>
              <div className="text-gray-400">Templates</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400">$0</div>
              <div className="text-gray-400">Cost</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-400">300%+</div>
              <div className="text-gray-400">Avg ROI Boost</div>
            </div>
          </div>
        </div>
      </section>

      {/* Toolkit Contents */}
      <section className="py-16 bg-gradient-primary">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-4">What's Inside the Toolkit</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Complete set of tools and templates to systematically improve your conversion rates
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {toolkitItems.map((item, index) => (
              <div key={index} className="glass-morphism bg-black/60 border border-gray-700 rounded-xl p-8 hover:border-cyan-300/50 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400/20 to-green-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                    <p className="text-gray-300 mb-4">{item.description}</p>
                    <ul className="space-y-2">
                      {item.items.map((subItem, subIndex) => (
                        <li key={subIndex} className="flex items-start gap-2 text-gray-300 text-sm">
                          <CheckCircleIcon className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
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
      <section className="py-16 bg-gradient-primary">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-4">Proven Results</h2>
            <p className="text-gray-300">Real outcomes from businesses using these tools</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <div className="text-3xl font-bold text-green-400 mb-2">340%</div>
              <div className="text-gray-300">Average conversion increase</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <div className="text-3xl font-bold text-cyan-400 mb-2">$185K</div>
              <div className="text-gray-300">Average revenue increase</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⏱️</span>
              </div>
              <div className="text-3xl font-bold text-purple-400 mb-2">8 weeks</div>
              <div className="text-gray-300">Average time to results</div>
            </div>
          </div>

          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <div className="bg-black/40 border border-gray-700 rounded-lg p-6">
              <blockquote className="text-gray-300 italic mb-4">
                "The A/B testing templates saved us months of work. We identified our best-performing headlines in just 2 weeks and saw a 67% increase in sign-ups."
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  M
                </div>
                <div>
                  <div className="text-cyan-400 font-semibold">Mike Chen</div>
                  <div className="text-gray-500 text-sm">SaaS Founder</div>
                </div>
              </div>
            </div>

            <div className="bg-black/40 border border-gray-700 rounded-lg p-6">
              <blockquote className="text-gray-300 italic mb-4">
                "The psychology triggers guide completely changed how we write our copy. Revenue per visitor increased 142% in the first quarter."
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                  S
                </div>
                <div>
                  <div className="text-green-400 font-semibold">Sarah Williams</div>
                  <div className="text-gray-500 text-sm">E-commerce Director</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="py-16 bg-gradient-primary">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="glass-morphism bg-black/80 border border-green-200 rounded-2xl p-8 lg:p-12 text-center">
            <CogIcon className="w-16 h-16 text-green-400 mx-auto mb-6" />
            
            <h2 className="text-3xl font-black text-white mb-4">
              Download Your Complete Toolkit
            </h2>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Get instant access to templates, checklists, and calculators that have helped 150+ businesses achieve 340% average ROI improvement.
            </p>

            {/* Download Form */}
            <div className="max-w-md mx-auto">
              <form className="space-y-4" action="/api/lead-magnet" method="POST">
                <input type="hidden" name="resource" value="conversion-optimization-guide" />
                
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your business email"
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400 transition-colors"
                  />
                </div>
                
                <div>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First name"
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400 transition-colors"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    name="company"
                    placeholder="Company name (optional)"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-400 text-black font-bold py-4 px-8 rounded-lg hover:bg-green-300 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  Get My Complete Toolkit
                </button>
              </form>

              <p className="text-xs text-gray-500 mt-4">
                No spam. We'll only send you valuable conversion optimization insights.
              </p>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4">Want Professional Implementation?</h3>
              <p className="text-gray-300 mb-4">
                Our conversion optimization specialists can implement these strategies for you. We've helped 150+ businesses achieve an average 340% ROI.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 border border-cyan-400 text-cyan-400 font-semibold py-3 px-6 rounded-lg hover:bg-cyan-400/10 transition-colors"
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