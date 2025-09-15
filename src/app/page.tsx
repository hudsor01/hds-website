import {
  CodeBracketIcon,
  CogIcon,
  ChartBarIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { CTAButton } from '@/components/cta-button';

export default function HomePage() {
  const solutions = [
    {
      icon: CodeBracketIcon,
      title: "Ship Features Faster",
      description: "Launch new features in days, not months. We handle the entire technical stack.",
      features: ["React/Next.js Development", "API & Database Architecture", "99.9% Uptime Guaranteed"]
    },
    {
      icon: CogIcon,
      title: "Fix Revenue Leaks",
      description: "Stop losing 30% of leads to broken processes. Automate everything that slows you down.", 
      features: ["CRM Integration", "Lead Scoring Automation", "Real-time Analytics"]
    },
    {
      icon: ChartBarIcon,
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
      {/* Hero Section - Content-First Layout */}
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
                  <CTAButton href="/portfolio" variant="secondary" size="lg">
                    View Case Studies
                  </CTAButton>
                </div>

                {/* Trust Indicators */}
                <div className="flex-center gap-6 pt-8 border-t border-border">
                  <div className="flex-center gap-2 text-muted-foreground">
                    <ClockIcon className="w-5 h-5 text-green-400" />
                    <span className="small">Average 250% ROI</span>
                  </div>
                  <div className="flex-center gap-2 text-muted-foreground">
                    <UserGroupIcon className="w-5 h-5 text-blue-400" />
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
                <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-primary-30 rounded-full blur-2xl animate-pulse transform-gpu" />
                
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
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse transform-gpu" />
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
                    
                    <div className="text-cyan-400 animate-pulse transform-gpu mt-4">
                      <span className="inline-block">$</span>
                      <span className="inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse transform-gpu" />
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

      {/* Results Section */}
      <section className="py-20 px-4 bg-gradient-secondary">
        <div className="container-wide">
          <div className="text-center mb-16 typography">
            <h2 className="text-responsive-md font-black text-white mb-4">
              <span className="gradient-text">
                Proven Impact
              </span>
            </h2>
            <div className="typography">
              <p className="large muted">Numbers don&apos;t lie - our clients see real results</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {results.map((result, index) => (
              <div 
                key={index}
                className="text-center group hover-lift will-change-transform transition-smooth"
              >
                <div className="glass-card-light p-6 lg:p-8 card-hover-glow transition-smooth">
                  <div className="text-responsive-lg font-black text-white mb-3 group-hover:text-cyan-400 transition-smooth">
                    {result.metric}
                  </div>
                  <div className="text-base lg:text-lg font-semibold text-muted-foreground mb-2">
                    {result.label}
                  </div>
                  <div className="text-responsive-sm text-muted-foreground">
                    {result.period}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="container-wide text-center">
          <div className="glass-section p-12 md:p-16">
            <RocketLaunchIcon className="w-16 h-16 text-cyan-400 mx-auto mb-8" />
            
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