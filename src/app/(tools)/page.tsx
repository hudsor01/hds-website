/**
 * Tools Landing Page
 * Showcases all free calculator tools
 */

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Free Business Tools & Calculators | Hudson Digital Solutions',
  description: 'Free interactive calculators to help you understand your website&apos;s potential. Calculate ROI, estimate project costs, and analyze performance.',
  openGraph: {
    title: 'Free Business Tools & Calculators',
    description: 'Interactive tools to help you make data-driven decisions about your website.',
  },
};

const tools = [
  {
    title: 'ROI Calculator',
    description: 'Calculate how much additional revenue you could generate by improving your website&amp;apos;s conversion rate.',
    href: '/roi-calculator',
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    benefits: [
      'See potential revenue increase',
      'Understand conversion impact',
      'Data-driven decision making',
    ],
    cta: 'Calculate ROI',
  },
  {
    title: 'Website Cost Estimator',
    description: 'Get an instant estimate for your website project based on your specific requirements and features.',
    href: '/cost-estimator',
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    benefits: [
      'Transparent pricing breakdown',
      'Timeline estimates',
      'Feature-based pricing',
    ],
    cta: 'Estimate Cost',
  },
  {
    title: 'Performance Savings Calculator',
    description: 'Discover how much revenue you&apos;re losing due to slow website performance with real PageSpeed analysis.',
    href: '/performance-calculator',
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    benefits: [
      'Real performance analysis',
      'Revenue impact calculation',
      'Core Web Vitals insights',
    ],
    cta: 'Analyze Performance',
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
              <div
                key={tool.href}
                className="group relative flex flex-col rounded-lg border border-border bg-card card-padding shadow-xs transition-all hover:shadow-lg dark:border-border dark:bg-muted"
              >
                {/* Icon */}
                <div className="mb-heading inline-flex h-16 w-16 items-center justify-center rounded-lg bg-accent/20 text-primary dark:bg-primary-hover dark:text-accent">
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
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-foreground shadow-xs transition-colors hover:bg-primary-hover focus:outline-hidden focus:ring-2 focus:ring-primary"
                >
                  {tool.cta}
                  <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-section-sm sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-primary/10 card-padding-lg text-center shadow-xl sm:p-12">
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
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="border-t border-border px-4 py-12 dark:border-border">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-sections sm:grid-cols-3">
            <div className="text-center">
              <div className="mb-subheading text-3xl font-bold text-primary dark:text-accent">
                500+
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
