import { BackgroundPattern } from "@/components/magicui/BackgroundPattern";
import { SEO_CONFIG } from "@/utils/seo";
import {
    ArrowRight,
    BarChart3,
    Code2,
    Eye,
    Lightbulb,
    Rocket,
    Settings,
    ShieldCheck,
    Zap
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/glass-card";
import { Badge } from "@/components/ui/badge";

// Next.js 15: SSR meta for SEO/TTFB
export const metadata: Metadata = {
  title: SEO_CONFIG.about?.title || 'About Hudson Digital Solutions',
  description: SEO_CONFIG.about?.description || 'Learn about Hudson Digital Solutions',
  keywords: SEO_CONFIG.about?.keywords || [],
  openGraph: {
    title: SEO_CONFIG.about?.ogTitle ?? SEO_CONFIG.about?.title ?? 'About Hudson Digital Solutions',
    description: SEO_CONFIG.about?.ogDescription ?? SEO_CONFIG.about?.description ?? 'Learn about Hudson Digital Solutions',
    url: SEO_CONFIG.about?.canonical || '',
    images: [
      {
        url: SEO_CONFIG.about?.ogImage ?? "",
        alt: SEO_CONFIG.about?.title || 'About Hudson Digital Solutions',
      },
    ],
  },
  alternates: {
    canonical: SEO_CONFIG.about?.canonical || '',
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
    "ld+json": JSON.stringify(SEO_CONFIG.about?.structuredData || {}),
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex-center overflow-hidden">
        <BackgroundPattern variant="hero" />

        <div className="relative z-sticky container-wide text-center">
          <div className="space-y-sections">
            <div>
              <Badge variant="accent" className="px-4 py-2 text-sm">
                Our Story
              </Badge>
            </div>

            <div>
              <h1 className="text-responsive-lg font-black text-foreground leading-none tracking-tight text-balance">
                <span className="inline-block mr-4">Built for</span>
                <span className="inline-block mr-4 text-accent">Excellence</span>
              </h1>
            </div>

            <div className="typography">
              <p className="text-responsive-md text-muted-foreground container-wide leading-relaxed text-pretty">
                Where proven revenue impact meets obsessive engineering standards. We don&apos;t build websites—we forge revenue machines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="relative section-spacing page-padding-x">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-responsive-lg font-black text-foreground mb-content-block text-balance">
              <span className="text-accent">
                Our Story
              </span>
            </h2>
            <div className="typography">
              <p className="text-xl text-muted-foreground container-narrow text-pretty">
                Built from experience, driven by results, and focused on your success.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Story Content */}
            <GlassCard variant="light" padding="lg" hover className="group">
              <h3 className="text-2xl font-bold text-foreground mb-content-block group-hover:text-accent transition-smooth">
                Forged in Revenue Operations, Refined in Code
              </h3>
              <div className="space-y-comfortable text-muted-foreground leading-relaxed typography">
                <p>
                  Most agencies learned web development in bootcamps. We learned it in the trenches of enterprise revenue operations—where every line of code either makes money or loses it.
                </p>
                <p>
                  With <strong className="text-accent">proven revenue impact</strong> across Fortune 500 companies and high-growth startups, we discovered something agencies miss:
                  <strong className="text-info"> websites don&apos;t fail because of bad code—they fail because they don&apos;t understand revenue</strong>.
                </p>
                <p>
                  That&apos;s why our clients see <strong className="text-accent">proven ROI results</strong> in months, not years. We don&apos;t just ship features. We ship{' '}
                  <Link href="/services" className="link-primary font-semibold">revenue engines</Link> backed by analytics,
                  A/B testing, and ruthless optimization. Every pixel, every animation, every database query is measured against one metric: <strong className="text-success-text">does this make money?</strong>
                </p>
                <p className="text-foreground font-semibold">
                  We&apos;re not another agency promising &quot;beautiful websites.&quot; We&apos;re revenue engineers who happen to write beautiful code.{' '}
                  <Link href="/contact" className="link-primary">Let&apos;s talk about your project</Link>.
                </p>
              </div>
            </GlassCard>

            {/* Mission & Vision Cards */}
            <div className="space-y-sections">
              <GlassCard variant="light" padding="lg" hover className="group">
                <div className="flex-center gap-content mb-heading">
                  <div className="p-3 rounded-xl bg-muted-br-20 border border-primary/30">
                    <Rocket className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground group-hover:text-accent transition-smooth">
                    Our Mission
                  </h3>
                </div>
                <p className="text-muted-foreground group-hover:text-foreground transition-smooth">
                  Make enterprise-grade development accessible to growing businesses. No more choosing between &quot;affordable but mediocre&quot; or &quot;excellent but unaffordable.&quot; Get both.
                </p>
              </GlassCard>

              <GlassCard variant="light" padding="lg" hover className="group">
                <div className="flex-center gap-content mb-heading">
                  <div className="p-3 rounded-xl bg-info/20 border border-info/30">
                    <Eye className="w-8 h-8 text-info" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground group-hover:text-info transition-smooth">
                    Our Guarantee
                  </h3>
                </div>
                <p className="text-muted-foreground group-hover:text-foreground transition-smooth">
                  If your investment doesn&apos;t show measurable ROI within 90 days, we keep working for free until it does. Your success is our only metric.{' '}
                  <Link href="/pricing" className="link-primary font-semibold">View our pricing</Link>.
                </p>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="relative section-spacing page-padding-x">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-clamp-xl font-black text-foreground mb-content-block text-balance">
              <span className="text-accent">
                Technical Arsenal
              </span>
            </h2>
            <p className="text-xl text-muted container-narrow text-pretty">
              Forged through enterprise-level battles, refined through startup agility, and sharpened by revenue-focused engineering.
            </p>
          </div>

          <div className="grid-4">
            <GlassCard variant="light" padding="sm" hover className="group">
              <div className="flex-center gap-3 mb-heading">
                <div className="p-3 rounded-xl bg-muted-br-20 border border-primary/30">
                  <Code2 className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-accent transition-smooth">Development</h3>
              </div>
              <ul className="text-muted-foreground space-y-tight text-sm group-hover:text-foreground transition-smooth">
                <li>• Next.js 15 & React 19</li>
                <li>• TypeScript & Node.js</li>
                <li>• Progressive Web Apps</li>
                <li>• Performance Optimization</li>
              </ul>
            </GlassCard>

            <GlassCard variant="light" padding="sm" hover className="group">
              <div className="flex-center gap-3 mb-heading">
                <div className="p-3 rounded-xl bg-muted-br-20 border border-success/30">
                  <BarChart3 className="w-6 h-6 text-success-text" />
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-success-text transition-smooth">Analytics</h3>
              </div>
              <ul className="text-muted-foreground space-y-tight text-sm group-hover:text-foreground transition-smooth">
                <li>• Revenue Attribution</li>
                <li>• Conversion Optimization</li>
                <li>• A/B Testing</li>
                <li>• Performance Monitoring</li>
              </ul>
            </GlassCard>

            <GlassCard variant="light" padding="sm" hover className="group">
              <div className="flex-center gap-3 mb-heading">
                <div className="p-3 rounded-xl bg-muted border border-muted-foreground/30">
                  <Zap className="w-6 h-6 text-orange-text" />
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-orange-text transition-smooth">Operations</h3>
              </div>
              <ul className="text-muted-foreground space-y-tight text-sm group-hover:text-foreground transition-smooth">
                <li>• Process Automation</li>
                <li>• CRM Integration</li>
                <li>• Email Marketing</li>
                <li>• Lead Nurturing</li>
              </ul>
            </GlassCard>

            <GlassCard variant="light" padding="sm" hover className="group">
              <div className="flex-center gap-3 mb-heading">
                <div className="p-3 rounded-xl bg-info/20 border border-info/30">
                  <ShieldCheck className="w-6 h-6 text-info" />
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-info transition-smooth">Security</h3>
              </div>
              <ul className="text-muted-foreground space-y-tight text-sm group-hover:text-foreground transition-smooth">
                <li>• Zero-Trust Architecture</li>
                <li>• GDPR Compliance</li>
                <li>• Performance Security</li>
                <li>• Vulnerability Assessment</li>
              </ul>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* The Founder Section */}
      <section className="relative section-spacing page-padding-x">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-clamp-xl font-black text-foreground mb-content-block text-balance">
              <span className="text-accent">
                The Revenue Engineer Behind the Code
              </span>
            </h2>
            <p className="text-xl text-muted container-narrow text-pretty">
              Why trust a former revenue operations professional to build your website? Because they understand something agencies don&apos;t: every feature must justify its existence in dollars.
            </p>
          </div>

          <GlassCard variant="light" padding="lg" hover className="group">
            <div className="space-y-sections text-muted-foreground leading-relaxed">
              <p className="text-lg group-hover:text-foreground transition-smooth">
                Before writing a single line of client code, I spent 5+ years as a <strong className="text-accent">revenue operations professional</strong> at enterprise SaaS companies.
                I didn&apos;t build features—I built systems that generated <strong className="text-accent">measurable revenue impact</strong>.
              </p>

              <p className="text-lg group-hover:text-foreground transition-smooth">
                Here&apos;s what I learned: <strong className="text-info">most websites fail not because of bad technology, but because of bad economics</strong>.
                Agencies charge $50K for a beautiful site that converts at 1.2%. We charge $5K-8K for a revenue-optimized machine that converts at 4%+. The math is simple.
              </p>

              <p className="text-lg group-hover:text-foreground transition-smooth">
                When I discovered businesses were hemorrhaging money on bloated agencies and junior developers who couldn&apos;t spell &quot;ROI,&quot; I knew there was a gap.
                Hudson Digital Solutions fills that gap: <strong className="text-accent">enterprise-grade development at startup prices, with revenue accountability baked into every line of code</strong>.
              </p>

              <p className="text-xl text-foreground font-bold border-l-4 border-accent pl-6 py-4 bg-accent/5">
                &quot;I don&apos;t care how beautiful your code is if it doesn&apos;t make money. Ship results or ship nothing.&quot;
              </p>

              <div className="grid md:grid-cols-4 gap-sections mt-12 pt-8 border-t border-white/20">
                <div className="text-center">
                  <div className="text-3xl font-black text-accent mb-subheading group-hover:text-foreground transition-smooth">5+</div>
                  <div className="text-sm text-muted-foreground group-hover:text-muted-foreground transition-smooth">Years in RevOps</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-info mb-subheading group-hover:text-foreground transition-smooth">Proven</div>
                  <div className="text-sm text-muted-foreground group-hover:text-muted-foreground transition-smooth">Revenue Impact</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-accent mb-subheading group-hover:text-foreground transition-smooth">Strong</div>
                  <div className="text-sm text-muted-foreground group-hover:text-muted-foreground transition-smooth">Avg Client ROI</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-success-text mb-subheading group-hover:text-foreground transition-smooth">Growing</div>
                  <div className="text-sm text-muted-foreground group-hover:text-muted-foreground transition-smooth">Businesses Transformed</div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Core Values */}
      <section className="relative section-spacing page-padding-x">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-clamp-xl font-black text-foreground mb-content-block text-balance">
              <span className="text-accent">
                Engineering Principles
              </span>
            </h2>
            <p className="text-xl text-muted container-narrow text-pretty">
              The core beliefs that drive every line of code, every design decision, and every strategic recommendation.
            </p>
          </div>

          <div className="grid-3">
            <GlassCard variant="light" padding="lg" hover className="group">
              <div className="flex items-center gap-content mb-content-block">
                <div className="card-padding-sm rounded-2xl bg-muted-br-20 border border-primary/30">
                  <Lightbulb className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-accent transition-smooth">Performance First</h3>
              </div>
              <p className="text-muted group-hover:text-foreground transition-smooth">
                Every millisecond matters. We engineer for speed because fast sites convert better, rank higher, and deliver superior user experiences.
              </p>
            </GlassCard>

            <GlassCard variant="light" padding="lg" hover className="group">
              <div className="flex items-center gap-content mb-content-block">
                <div className="card-padding-sm rounded-2xl bg-muted-br-20 border border-success/30">
                  <BarChart3 className="w-8 h-8 text-success-text" />
                </div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-success-text transition-smooth">Data Driven</h3>
              </div>
              <p className="text-muted group-hover:text-foreground transition-smooth">
                Assumptions kill businesses. Every decision is backed by data, every feature is measured, and every optimization is validated.
              </p>
            </GlassCard>

            <GlassCard variant="light" padding="lg" hover className="group">
              <div className="flex items-center gap-content mb-content-block">
                <div className="card-padding-sm rounded-2xl bg-muted border border-muted-foreground/30">
                  <Settings className="w-8 h-8 text-orange-text" />
                </div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-orange-text transition-smooth">Scalable Architecture</h3>
              </div>
              <p className="text-muted group-hover:text-foreground transition-smooth">
                We build for tomorrow&apos;s growth, not just today&apos;s needs. Every solution is architected to scale with your business ambitions.
              </p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative section-spacing page-padding-x">
        <div className="container-wide">
          <GlassCard variant="section" padding="md" className="relative z-sticky text-center">
            <h2 className="text-clamp-xl font-black text-foreground mb-content-block text-balance">
              Ready to engineer
              <span className="text-accent">
                {" "}your success?
              </span>
            </h2>

            <p className="text-xl text-muted container-narrow mb-10 text-pretty">
              Stop settling for ordinary. Let&apos;s build something that doesn&apos;t just work—it dominates.
            </p>

            <div className="flex flex-col sm:flex-row flex-center gap-content">
              <Button asChild variant="default" size="xl" trackConversion={true}>
                <Link href="/contact">
                  Start Your Project
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>

              <Button asChild variant="outline" size="xl">
                <Link href="/services">
                  Explore Services
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </GlassCard>
        </div>
      </section>
    </main>
  );
}
