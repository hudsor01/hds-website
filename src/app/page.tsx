import { Metadata } from "next";
import { SEO_CONFIG } from "@/utils/seo";
import { RocketLaunchIcon, EyeIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

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
                BUILD.
                <br />
                <span className="text-gradient-neon glow-cyan">DEPLOY.</span>
                <br />
                <span className="text-secondary-400">DOMINATE.</span>
              </h1>
              <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-xl">
                We engineer digital solutions that don&apos;t just work—they{" "}
                <strong className="text-white">crush the competition</strong>.
                No fluff. No delays. Just results.
              </p>
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
    </main>
  );
}
