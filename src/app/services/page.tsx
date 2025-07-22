import { Metadata } from "next";
import { SEO_CONFIG } from "@/utils/seo";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

// Next.js 15: SSR meta for SEO/TTFB
export const metadata: Metadata = {
  title: SEO_CONFIG.services.title,
  description: SEO_CONFIG.services.description,
  keywords: SEO_CONFIG.services.keywords,
  openGraph: {
    title: SEO_CONFIG.services.ogTitle ?? SEO_CONFIG.services.title,
    description: SEO_CONFIG.services.ogDescription ?? SEO_CONFIG.services.description,
    url: SEO_CONFIG.services.canonical,
    images: [
      {
        url: SEO_CONFIG.services.ogImage ?? "",
        alt: SEO_CONFIG.services.title,
      },
    ],
  },
  alternates: {
    canonical: SEO_CONFIG.services.canonical,
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
    "ld+json": JSON.stringify(SEO_CONFIG.services.structuredData),
  },
};

const services = [
  {
    title: "WEB APPS",
    description: "Lightning-fast applications that scale with your business growth.",
    features: [
      "React • Vue • Next.js",
      "API Development",
      "Database Architecture",
      "Performance Optimization",
    ],
    pricing: "$5K+",
  },
  {
    title: "CUSTOM SOLUTIONS",
    description: "Bespoke software engineered for your exact business requirements.",
    features: [
      "Business Automation",
      "System Integrations",
      "Data Analytics",
      "Revenue Operations",
    ],
    pricing: "$8K+",
  },
  {
    title: "STRATEGY",
    description: "Data-driven digital strategy that cuts through the noise.",
    features: [
      "Technical Audits",
      "Growth Planning",
      "ROI Optimization",
      "Market Analysis",
    ],
    pricing: "$2K+",
  },
];

const reasons = [
  { value: "150+", title: "Projects Delivered" },
  { value: "98%", title: "Success Rate" },
  { value: "340%", title: "Average ROI" },
  { value: "24/7", title: "Support" },
];

const process = [
  {
    title: "Discover",
    description: "Understand your business and requirements.",
  },
  {
    title: "Plan",
    description: "Create comprehensive strategy and timeline.",
  },
  {
    title: "Build",
    description: "Engineer your solution with precision.",
  },
  {
    title: "Launch",
    description: "Deploy and dominate your market.",
  },
];

export default function ServicesPage() {
  return (
    <main className="bg-gradient-primary min-h-screen">
      {/* Header - Tech Minimal */}
      <section className="relative bg-gradient-hero py-32 overflow-hidden">
        {/* Tech grid overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(34,211,238,0.1)_50%,transparent_51%)] bg-[length:60px_60px]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_49%,rgba(34,211,238,0.1)_50%,transparent_51%)] bg-[length:60px_60px]"></div>
        </div>
        {/* Subtle energy elements */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-secondary opacity-5 rounded-full blur-3xl animate-pulse"></div>
        <div className="relative max-w-6xl mx-auto text-center px-6 sm:px-8 lg:px-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-cyan-300 bg-cyan-400/10 text-cyan-400 font-semibold text-lg">
            <span className="w-2 h-2 bg-secondary-400 rounded-full animate-pulse"></span>
            Services
          </span>
          <h1 className="text-6xl lg:text-8xl font-black text-white mb-8 leading-none tracking-tight">
            DIGITAL
            <br />
            <span className="text-secondary-400 glow-cyan">DOMINATION</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Three core services. Zero compromise. Maximum impact.
          </p>
        </div>
      </section>
      {/* Services Grid - Ultra Clean */}
      <section className="py-32 bg-gradient-primary">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid md:grid-cols-3 gap-0">
            {services.map((service, index) => (
              <div
                key={service.title}
                className="p-8 border-r border-gray-700 last:border-r-0 hover:bg-white/5 transition-all duration-300 group"
              >
                {/* Number */}
                <div className="text-6xl font-black text-secondary-400/40 mb-6 group-hover:text-secondary-400 group-hover:scale-105 transition-all duration-300 glow-cyan">
                  {String(index + 1).padStart(2, "0")}
                </div>
                {/* Service */}
                <h3 className="text-2xl font-black text-white mb-4 group-hover:text-secondary-400 transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  {service.description}
                </p>
                {/* Features */}
                <div className="space-y-3 mb-8">
                  {service.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className="w-1 h-1 bg-secondary-400 rounded-full"></div>
                      <span className="text-sm text-gray-500 uppercase tracking-wide">{feature}</span>
                    </div>
                  ))}
                </div>
                {/* Price */}
                <div className="text-3xl font-black text-white mb-6">
                  {service.pricing}
                </div>
                {/* CTA */}
                <Link href="/contact" passHref>
                  <button
                    type="button"
                    className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-bold text-lg transition-all duration-200 glow-cyan"
                  >
                    START PROJECT
                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Why Choose Section - Minimal */}
      <section className="py-32 bg-gradient-primary border-t border-gray-700">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-white mb-6">
              WHY CHOOSE US?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Because we deliver results, not excuses.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {reasons.map((reason, index) => {
              const colors = [
                { 
                  text: "text-cyan-400", 
                  hoverText: "group-hover:text-cyan-300", 
                  glow: "glow-cyan",
                  bg: "bg-gradient-to-br from-cyan-400/10 to-cyan-600/10",
                  border: "border-cyan-400/30 hover:border-cyan-400"
                },
                { 
                  text: "text-green-400", 
                  hoverText: "group-hover:text-green-300", 
                  glow: "glow-green",
                  bg: "bg-gradient-to-br from-green-400/10 to-green-600/10",
                  border: "border-green-400/30 hover:border-green-400"
                },
                { 
                  text: "text-orange-400", 
                  hoverText: "group-hover:text-orange-300", 
                  glow: "glow-orange",
                  bg: "bg-gradient-to-br from-orange-400/10 to-orange-600/10",
                  border: "border-orange-400/30 hover:border-orange-400"
                },
                { 
                  text: "text-purple-400", 
                  hoverText: "group-hover:text-purple-300", 
                  glow: "glow-purple",
                  bg: "bg-gradient-to-br from-purple-400/10 to-purple-600/10",
                  border: "border-purple-400/30 hover:border-purple-400"
                }
              ];
              const colorSet = colors[index % colors.length];
              
              return (
                <div 
                  key={reason.title} 
                  className={`text-center group cursor-pointer p-6 rounded-xl border ${colorSet.bg} ${colorSet.border} transition-all duration-300 hover:scale-105`}
                >
                  <div className={`text-5xl font-black mb-4 group-hover:scale-105 transition-all duration-300 ${colorSet.text} ${colorSet.glow}`}>
                    {reason.value}
                  </div>
                  <div className={`text-sm uppercase tracking-wide font-bold transition-colors duration-300 text-gray-400 ${colorSet.hoverText}`}>
                    {reason.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      {/* Process Section - Minimal */}
      <section className="py-32 bg-gradient-primary border-t border-gray-700">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-white mb-6">
              THE PROCESS
            </h2>
            <p className="text-gray-400">
              Four steps to digital dominance.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {process.map((step, index) => {
              const stepColors = [
                { 
                  text: "text-cyan-400", 
                  hoverText: "group-hover:text-cyan-300", 
                  glow: "glow-cyan",
                  border: "border-cyan-400/30 group-hover:border-cyan-400",
                  bg: "group-hover:bg-cyan-400/10"
                },
                { 
                  text: "text-green-400", 
                  hoverText: "group-hover:text-green-300", 
                  glow: "glow-green",
                  border: "border-green-400/30 group-hover:border-green-400",
                  bg: "group-hover:bg-green-400/10"
                },
                { 
                  text: "text-orange-400", 
                  hoverText: "group-hover:text-orange-300", 
                  glow: "glow-orange",
                  border: "border-orange-400/30 group-hover:border-orange-400",
                  bg: "group-hover:bg-orange-400/10"
                },
                { 
                  text: "text-purple-400", 
                  hoverText: "group-hover:text-purple-300", 
                  glow: "glow-purple",
                  border: "border-purple-400/30 group-hover:border-purple-400",
                  bg: "group-hover:bg-purple-400/10"
                }
              ];
              const stepColor = stepColors[index % stepColors.length];
              
              return (
                <div key={step.title} className="text-center group cursor-pointer p-6 rounded-xl hover:scale-105 transition-all duration-300">
                  <div className={`w-16 h-16 border rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-black transition-all duration-300 ${stepColor.text} ${stepColor.border} ${stepColor.bg} ${stepColor.glow}`}>
                    {index + 1}
                  </div>
                  <h3 className={`text-lg font-black text-white mb-3 uppercase tracking-wide transition-colors duration-300 ${stepColor.hoverText}`}>
                    {step.title}
                  </h3>
                  <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-32 bg-gradient-primary border-t border-gray-700">
        <div className="max-w-4xl mx-auto text-center px-6 sm:px-8 lg:px-12">
          <h2 className="text-5xl font-black text-white mb-8">
            READY TO
            <br />
            <span className="text-secondary-400 glow-cyan">DOMINATE?</span>
          </h2>
          <Link href="/contact" passHref>
            <button
              type="button"
              className="inline-flex items-center gap-2 bg-cyan-400 hover:bg-cyan-500 text-white font-bold py-6 px-12 rounded-lg text-lg shadow-lg transition-all duration-300 glow-cyan uppercase tracking-wider mx-auto"
            >
              Start Now
              <ArrowRightIcon className="w-6 h-6" />
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}
