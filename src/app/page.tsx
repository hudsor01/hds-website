import {
  Code,
  Settings,
  BarChart3,
  Rocket,
  Users,
  Clock
} from 'lucide-react';
import { CTAButton } from '@/components/cta-button';

export default function HomePage() {
  const solutions = [
    {
      icon: Code,
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
    <main className="min-h-screen bg-gradient-hero">
      {/* Hero Section - Seamless Layout */}
      <section className="relative py-20 lg:py-32">
        <div className="container-wide sm:px-6 lg:px-8 w-full">
          <div className="lg:grid lg:grid-cols-5 lg:gap-12 items-center">

            {/* Left Side - Content */}
            <div className="lg:col-span-3 lg:pr-8">
              <div className="space-y-8">
                <div>
                  <h1 className="text-responsive-lg font-black text-white leading-[1.1] mb-6 text-balance">
                    <span className="block">Stop Losing Revenue to</span>
                    <span className="block gradient-text bg-clip-text text-transparent">
                      Technical Bottlenecks
                    </span>
                    <span className="block text-responsive-md font-bold text-gray-300 mt-2">
                      Ship 3x Faster, 60% Cheaper
                    </span>
                  </h1>
                </div>

                <div className="typography">
                  <p className="lead max-w-2xl text-pretty">
                    We build and scale your technical operations in weeks, not months.
                    No hiring delays. No training costs. Just proven senior talent ready to execute.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <CTAButton href="/contact" variant="primary" size="lg">
                    See Your ROI in 30 Days
                  </CTAButton>
                  <CTAButton href="/portfolio" variant="primary" size="lg">
                    View Case Studies
                  </CTAButton>
                </div>

                {/* Trust Indicators */}
                <div className="flex-center gap-6 pt-8 border-t border-border">
                  <div className="flex-center gap-2 text-muted-foreground">
                    <Clock className="w-5 h-5 text-green-400" />
                    <span className="small">Average 250% ROI</span>
                  </div>
                  <div className="flex-center gap-2 text-muted-foreground">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span className="small">Zero onboarding time</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Terminal Display */}
            <div className="lg:col-span-2 mt-16 lg:mt-0">
              <div className="relative">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 bg-gradient-hero-20 rounded-3xl blur-3xl" />
                <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-primary-30 rounded-full blur-2xl" />

                {/* Terminal Window */}
                <div className="relative glass-card-light overflow-hidden">
                  {/* Terminal Header */}
                  <div className="bg-card/80 border-b border-border px-4 py-3 flex-between">
                    <div className="flex-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">hudson-deploy.sh</div>
                    <div className="w-3 h-3 bg-green-400 rounded-full" />
                  </div>

                  {/* Terminal Content */}
                  <div className="p-6 font-mono text-sm space-y-2" role="log">
                    <div className="text-cyan-400">$ npm run deploy --production</div>
                    <div className="text-muted-foreground">[OK] Build completed in 1.8s</div>
                    <div className="text-muted-foreground">[OK] Tests passed (147/147)</div>
                    <div className="text-muted-foreground">[OK] Security scan clean</div>
                    <div className="text-blue-400">&gt; Deploying to production...</div>
                    <div className="text-green-400">[OK] Deployment successful</div>
                    <div className="text-yellow-400">[LIVE] at https://client-app.com</div>

                    <div className="pt-2 space-y-1">
                      <div className="text-cyan-300">Performance: 100/100</div>
                      <div className="text-cyan-300">Accessibility: 100/100</div>
                      <div className="text-cyan-300">SEO: 98/100</div>
                    </div>

                    <div className="text-cyan-400 mt-4">
                      <span className="inline-block">$</span>
                      <span className="inline-block w-2 h-4 bg-cyan-400 ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-20 px-4">
        <div className="container-wide">
          <div className="text-center mb-16 typography">
            <h2 className="text-responsive-md font-black text-white mb-4">
              How We Solve Your Biggest Problems
            </h2>
            <div className="typography">
              <p className="large muted container-narrow">
                Three ways we help SaaS companies go from struggling to scaling
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {solutions.map((solution, index) => (
              <div 
                key={index}
                className="group relative glass-card-light p-8 card-hover-glow transition-smooth"
              >
                <div className="space-y-6">
                  <div className="flex-center space-x-4">
                    <div className="p-3 rounded-xl bg-gradient-hero-20 border border-cyan-500/30 hover-lift will-change-transform transition-smooth">
                      <solution.icon className="h-6 w-6 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-smooth">
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
                        <div className="w-2 h-2 rounded-full bg-gradient-secondary" />
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
      <section className="relative py-20 px-4 bg-gradient-secondary overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/5 via-transparent to-blue-600/5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />

        <div className="container-wide relative">
          <div className="text-center mb-20 typography">
            <h2 className="text-responsive-md font-black text-white mb-6">
              <span className="gradient-text relative">
                Proven Impact
                <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"></span>
              </span>
            </h2>

            <div className="typography max-w-2xl mx-auto">
              <p className="text-xl text-gray-300 leading-relaxed">
                Numbers don&apos;t lie - our clients see <span className="text-cyan-400 font-semibold">measurable results</span> that transform their businesses
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {results.map((result, index) => (
              <div
                key={index}
                className="text-center group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Card with enhanced styling */}
                <div className="relative glass-card-light p-8 lg:p-10 card-hover-glow border border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-500 group-hover:transform group-hover:scale-105">
                  {/* Top accent line */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-b-full"></div>

                  {/* Metric with enhanced styling */}
                  <div className="relative mb-4">
                    <div className="text-4xl lg:text-5xl font-black text-white mb-2 group-hover:text-cyan-400 transition-all duration-300 font-mono">
                      {result.metric}
                    </div>
                    <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                  </div>

                  {/* Label with enhanced typography */}
                  <div className="text-lg font-bold text-gray-200 mb-3 group-hover:text-white transition-colors duration-300">
                    {result.label}
                  </div>

                  {/* Period with accent styling */}
                  <div className="text-sm text-muted-foreground font-medium px-3 py-1 bg-gray-800/50 rounded-full border border-gray-700/50">
                    {result.period}
                  </div>

                  {/* Subtle glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-400/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </div>

                {/* Connecting dots for visual flow */}
                {index < results.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-5 transform -translate-y-1/2">
                    <div className="w-3 h-0.5 bg-gradient-to-r from-cyan-400/50 to-transparent"></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom accent section */}
          <div className="text-center mt-16 pt-8 border-t border-gray-700/30">
            <p className="text-gray-400 text-sm font-medium">
              Join <span className="text-cyan-400 font-semibold">50+ successful businesses</span> who transformed with Hudson Digital Solutions
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="container-wide text-center">
          <div className="glass-section p-12 md:p-16">
            <Rocket className="w-16 h-16 text-cyan-400 mx-auto mb-8" />
            
            <h2 className="text-responsive-md font-black text-white mb-6">
              Your competitors ship faster.
              <span className="block gradient-text mt-2">
                Why don&apos;t you?
              </span>
            </h2>
            
            <div className="typography">
              <p className="large text-muted-foreground mb-10 container-narrow">
                Every day you wait is revenue lost. Get a custom roadmap to 10x your technical velocity in our free 30-minute strategy call.
              </p>
            </div>
            
            <div className="flex-center flex-col sm:flex-row gap-4">
              <CTAButton href="/contact" variant="primary" size="lg">
                Get Your Free Roadmap
              </CTAButton>
              <CTAButton href="/portfolio" variant="secondary" size="lg">
                See Proven Results First
              </CTAButton>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}