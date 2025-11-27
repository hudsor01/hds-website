import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Calculator,
  FileText,
  TrendingUp,
  Car,
  Gauge,
  ArrowRight,
  Sparkles,
  Code,
  Key,
  Home,
  Receipt,
  FileSignature,
  Briefcase,
  Star,
  Tags,
  Percent,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Free Business Tools | Hudson Digital Solutions',
  description: 'Free calculators and tools for business owners. Invoice generator, contract generator, ROI calculator, paystub generator, and more. No signup required.',
  keywords: 'business calculator, roi calculator, paystub generator, invoice generator, contract generator, free business tools',
  openGraph: {
    title: 'Free Business Tools | Hudson Digital Solutions',
    description: 'Free calculators and tools for business owners. Invoice generator, contract generator, ROI calculator, paystub generator, and more.',
    type: 'website',
  },
};

interface Tool {
  name: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'document' | 'financial' | 'developer' | 'business';
  isNew?: boolean;
}

const tools: Tool[] = [
  // Document Generators
  {
    name: 'Invoice Generator',
    description: 'Create professional invoices with automatic calculations. Download as PDF with your branding.',
    href: '/invoice-generator',
    icon: Receipt,
    category: 'document',
    isNew: true,
  },
  {
    name: 'Contract Generator',
    description: 'Generate service agreements, NDAs, and freelance contracts. Professional templates ready to use.',
    href: '/contract-generator',
    icon: FileSignature,
    category: 'document',
    isNew: true,
  },
  {
    name: 'Proposal Generator',
    description: 'Build professional project proposals with scope, timeline, and pricing. Perfect for client pitches.',
    href: '/proposal-generator',
    icon: Briefcase,
    category: 'document',
    isNew: true,
  },
  {
    name: 'Paystub Generator',
    description: 'Create professional paystubs for your employees in seconds. Calculate taxes, deductions, and net pay.',
    href: '/paystub-generator',
    icon: FileText,
    category: 'document',
  },
  // Financial Calculators
  {
    name: 'ROI Calculator',
    description: 'Calculate the return on investment for your projects. Make data-driven decisions about investments.',
    href: '/roi-calculator',
    icon: TrendingUp,
    category: 'financial',
  },
  {
    name: 'Mortgage Calculator',
    description: 'Estimate monthly mortgage payments. See principal, interest, and amortization schedules.',
    href: '/mortgage-calculator',
    icon: Home,
    category: 'financial',
    isNew: true,
  },
  {
    name: 'Tip Calculator',
    description: 'Calculate tips and split bills easily. Perfect for dining out or service payments.',
    href: '/tip-calculator',
    icon: Percent,
    category: 'financial',
    isNew: true,
  },
  {
    name: 'Cost Estimator',
    description: 'Get accurate project cost estimates. Plan your budget effectively with our cost breakdown tool.',
    href: '/cost-estimator',
    icon: Calculator,
    category: 'financial',
  },
  {
    name: 'Texas TTL Calculator',
    description: 'Calculate Texas vehicle tax, title, and license fees. Essential for car buyers in Texas.',
    href: '/texas-ttl-calculator',
    icon: Car,
    category: 'financial',
  },
  // Developer Tools
  {
    name: 'Meta Tag Generator',
    description: 'Generate SEO meta tags for your website. Includes Open Graph and Twitter Card tags.',
    href: '/meta-tag-generator',
    icon: Tags,
    category: 'developer',
    isNew: true,
  },
  {
    name: 'JSON Formatter',
    description: 'Format, validate, and beautify JSON data. Minify or expand JSON with syntax highlighting.',
    href: '/json-formatter',
    icon: Code,
    category: 'developer',
    isNew: true,
  },
  {
    name: 'Password Generator',
    description: 'Generate secure random passwords. Customize length and character types for your needs.',
    href: '/password-generator',
    icon: Key,
    category: 'developer',
    isNew: true,
  },
  // Business Tools
  {
    name: 'Performance Calculator',
    description: 'Measure and optimize your business performance metrics. Track KPIs and identify improvements.',
    href: '/performance-calculator',
    icon: Gauge,
    category: 'business',
  },
  {
    name: 'Testimonial Collector',
    description: 'Collect and manage customer testimonials. Generate private links for easy submission.',
    href: '/testimonial-collector',
    icon: Star,
    category: 'business',
    isNew: true,
  },
];

const categories = [
  { key: 'document', name: 'Document Generators', description: 'Create professional business documents' },
  { key: 'financial', name: 'Financial Calculators', description: 'Calculate costs, ROI, and payments' },
  { key: 'developer', name: 'Developer Tools', description: 'Utilities for web development' },
  { key: 'business', name: 'Business Tools', description: 'Grow and manage your business' },
] as const;

export default function ToolsPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-[var(--color-brand-primary)] text-[var(--color-text-inverted)] py-16 md:py-24">
        <div className="container-wide text-center">
          <Badge variant="secondary" className="mb-4 bg-[var(--color-text-inverted)]/10 text-[var(--color-text-inverted)] border-0">
            <Sparkles className="size-4 mr-1" />
            Free Business Tools
          </Badge>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Tools to Grow Your Business
          </h1>

          <p className="text-xl text-[var(--color-text-inverted)]/90 max-w-3xl mx-auto">
            Free calculators, generators, and utilities to help you make smarter business decisions. No signup required.
          </p>
        </div>
      </section>

      {/* Tools by Category */}
      {categories.map((category) => {
        const categoryTools = tools.filter((t) => t.category === category.key);
        if (categoryTools.length === 0) {return null;}

        return (
          <section key={category.key} className="py-12 md:py-16 border-b">
            <div className="container-wide">
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {category.name}
                </h2>
                <p className="text-muted-foreground">{category.description}</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link key={tool.href} href={tool.href} className="group">
                      <Card className="h-full hover:border-[var(--color-brand-primary)] hover:shadow-lg transition-all">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="size-12 rounded-lg bg-[var(--color-brand-primary)]/10 flex items-center justify-center text-[var(--color-brand-primary)]">
                              <Icon className="size-6" />
                            </div>
                            {tool.isNew && (
                              <Badge className="bg-[var(--color-brand-primary)] text-[var(--color-text-inverted)]">
                                New
                              </Badge>
                            )}
                          </div>

                          <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-[var(--color-brand-primary)] transition-colors">
                            {tool.name}
                          </h3>

                          <p className="text-sm text-muted-foreground mb-4">
                            {tool.description}
                          </p>

                          <span className="inline-flex items-center gap-2 text-[var(--color-brand-primary)] font-medium text-sm">
                            Use tool
                            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container-wide text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Need a Custom Tool?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            We build custom calculators, dashboards, and business tools tailored to your specific needs.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-brand-primary)] text-[var(--color-text-inverted)] rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Get a Custom Quote
            <ArrowRight className="size-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
