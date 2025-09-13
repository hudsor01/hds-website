import Link from 'next/link';
import { 
  ArrowRightIcon, 
  CodeBracketIcon, 
  CogIcon, 
  ChartBarIcon, 
  RocketLaunchIcon,
  UserGroupIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

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
    <main className="min-h-screen bg-linear-to-b from-slate-950 via-gray-900 to-slate-950">
      {/* Hero Section - Split Layout */}
      <section className="relative min-h-screen flex items-center py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            
            {/* Left Side - Content */}
            <div className="lg:pr-8">
              <div className="space-y-8">
                <div>
                  <h1 className="text-4xl md:text-6xl xl:text-7xl font-black text-white leading-[1.1] mb-6">
                    <span className="block">Stop Losing Revenue to</span>
                    <span className="block bg-linear-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                      Technical Bottlenecks
                    </span>
                    <span className="block text-3xl md:text-4xl xl:text-5xl font-bold text-gray-300 mt-2">
                      Ship 3x Faster, 60% Cheaper
                    </span>
                  </h1>
                </div>

                <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">
                  We build and scale your technical operations in weeks, not months. 
                  No hiring delays. No training costs. Just proven senior talent ready to execute.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/contact">
                    <button className="group relative inline-flex items-center gap-3 px-8 py-4 bg-linear-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg overflow-hidden hover:shadow-xl hover:shadow-cyan-500/30 transition-all duration-300">
                      <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      <span className="relative">See Your ROI in 30 Days</span>
                      <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                  
                  <Link href="/portfolio">
                    <button className="group inline-flex items-center gap-3 px-8 py-4 border-2 border-gray-600 text-white font-semibold rounded-lg hover:border-cyan-400 hover:bg-cyan-400/5 transition-all duration-300">
                      View Case Studies
                      <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>

                {/* Trust Indicators */}
                <div className="flex items-center gap-6 pt-8 border-t border-gray-800">
                  <div className="flex items-center gap-2 text-gray-400">
                    <ClockIcon className="w-5 h-5 text-green-400" />
                    <span className="text-sm">Average 250% ROI</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <UserGroupIcon className="w-5 h-5 text-blue-400" />
                    <span className="text-sm">Zero onboarding time</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Terminal Display */}
            <div className="mt-16 lg:mt-0">
              <div className="relative">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 bg-linear-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl blur-3xl" />
                <div className="absolute top-4 right-4 w-32 h-32 bg-linear-to-br from-blue-500/30 to-cyan-500/30 rounded-full blur-2xl animate-pulse" />
                
                {/* Terminal Window */}
                <div className="relative bg-linear-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden">
                  {/* Terminal Header */}
                  <div className="bg-gray-900/80 border-b border-gray-700/50 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="text-xs text-gray-500 font-mono">hudson-deploy.sh</div>
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  </div>
                  
                  {/* Terminal Content */}
                  <div className="p-6 font-mono text-sm space-y-2" role="log">
                    <div className="text-cyan-400">$ npm run deploy --production</div>
                    <div className="text-gray-300">[OK] Build completed in 1.8s</div>
                    <div className="text-gray-300">[OK] Tests passed (147/147)</div>
                    <div className="text-gray-300">[OK] Security scan clean</div>
                    <div className="text-blue-400">&gt; Deploying to production...</div>
                    <div className="text-green-400">[OK] Deployment successful</div>
                    <div className="text-yellow-400">[LIVE] at https://client-app.com</div>
                    
                    <div className="pt-2 space-y-1">
                      <div className="text-cyan-300">Performance: 100/100</div>
                      <div className="text-cyan-300">Accessibility: 100/100</div>
                      <div className="text-cyan-300">SEO: 98/100</div>
                    </div>
                    
                    <div className="text-cyan-400 animate-pulse mt-4">
                      <span className="inline-block">$</span>
                      <span className="inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse" />
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
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              How We Solve Your Biggest Problems
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Three ways we help SaaS companies go from struggling to scaling
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {solutions.map((solution, index) => (
              <div 
                key={index}
                className="group relative bg-linear-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-500"
              >
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-xl bg-linear-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 group-hover:scale-110 transition-transform duration-300">
                      <solution.icon className="h-6 w-6 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {solution.title}
                    </h3>
                  </div>
                  
                  <p className="text-gray-400 leading-relaxed">
                    {solution.description}
                  </p>
                  
                  <div className="space-y-3">
                    {solution.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-linear-to-r from-cyan-400 to-blue-500" />
                        <span className="text-sm text-gray-300">{feature}</span>
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
      <section className="py-20 px-4 bg-linear-to-r from-gray-900/50 to-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              <span className="bg-linear-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Proven Impact
              </span>
            </h2>
            <p className="text-xl text-gray-400">Numbers don&apos;t lie - our clients see real results</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {results.map((result, index) => (
              <div 
                key={index}
                className="text-center group hover:scale-105 transition-transform duration-300"
              >
                <div className="bg-linear-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 group-hover:border-cyan-400/50 transition-all duration-300">
                  <div className="text-4xl md:text-5xl font-black text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    {result.metric}
                  </div>
                  <div className="text-lg font-semibold text-gray-300 mb-1">
                    {result.label}
                  </div>
                  <div className="text-sm text-gray-500">
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
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-linear-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-12 md:p-16">
            <RocketLaunchIcon className="w-16 h-16 text-cyan-400 mx-auto mb-8" />
            
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
              Your competitors ship faster.
              <span className="block bg-linear-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent mt-2">
                Why don&apos;t you?
              </span>
            </h2>
            
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Every day you wait is revenue lost. Get a custom roadmap to 10x your technical velocity in our free 30-minute strategy call.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <button className="group relative inline-flex items-center gap-3 px-10 py-5 bg-linear-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold text-lg rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300">
                  <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative">Get Your Free Roadmap</span>
                  <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              
              <Link href="/portfolio">
                <button className="group inline-flex items-center gap-3 px-10 py-5 border-2 border-gray-600 text-white font-semibold text-lg rounded-xl hover:border-cyan-400 hover:bg-cyan-400/5 transition-all duration-300">
                  See Proven Results First
                  <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}