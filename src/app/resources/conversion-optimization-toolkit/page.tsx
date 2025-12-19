import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart3, CheckCircle, Clock, DollarSign, Download, Settings, TrendingUp } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

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
    icon: BarChart3,
    title: "A/B Testing Templates",
    description: "Ready-to-use templates for testing headlines, CTAs, and page layouts",
    items: ["Headline testing framework", "CTA button variations", "Landing page layouts", "Email subject lines"]
  },
  {
    icon: Settings,
    title: "CRO Audit Checklist",
    description: "Comprehensive checklist to identify conversion bottlenecks",
    items: ["Page-by-page audit guide", "Conversion funnel analysis", "User experience evaluation", "Technical optimization checks"]
  },
  {
    icon: CheckCircle,
    title: "Psychology Triggers Guide",
    description: "Proven psychological principles that drive conversions",
    items: ["Urgency and scarcity tactics", "Social proof strategies", "Trust building elements", "Decision-making shortcuts"]
  },
  {
    icon: BarChart3,
    title: "ROI Calculator",
    description: "Calculate the potential return on your optimization investments",
    items: ["Conversion impact calculator", "Revenue projection tool", "Cost-benefit analysis", "Timeline estimator"]
  }
];

export default function ConversionToolkitPage() {
  return (
    <main className="min-h-screen bg-primary">
      {/* Hero Section */}
      <section className="relative bg-background section-spacing overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-(radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.15)_0%,transparent_50%))"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center px-6 sm:px-8 lg:px-12">
          <div className="inline-flex flex-center gap-tight px-4 py-2 mb-comfortable rounded-full border border-success-muted bg-success-text/10 text-success-text font-semibold text-lg">
            <Settings className="w-5 h-5" />
            Complete Toolkit
          </div>

          <h1 className="text-clamp-xl font-black text-foreground mb-heading">
            Conversion Optimization <span className="text-accent">Toolkit</span>
          </h1>

          <p className="text-subheading text-muted mb-comfortable max-w-2xl mx-auto">
            Everything you need to boost conversion rates by 300%+. Templates, checklists, calculators, and proven strategies used by top-performing websites.
          </p>

          <div className="flex flex-col sm:flex-row gap-content justify-center mb-content-block">
            <Link
              href="#download"
              className="inline-flex flex-center gap-tight bg-success-text text-black font-bold py-4 px-8 rounded-lg hover:bg-success-muted transition-colors text-body-lg"
            >
              <Download className="w-5 h-5" />
              Download Complete Toolkit
            </Link>
            <Link
              href="/contact"
              className="inline-flex flex-center gap-tight border border-accent text-accent font-semibold py-4 px-8 rounded-lg hover:bg-accent/10 transition-colors"
            >
              Get Professional Implementation
            </Link>
          </div>

          <div className="grid-4 gap-comfortable text-center">
            <div>
              <div className="text-section-title font-bold text-accent">4</div>
              <div className="text-muted-foreground">Tool Categories</div>
            </div>
            <div>
              <div className="text-section-title font-bold text-success-text">15+</div>
              <div className="text-muted-foreground">Templates</div>
            </div>
            <div>
              <div className="text-section-title font-bold text-info">$0</div>
              <div className="text-muted-foreground">Cost</div>
            </div>
            <div>
              <div className="text-section-title font-bold text-warning-text">300%+</div>
              <div className="text-muted-foreground">Avg ROI Boost</div>
            </div>
          </div>
        </div>
      </section>

      {/* Toolkit Contents */}
      <section className="section-spacing bg-primary">
        <div className="max-w-7xl mx-auto page-padding-x">
          <div className="text-center mb-content-block">
            <h2 className="text-section-title font-black text-foreground mb-subheading">What&apos;s Inside the Toolkit</h2>
            <p className="text-muted max-w-2xl mx-auto">
              Complete set of tools and templates to systematically improve your conversion rates
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-comfortable">
            {toolkitItems.map((item, index) => (
              <div key={index} className="glass-card rounded-xl card-padding hover:border-accent/60/50 transition-smooth">
                <div className="flex items-start gap-content">
                  <div className="w-12 h-12 bg-muted-br-20 rounded-lg flex-center shrink-0">
                    <item.icon className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-subheading font-bold text-foreground mb-subheading">{item.title}</h3>
                    <p className="text-muted mb-subheading">{item.description}</p>
                    <ul className="space-y-tight">
                      {item.items.map((subItem, subIndex) => (
                        <li key={subIndex} className="flex items-start gap-tight text-muted text-sm">
                          <CheckCircle className="w-4 h-4 text-success-text mt-0.5 shrink-0" />
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
      <section className="section-spacing bg-primary">
        <div className="max-w-6xl mx-auto page-padding-x">
          <div className="text-center mb-content-block">
            <h2 className="text-section-title font-black text-foreground mb-subheading">Proven Results</h2>
            <p className="text-muted">Real outcomes from businesses using these tools</p>
          </div>

          <div className="grid-3 gap-comfortable">
            <div className="text-center">
              <div className="w-16 h-16 bg-success-text/20 rounded-full flex-center mx-auto mb-subheading">
                <TrendingUp className="w-8 h-8 text-success-text" />
              </div>
              <div className="text-section-title font-bold text-success-text mb-subheading">Strong</div>
              <div className="text-muted">Average conversion increase</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex-center mx-auto mb-subheading">
                <DollarSign className="w-8 h-8 text-accent" />
              </div>
              <div className="text-section-title font-bold text-accent mb-subheading">$185K</div>
              <div className="text-muted">Average revenue increase</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-info/20 rounded-full flex-center mx-auto mb-subheading">
                <Clock className="w-8 h-8 text-info" />
              </div>
              <div className="text-section-title font-bold text-info mb-subheading">8 weeks</div>
              <div className="text-muted">Average time to results</div>
            </div>
          </div>

          <div className="mt-content-block grid md:grid-cols-2 gap-comfortable">
            <div className="glass-card-light rounded-lg card-padding-sm">
              <blockquote className="text-muted italic mb-subheading">
                &quot;The A/B testing templates saved us months of work. We identified our best-performing headlines in just 2 weeks and saw a 67% increase in sign-ups.&quot;
              </blockquote>
              <div className="flex flex-center gap-tight">
                <div className="w-10 h-10 bg-muted rounded-full flex-center text-foreground font-bold">
                  M
                </div>
                <div>
                  <div className="text-accent font-semibold">Mike Chen</div>
                  <div className="text-muted-foreground text-caption">SaaS Founder</div>
                </div>
              </div>
            </div>

            <div className="glass-card-light rounded-lg card-padding-sm">
              <blockquote className="text-muted italic mb-subheading">
                &quot;The psychology triggers guide completely changed how we write our copy. Revenue per visitor increased 142% in the first quarter.&quot;
              </blockquote>
              <div className="flex flex-center gap-tight">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex-center text-foreground font-bold">
                  S
                </div>
                <div>
                  <div className="text-success-text font-semibold">Sarah Williams</div>
                  <div className="text-muted-foreground text-caption">E-commerce Director</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="py-section-sm bg-primary">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="glass-card rounded-2xl card-padding-lg lg:p-12 text-center">
            <Settings className="w-16 h-16 text-success-text mx-auto mb-content-block" />

            <h2 className="text-3xl font-black text-foreground mb-heading">
              Download Your Complete Toolkit
            </h2>

            <p className="text-subheading text-muted mb-comfortable max-w-2xl mx-auto">
              Get instant access to templates, checklists, and calculators that have helped businesses achieve proven ROI improvement.
            </p>

            {/* Download Form */}
            <div className="max-w-md mx-auto">
              <form className="space-y-content" action="/api/lead-magnet" method="POST">
                <input type="hidden" name="resource" value="conversion-optimization-guide" />

                <div>
                  <Input
                    type="email"
                    name="email"
                    placeholder="Enter your business email"
                    required
                  />
                </div>

                <div>
                  <Input
                    type="text"
                    name="firstName"
                    placeholder="First name"
                    required
                  />
                </div>

                <div>
                  <Input
                    type="text"
                    name="company"
                    placeholder="Company name (optional)"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-success-text text-black font-bold hover:bg-success-muted"
                >
                  <Download className="w-5 h-5" />
                  Get My Complete Toolkit
                </Button>
              </form>

              <p className="text-caption text-muted-foreground mt-4">
                No spam. We&apos;ll only send you valuable conversion optimization insights.
              </p>
            </div>

            <div className="mt-comfortable pt-8 border-t border-border">
              <h3 className="text-body-lg font-bold text-foreground mb-subheading">Want Professional Implementation?</h3>
              <p className="text-muted mb-subheading">
                Our conversion optimization specialists can implement these strategies for you. We&apos;ve helped businesses achieve proven ROI results.
              </p>
              <Link
                href="/contact"
                className="inline-flex flex-center gap-tight border border-accent text-accent font-semibold py-3 px-6 rounded-lg hover:bg-accent/10 transition-colors"
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
