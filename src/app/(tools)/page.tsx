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
    <main className="min-h-screen bg-cyan-600/10 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground dark:text-white sm:text-5xl">
            Free Business Tools
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground dark:text-muted">
            Make data-driven decisions about your website with our free interactive calculators.
            No credit card required, no signup needed.
          </p>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <div
                key={tool.href}
                className="group relative flex flex-col rounded-lg border border-border bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:border-border dark:bg-muted"
              >
                {/* Icon */}
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600 dark:bg-cyan-900 dark:text-cyan-400">
                  {tool.icon}
                </div>

                {/* Content */}
                <h3 className="mb-2 text-xl font-semibold text-foreground dark:text-white">
                  {tool.title}
                </h3>

                <p className="mb-4 flex-1 text-sm text-muted-foreground dark:text-muted-foreground">
                  {tool.description}
                </p>

                {/* Benefits */}
                <ul className="mb-6 space-y-2">
                  {tool.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground dark:text-muted-foreground">
                      <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-600 dark:text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {benefit}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={tool.href}
                  className="inline-flex items-center justify-center rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-cyan-600/10 p-8 text-center shadow-xl sm:p-12">
            <h2 className="mb-4 text-3xl font-bold text-white">
              Ready to Take Action?
            </h2>
              <p className="mb-8 text-lg text-cyan-100">
              These calculators show the potential. Let&apos;s make it reality. Schedule a free consultation to discuss your project.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-md bg-white px-6 py-3 text-base font-semibold text-cyan-600 shadow-sm hover:bg-muted"
              >
                Schedule Consultation
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center rounded-md border-2 border-white px-6 py-3 text-base font-semibold text-white hover:bg-white/10"
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
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                500+
              </div>
              <div className="text-sm text-muted-foreground dark:text-muted-foreground">
                Calculations Performed
              </div>
            </div>

            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                98%
              </div>
              <div className="text-sm text-muted-foreground dark:text-muted-foreground">
                Accuracy Rate
              </div>
            </div>

            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-cyan-600 dark:text-cyan-400">
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
