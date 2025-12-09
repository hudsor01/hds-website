import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  BarChart3,
  Calculator,
  Clock,
  Code2,
  Rocket,
  Settings,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { NewsletterSignupDynamic as NewsletterSignup } from '@/components/forms/NewsletterSignupDynamic';

export default function HomePage() {
  const solutions = [
    {
      icon: Code2,
      title: "Ship Features Faster",
      description: "Launch new features in days, not months. We handle the entire technical stack.",
      features: ["React/Next.js Development", "API & Database Architecture", "99.9% Uptime Guaranteed"]
    },
    {
      icon: Settings,
      title: "Fix Revenue Leaks",
      description: "Stop losing 30% of leads to broken processes. Automate everything that slows you down.",
      features: ["CRM Integration", "Lead Scoring Automation", "Real-time Analytics"]
    },
    {
      icon: BarChart3,
      title: "Scale Without Breaking",
      description: "Handle 10x growth without rebuilding. We future-proof your tech from day one.",
      features: ["Performance Audits", "Infrastructure Planning", "Cost Optimization"]
    }
  ];

  const results = [
    { metric: "50+", label: "Projects Delivered", period: "Since 2020" },
    { metric: "250%", label: "Average ROI Increase", period: "Within 6 months" },
    { metric: "98%", label: "Client Satisfaction", period: "5-star rated" },
    { metric: "24/7", label: "Support Available", period: "When you need us" }
  ];

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section - Seamless Layout */}
      <section className="relative py-section lg:py-40 px-4 sm:px-6">
        <div className="container-wide">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">

            {/* Left Side - Content */}
            <div className="lg:pr-8">
              <div className="space-y-sections">
                <div>
                  <h1 className="text-responsive-3xl font-black text-text-inverted leading-tight mb-comfortable text-balance">
                    <span className="block mb-subheading">Stop Losing Revenue to</span>
                    <span className="block text-accent">
                      Technical Bottlenecks
                    </span>
                  </h1>
                  <p className="text-responsive-xl font-bold text-accent mb-content-block">
                    Ship 3x Faster, 60% Cheaper
                  </p>
                </div>

                <p className="text-xl text-muted leading-relaxed max-w-xl">
                  We build and scale your technical operations in weeks, not months.
                  No hiring delays. No training costs. Just proven senior talent ready to execute.
                </p>

                <div className="flex flex-col sm:flex-row gap-comfortable">
                  <Button asChild variant="default" size="lg" trackConversion={true}>
      <Link href="/contact">
        See Your ROI in 30 Days
        <ArrowRight className="w-4 h-4" />
      </Link>
    </Button>
                  <Button asChild variant="outline" size="lg" trackConversion={true}>
      <Link href="/portfolio">
        View Case Studies
        <ArrowRight className="w-4 h-4" />
      </Link>
    </Button>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap gap-sections pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-success-text" />
                    </div>
                    <span className="text-sm font-medium text-muted">Average 250% ROI</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-info-text" />
                    </div>
                    <span className="text-sm font-medium text-muted">Zero onboarding time</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Terminal Display */}
            <div className="mt-16 lg:mt-0">
              <div className="relative">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 bg-primary/80/20 rounded-3xl blur-3xl opacity-50" />
                <div className="absolute top-4 right-4 w-32 h-32 bg-info/20 rounded-full blur-2xl" />

                {/* Terminal Window */}
                <div className="relative glass-card-light overflow-hidden">
                  {/* Terminal Header */}
                  <div className="bg-card/80 border-b border-border px-4 py-3 flex-between">
                    <div className="flex-center gap-tight">
                      <div className="w-3 h-3 rounded-full bg-destructive" />
                      <div className="w-3 h-3 rounded-full bg-warning" />
                      <div className="w-3 h-3 rounded-full bg-success" />
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">hudson-deploy.sh</div>
                    <div className="w-3 h-3 bg-success-text rounded-full" />
                  </div>

                  {/* Terminal Content */}
                  <div className="card-padding font-mono text-sm space-y-tight" role="log">
                    <div className="text-accent">$ npm run deploy --production</div>
                    <div className="text-muted-foreground">[OK] Build completed in 1.8s</div>
                    <div className="text-muted-foreground">[OK] Tests passed (147/147)</div>
                    <div className="text-muted-foreground">[OK] Security scan clean</div>
                    <div className="text-info">&gt; Deploying to production...</div>
                    <div className="text-success">[OK] Deployment successful</div>
                    <div className="text-warning">[LIVE] at https://client-app.com</div>

                    <div className="pt-2 space-y-1">
                      <div className="text-accent/80">Performance: 100/100</div>
                      <div className="text-accent/80">Accessibility: 100/100</div>
                      <div className="text-accent/80">SEO: 98/100</div>
                    </div>

                    <div className="text-accent mt-4">
                      <span className="inline-block">$</span>
                      <span className="inline-block w-2 h-4 bg-accent ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-section px-4 sm:px-6">
        <div className="container-wide">
          <div className="text-center mb-20">
            <h2 className="text-responsive-2xl font-black text-primary-foreground mb-content-block text-balance">
              How We Solve Your Biggest Problems
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Three ways we help SaaS companies go from struggling to scaling
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-sections">
            {solutions.map((solution, index) => (
              <div
                key={index}
                className="group relative glass-card-light card-padding-lg card-hover-glow transition-smooth transform-gpu"
              >
                <div className="space-y-comfortable">
                  <div className="flex-center space-x-4">
                    <div className="p-3 rounded-xl bg-background-20 border border-primary/30 hover-lift will-change-transform transition-smooth">
                      <solution.icon className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="text-xl font-bold text-text-inverted group-hover:text-accent transition-smooth">
                      {solution.title}
                    </h3>
                  </div>

                  <div className="typography">
                    <p className="muted leading-relaxed">
                      {solution.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {solution.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-muted" />
                        <span className="text-responsive-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Results Section - Enhanced */}
      <section className="relative py-section px-4 sm:px-6 bg-muted overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-primary/5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-info-text/5 rounded-full blur-3xl" />

        <div className="container-wide relative">
          <div className="text-center mb-24">
            <h2 className="text-responsive-2xl font-black text-primary-foreground mb-content-block text-balance">
              <span className="text-accent relative inline-block">
                Proven Impact
                <span className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1.5 bg-accent rounded-full"></span>
              </span>
            </h2>

            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto mt-heading">
              Numbers don&apos;t lie - our clients see <span className="text-accent font-semibold">measurable results</span> that transform their businesses
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-sections lg:gap-10">
            {results.map((result, index) => (
              <div
                key={index}
                className="text-center group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Card with enhanced styling */}
                <div className="relative glass-card-light card-padding-lg lg:p-10 card-hover-glow border border-accent/20 hover:border-accent/40 transition-all duration-500 group-hover:transform group-hover:scale-105">
                  {/* Top accent line */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-accent rounded-b-full"></div>

                  {/* Metric with enhanced styling */}
                  <div className="relative mb-heading">
                    <div className="text-4xl lg:text-5xl font-black text-primary-foreground mb-subheading group-hover:text-accent transition-all duration-300 font-mono">
                      {result.metric}
                    </div>
                    <div className="absolute -inset-4 bg-accent/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-sticky"></div>
                  </div>

                  {/* Label with enhanced typography */}
                  <div className="text-lg font-bold text-muted mb-3 group-hover:text-primary-foreground transition-colors duration-300">
                    {result.label}
                  </div>

                  {/* Period with accent styling */}
                  <div className="text-sm text-muted-foreground font-medium px-3 py-1 bg-muted/50 rounded-full border border-border/50">
                    {result.period}
                  </div>

                  {/* Subtle glow effect */}
                  <div className="absolute inset-0 bg-accent/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </div>

                {/* Connecting dots for visual flow */}
                {index < results.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-5 transform -translate-y-1/2">
                    <div className="w-3 h-0.5 bg-accent/50"></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom accent section */}
          <div className="text-center mt-16 pt-8 border-t border-border-primary/30">
            <p className="text-text-muted text-sm font-medium">
              Join <span className="text-accent font-semibold">50+ successful businesses</span> who transformed with Hudson Digital Solutions
            </p>
          </div>
        </div>
      </section>

      {/* Free Tools Section */}
      <section className="py-section px-4 sm:px-6 bg-background">
        <div className="container-wide">
          <div className="text-center mb-20">
            <h2 className="text-responsive-2xl font-black text-text-inverted mb-content-block text-balance">
              <span className="text-accent relative inline-block">
                Free Business Tools
                <span className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1.5 bg-accent rounded-full"></span>
              </span>
            </h2>

            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto mt-heading">
              Calculate your potential in 60 seconds. No signup required.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-sections">
            {/* ROI Calculator */}
            <Link
              href="/roi-calculator"
              className="group relative glass-card-light card-padding-lg card-hover-glow border border-accent/20 hover:border-accent/40 transition-all duration-500 hover:transform hover:scale-105 transform-gpu"
            >
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-accent rounded-b-full"></div>

              <div className="mb-content-block">
                <div className="w-16 h-16 rounded-lg bg-primary/80/10 flex items-center justify-center mb-heading group-hover:bg-primary/80/20 transition-colors">
                  <TrendingUp className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-text-inverted mb-subheading group-hover:text-accent transition-colors">
                  ROI Calculator
                </h3>
                <p className="text-text-muted text-sm mb-heading">
                  See how much revenue you&apos;re leaving on the table with poor conversion rates
                </p>
              </div>

              <ul className="space-y-tight mb-content-block">
                <li className="flex items-center gap-tight text-sm text-text-secondary">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                  Calculate potential revenue increase
                </li>
                <li className="flex items-center gap-tight text-sm text-text-secondary">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                  Understand conversion impact
                </li>
                <li className="flex items-center gap-tight text-sm text-text-secondary">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                  Make data-driven decisions
                </li>
              </ul>

              <div className="flex items-center text-accent font-semibold group-hover:gap-tight transition-all">
                <span>Try Calculator</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            {/* Cost Estimator */}
            <Link
              href="/cost-estimator"
              className="group relative glass-card-light card-padding-lg card-hover-glow border border-accent/20 hover:border-accent/40 transition-all duration-500 hover:transform hover:scale-105 transform-gpu"
            >
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-accent rounded-b-full"></div>

              <div className="mb-content-block">
                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mb-heading group-hover:bg-primary/20 transition-colors">
                  <Calculator className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-text-inverted mb-subheading group-hover:text-accent transition-colors">
                  Cost Estimator
                </h3>
                <p className="text-text-muted text-sm mb-heading">
                  Get instant pricing for your website project based on features and complexity
                </p>
              </div>

              <ul className="space-y-tight mb-content-block">
                <li className="flex items-center gap-tight text-sm text-text-secondary">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                  Transparent pricing breakdown
                </li>
                <li className="flex items-center gap-tight text-sm text-text-secondary">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                  Timeline estimates included
                </li>
                <li className="flex items-center gap-tight text-sm text-text-secondary">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                  Feature-based pricing
                </li>
              </ul>

              <div className="flex items-center text-accent font-semibold group-hover:gap-tight transition-all">
                <span>Get Estimate</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            {/* Performance Calculator */}
            <Link
              href="/performance-calculator"
              className="group relative glass-card-light card-padding-lg card-hover-glow border border-accent/20 hover:border-accent/40 transition-all duration-500 hover:transform hover:scale-105 transform-gpu"
            >
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-accent rounded-b-full"></div>

              <div className="mb-content-block">
                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mb-heading group-hover:bg-primary/20 transition-colors">
                  <Zap className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-text-inverted mb-subheading group-hover:text-accent transition-colors">
                  Performance Analyzer
                </h3>
                <p className="text-text-muted text-sm mb-heading">
                  Discover how much revenue slow performance is costing you every month
                </p>
              </div>

              <ul className="space-y-tight mb-content-block">
                <li className="flex items-center gap-tight text-sm text-text-secondary">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                  Real PageSpeed analysis
                </li>
                <li className="flex items-center gap-tight text-sm text-text-secondary">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                  Revenue impact calculation
                </li>
                <li className="flex items-center gap-tight text-sm text-text-secondary">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                  Core Web Vitals insights
                </li>
              </ul>

              <div className="flex items-center text-accent font-semibold group-hover:gap-tight transition-all">
                <span>Analyze Site</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/tools"
              className="inline-flex items-center gap-tight text-accent hover:text-info font-semibold transition-colors"
            >
              View All Tools
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-section-sm px-4">
        <div className="container-wide max-w-4xl mx-auto">
          <NewsletterSignup
            variant="inline"
            title="Join 500+ Tech Leaders"
            description="Get weekly insights on scaling engineering teams, technical leadership, and development efficiency. No spam, unsubscribe anytime."
          />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-section px-4 sm:px-6">
        <div className="container-wide text-center">
          <div className="glass-section p-12 md:p-20">
            <div className="w-20 h-20 rounded-2xl bg-primary/80/10 flex items-center justify-center mx-auto mb-comfortable">
              <Rocket className="w-10 h-10 text-accent" />
            </div>

            <h2 className="text-responsive-2xl font-black text-text-inverted mb-content-block max-w-4xl mx-auto text-balance">
              Your competitors ship faster.
              <span className="block text-accent mt-4">
                Why don&apos;t you?
              </span>
            </h2>

            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Every day you wait is revenue lost. Get a custom roadmap to 10x your technical velocity in our free 30-minute strategy call.
            </p>

            <div className="flex flex-col sm:flex-row gap-comfortable justify-center">
              <Button asChild variant="default" size="lg" trackConversion={true}>
      <Link href="/contact">
        Get Your Free Roadmap
        <ArrowRight className="w-4 h-4" />
      </Link>
    </Button>
              <Button asChild variant="outline" size="lg" trackConversion={true}>
      <Link href="/portfolio">
        See Proven Results First
        <ArrowRight className="w-4 h-4" />
      </Link>
    </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
