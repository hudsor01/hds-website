/**
 * Calculator Layout Component
 * Provides consistent layout and structure for all calculator tools
 */

'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';

interface CalculatorLayoutProps {
  title: string;
  description: string;
  icon?: ReactNode;
  children: ReactNode;
  showBackLink?: boolean;
}

export function CalculatorLayout({
  title,
  description,
  icon,
  children,
  showBackLink = true,
}: CalculatorLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          {icon && (
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900">
              {icon}
            </div>
          )}

          <h1 className="mb-3 text-4xl font-bold tracking-tight text-foreground dark:text-white">
            {title}
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-muted-foreground dark:text-muted">
            {description}
          </p>
        </div>

        {/* Calculator Content */}
        <div className="rounded-lg bg-white p-6 shadow-xl dark:bg-muted sm:p-8">
          {children}
        </div>

        {/* Back Link */}
        {showBackLink && (
          <div className="mt-8 text-center">
            <Link
              href="/services"
              className="text-sm text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
            >
              ← Back to Services
            </Link>
          </div>
        )}

        {/* Trust Signals */}
        <div className="mt-12 border-t border-border pt-8 dark:border-border">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                500+
              </div>
              <div className="text-sm text-muted-foreground dark:text-muted-foreground">
                Calculations Performed
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                98%
              </div>
              <div className="text-sm text-muted-foreground dark:text-muted-foreground">
                Accuracy Rate
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                Free
              </div>
              <div className="text-sm text-muted-foreground dark:text-muted-foreground">
                No Credit Card Required
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
