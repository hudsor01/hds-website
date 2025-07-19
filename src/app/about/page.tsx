import { Metadata } from "next";
import { SEO_CONFIG } from "@/utils/seo";
import { RocketLaunchIcon, EyeIcon } from "@heroicons/react/24/solid";

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
    </main>
  );
}
