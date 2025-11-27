import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Calculator,
  FileText,
  TrendingUp,
  Car,
  Gauge,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Free Business Tools | Hudson Digital Solutions',
  description: 'Free calculators and tools for business owners. ROI calculator, paystub generator, cost estimator, and more. No signup required.',
  keywords: 'business calculator, roi calculator, paystub generator, cost estimator, free business tools',
  openGraph: {
    title: 'Free Business Tools | Hudson Digital Solutions',
    description: 'Free calculators and tools for business owners. ROI calculator, paystub generator, cost estimator, and more.',
    type: 'website',
  },
};

const tools = [
  {
    name: 'Paystub Generator',
    description: 'Create professional paystubs for your employees in seconds. Calculate taxes, deductions, and net pay automatically.',
    href: '/paystub-generator',
    icon: FileText,
    featured: true,
    color: 'cyan',
  },
  {
    name: 'ROI Calculator',
    description: 'Calculate the return on investment for your projects. Make data-driven decisions about where to invest your resources.',
    href: '/roi-calculator',
    icon: TrendingUp,
    featured: true,
    color: 'green',
  },
  {
    name: 'Cost Estimator',
    description: 'Get accurate project cost estimates. Plan your budget effectively with our comprehensive cost breakdown tool.',
    href: '/cost-estimator',
    icon: Calculator,
    featured: true,
    color: 'purple',
  },
  {
    name: 'Performance Calculator',
    description: 'Measure and optimize your business performance metrics. Track KPIs and identify areas for improvement.',
    href: '/performance-calculator',
    icon: Gauge,
    featured: false,
    color: 'orange',
  },
  {
    name: 'Texas TTL Calculator',
    description: 'Calculate Texas vehicle tax, title, and license fees. Essential for car buyers and dealerships in Texas.',
    href: '/texas-ttl-calculator',
    icon: Car,
    featured: false,
    color: 'blue',
  },
];

const colorClasses = {
  cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 group-hover:bg-cyan-500/20',
  green: 'bg-green-500/10 text-green-400 border-green-500/30 group-hover:bg-green-500/20',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30 group-hover:bg-purple-500/20',
  orange: 'bg-orange-500/10 text-orange-400 border-orange-500/30 group-hover:bg-orange-500/20',
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30 group-hover:bg-blue-500/20',
};

export default function ToolsPage() {
  const featuredTools = tools.filter(t => t.featured);
  const otherTools = tools.filter(t => !t.featured);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative section-spacing page-padding-x">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-600-20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-gradient-decorative-purple rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 container-wide text-center">
          <div className="space-y-comfortable">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 text-cyan-400 font-semibold text-sm">
              <Sparkles className="w-4 h-4" />
              Free Business Tools
            </span>

            <h1 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tight">
              Tools to <span className="text-cyan-400">Grow</span> Your Business
            </h1>

            <p className="text-responsive-md text-muted-foreground container-narrow mx-auto">
              Free calculators and utilities to help you make smarter business decisions. No signup required.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Tools */}
      <section className="section-spacing page-padding-x">
        <div className="container-wide">
          <h2 className="text-3xl font-bold text-white mb-8">Popular Tools</h2>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {featuredTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group glass-card p-6 card-hover-glow transition-all duration-300"
                >
                  <div className={`inline-flex p-3 rounded-xl border ${colorClasses[tool.color as keyof typeof colorClasses]} transition-colors mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    {tool.name}
                  </h3>

                  <p className="text-muted-foreground mb-4">
                    {tool.description}
                  </p>

                  <span className="inline-flex items-center gap-2 text-cyan-400 font-medium">
                    Try it free
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Other Tools */}
          <h2 className="text-3xl font-bold text-white mb-8">More Tools</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {otherTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group glass-card p-6 card-hover-glow transition-all duration-300 flex items-start gap-4"
                >
                  <div className={`inline-flex p-3 rounded-xl border ${colorClasses[tool.color as keyof typeof colorClasses]} transition-colors flex-shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                      {tool.name}
                    </h3>

                    <p className="text-muted-foreground mb-3">
                      {tool.description}
                    </p>

                    <span className="inline-flex items-center gap-2 text-cyan-400 font-medium">
                      Use tool
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-spacing page-padding-x">
        <div className="container-wide">
          <div className="glass-section p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Need a Custom Tool?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              We build custom calculators, dashboards, and business tools tailored to your specific needs.
            </p>
            <Link
              href="/contact"
              className="button-base cta-primary px-8 py-4 text-lg font-bold"
            >
              Get a Custom Quote
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
