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
    <div className="min-h-screen bg-primary/10 dark:from-background dark:to-card">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-comfortable text-center">
          {icon && (
            <div className="mx-auto mb-heading flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 dark:bg-primary-hover">
              {icon}
            </div>
          )}

          <h1 className="mb-3 text-4xl font-bold tracking-tight text-foreground dark:text-foreground">
            {title}
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-muted-foreground dark:text-muted">
            {description}
          </p>
        </div>

        {/* Calculator Content */}
        <div className="rounded-lg bg-card card-padding shadow-xl dark:bg-muted sm:card-padding-lg">
          {children}
        </div>

        {/* Back Link */}
        {showBackLink && (
          <div className="mt-heading text-center">
            <Link
              href="/services"
              className="text-sm text-primary hover:text-primary-hover dark:text-accent dark:hover:text-accent/80"
            >
              ← Back to Services
            </Link>
          </div>
        )}

        {/* Trust Signals */}
        <div className="mt-12 border-t border-border pt-8 dark:border-border">
          <div className="grid gap-comfortable sm:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary dark:text-accent">
                500+
              </div>
              <div className="text-sm text-muted-foreground dark:text-muted-foreground">
                Calculations Performed
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-primary dark:text-accent">
                98%
              </div>
              <div className="text-sm text-muted-foreground dark:text-muted-foreground">
                Accuracy Rate
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-primary dark:text-accent">
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
