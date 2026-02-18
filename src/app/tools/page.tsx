/**
 * Tools Landing Page
 * Showcases all free calculator tools
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Briefcase,
  Calculator,
  Car,
  Code2,
  DollarSign,
  FileSignature,
  FileText,
  Home,
  MessageSquare,
  Receipt,
  Tags,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { TOOL_ROUTES } from '@/lib/constants/routes';

export const metadata: Metadata = {
  title: 'Free Business Tools & Calculators | Hudson Digital Solutions',
  description: 'Free interactive tools for business owners and freelancers. Calculate ROI, generate invoices and contracts, format JSON, analyze performance, and more.',
  openGraph: {
    title: 'Free Business Tools & Calculators',
    description: 'Interactive tools to help you make data-driven decisions about your website.',
  },
};

const tools = [
  {
    title: 'ROI Calculator',
    description: 'Calculate how much additional revenue you could generate by improving your website conversion rate.',
    href: TOOL_ROUTES.ROI_CALCULATOR,
    icon: <TrendingUp className="h-8 w-8" />,
    benefits: ['See potential revenue increase', 'Understand conversion impact', 'Data-driven decision making'],
    cta: 'Calculate ROI',
  },
  {
    title: 'Website Cost Estimator',
    description: 'Get an instant estimate for your website project based on your specific requirements and features.',
    href: TOOL_ROUTES.COST_ESTIMATOR,
    icon: <Calculator className="h-8 w-8" />,
    benefits: ['Transparent pricing breakdown', 'Timeline estimates', 'Feature-based pricing'],
    cta: 'Estimate Cost',
  },
  {
    title: 'Performance Savings Calculator',
    description: 'Discover how much revenue you are losing due to slow website performance with real PageSpeed analysis.',
    href: TOOL_ROUTES.PERFORMANCE_CALCULATOR,
    icon: <Zap className="h-8 w-8" />,
    benefits: ['Real performance analysis', 'Revenue impact calculation', 'Core Web Vitals insights'],
    cta: 'Analyze Performance',
  },
  {
    title: 'Texas TTL Calculator',
    description: 'Calculate tax, title, and license fees plus monthly payment estimates for vehicle purchases in Texas.',
    href: TOOL_ROUTES.TTL_CALCULATOR,
    icon: <Car className="h-8 w-8" />,
    benefits: ['Tax, title, and license fees', 'Monthly payment estimates', 'Texas-specific calculations'],
    cta: 'Calculate Fees',
  },
  {
    title: 'Mortgage Calculator',
    description: 'Calculate your monthly mortgage payment including principal, interest, taxes, insurance, and PMI.',
    href: TOOL_ROUTES.MORTGAGE_CALCULATOR,
    icon: <Home className="h-8 w-8" />,
    benefits: ['Principal and interest breakdown', 'Includes taxes and insurance', 'PMI calculations'],
    cta: 'Calculate Payment',
  },
  {
    title: 'Tip Calculator',
    description: 'Calculate tip amounts and split the bill fairly among multiple people for any dining occasion.',
    href: TOOL_ROUTES.TIP_CALCULATOR,
    icon: <Receipt className="h-8 w-8" />,
    benefits: ['Split bills fairly', 'Custom tip percentages', 'Per-person amounts'],
    cta: 'Calculate Tip',
  },
  {
    title: 'Paystub Calculator',
    description: 'Generate detailed payroll breakdowns with federal and state tax calculations and net pay.',
    href: TOOL_ROUTES.PAYSTUB_CALCULATOR,
    icon: <DollarSign className="h-8 w-8" />,
    benefits: ['Federal and state tax withholding', 'Detailed deduction breakdown', 'Net pay calculation'],
    cta: 'Generate Paystub',
  },
  {
    title: 'Contract Generator',
    description: 'Create professional contracts ready for signature with customizable terms and PDF download.',
    href: TOOL_ROUTES.CONTRACT_GENERATOR,
    icon: <FileSignature className="h-8 w-8" />,
    benefits: ['Professional contract templates', 'Downloadable PDF output', 'Customizable terms'],
    cta: 'Generate Contract',
  },
  {
    title: 'Invoice Generator',
    description: 'Create professional invoices with line items, totals, and tax — ready to download as PDF.',
    href: TOOL_ROUTES.INVOICE_GENERATOR,
    icon: <FileText className="h-8 w-8" />,
    benefits: ['Professional invoice layout', 'Line item support', 'PDF download ready'],
    cta: 'Create Invoice',
  },
  {
    title: 'Proposal Generator',
    description: 'Create professional project proposals for clients with scope, timeline, and pricing — PDF included.',
    href: TOOL_ROUTES.PROPOSAL_GENERATOR,
    icon: <Briefcase className="h-8 w-8" />,
    benefits: ['Client-ready proposals', 'Project scope templates', 'PDF export included'],
    cta: 'Create Proposal',
  },
  {
    title: 'JSON Formatter',
    description: 'Format, validate, and minify JSON data online with syntax error detection and instant feedback.',
    href: TOOL_ROUTES.JSON_FORMATTER,
    icon: <Code2 className="h-8 w-8" />,
    benefits: ['Format and validate JSON', 'Minify for production', 'Syntax error detection'],
    cta: 'Format JSON',
  },
  {
    title: 'Meta Tag Generator',
    description: 'Generate SEO-optimized meta tags, Open Graph, and Twitter Card markup for your web pages.',
    href: TOOL_ROUTES.META_TAG_GENERATOR,
    icon: <Tags className="h-8 w-8" />,
    benefits: ['Open Graph markup', 'Twitter Card support', 'SEO meta tag preview'],
    cta: 'Generate Tags',
  },
  {
    title: 'Testimonial Collector',
    description: 'Generate private collection links to gather client testimonials and manage feedback in one place.',
    href: TOOL_ROUTES.TESTIMONIAL_COLLECTOR,
    icon: <MessageSquare className="h-8 w-8" />,
    benefits: ['Private collection links', 'Manage client feedback', 'Shareable testimonial forms'],
    cta: 'Collect Testimonials',
  },
];

export default function ToolsPage() {
  return (
    <main className="min-h-screen bg-primary/10 dark:from-background dark:to-card">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-section sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-heading text-4xl font-bold tracking-tight text-foreground dark:text-foreground sm:text-5xl">
            Free Business Tools
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground dark:text-muted">
            Make data-driven decisions about your website with our free interactive calculators.
            No credit card required, no signup needed.
          </p>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="px-4 py-section-sm sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-sections md:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <Card
                key={tool.href}
                className="group relative flex flex-col shadow-xs transition-all hover:shadow-lg dark:bg-muted"
              >
                {/* Icon */}
                <div className="mb-heading inline-flex h-16 w-16 items-center justify-center rounded-lg bg-accent/20 text-primary dark:bg-secondary dark:text-accent">
                  {tool.icon}
                </div>

                {/* Content */}
                <h3 className="mb-subheading text-xl font-semibold text-foreground dark:text-foreground">
                  {tool.title}
                </h3>

                <p className="mb-heading flex-1 text-sm text-muted-foreground dark:text-muted-foreground">
                  {tool.description}
                </p>

                {/* Benefits */}
                <ul className="mb-content-block space-y-tight">
                  {tool.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-tight text-sm text-muted-foreground dark:text-muted-foreground">
                      <svg className="mt-0.5 h-4 w-4 shrink-0 text-primary dark:text-accent" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {benefit}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={tool.href}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-foreground shadow-xs transition-colors hover:bg-primary/80 focus:outline-hidden focus:ring-2 focus:ring-primary"
                >
                  {tool.cta}
                  <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-section-sm sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Card size="lg" className="bg-primary/10 text-center shadow-xl sm:p-12">
            <h2 className="mb-heading text-3xl font-bold text-foreground">
              Ready to Take Action?
            </h2>
              <p className="mb-comfortable text-lg text-accent/30">
              These calculators show the potential. Let&apos;s make it reality. Schedule a free consultation to discuss your project.
            </p>
            <div className="flex flex-col gap-content sm:flex-row sm:justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-md bg-card px-6 py-3 text-base font-semibold text-primary shadow-xs hover:bg-muted"
              >
                Schedule Consultation
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center rounded-md border-2 border-white px-6 py-3 text-base font-semibold text-foreground hover:bg-card/10"
              >
                View Services
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="border-t border-border px-4 py-12 dark:border-border">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-sections sm:grid-cols-3">
            <div className="text-center">
              <div className="mb-subheading text-3xl font-bold text-primary dark:text-accent">
                Growing
              </div>
              <div className="text-sm text-muted-foreground dark:text-muted-foreground">
                Calculations Performed
              </div>
            </div>

            <div className="text-center">
              <div className="mb-subheading text-3xl font-bold text-primary dark:text-accent">
                98%
              </div>
              <div className="text-sm text-muted-foreground dark:text-muted-foreground">
                Accuracy Rate
              </div>
            </div>

            <div className="text-center">
              <div className="mb-subheading text-3xl font-bold text-primary dark:text-accent">
                100%
              </div>
              <div className="text-sm text-muted-foreground dark:text-muted-foreground">
                Free Forever
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
