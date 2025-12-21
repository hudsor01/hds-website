/**
 * ROI Calculator Page
 * Shows potential revenue increase from improving website conversion rates
 */

  import { Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { CalculatorLayout } from '@/components/calculators/CalculatorLayout';
import { ROICalculatorClient } from './ROICalculatorClient';

function ROICalculatorLoading() {
  return (
    <div className="space-y-comfortable animate-pulse">
      <div className="grid gap-comfortable md:grid-cols-2">
        <div className="h-20 rounded bg-muted" />
        <div className="h-20 rounded bg-muted" />
        <div className="h-20 rounded bg-muted" />
        <div className="h-20 rounded bg-muted" />
      </div>
      <div className="h-16 rounded bg-muted" />
      <div className="h-12 rounded bg-muted" />
    </div>
  );
}

export default function ROICalculatorPage() {
  return (
    <CalculatorLayout
      title="Website ROI Calculator"
      description="Calculate how much additional revenue you could generate by improving your website's conversion rate"
      icon={
        <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      }
    >
      <Suspense fallback={<ROICalculatorLoading />}>
        <ROICalculatorClient />
      </Suspense>

      {/* Educational Content */}
      <div className="mt-heading space-y-content border-t pt-8 dark:border-border">
        <h2 className="text-lg font-semibold text-foreground dark:text-foreground">
          How We Help You Achieve These Results
        </h2>

        <div className="grid gap-content sm:grid-cols-2">
          <Card size="sm" dark:border-border>
            <h3 className="mb-subheading font-semibold text-foreground dark:text-foreground">
              Conversion Optimization
            </h3>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              A/B testing, UX improvements, and optimized user flows that increase conversions.
            </p>
          </Card>

          <Card size="sm" dark:border-border>
            <h3 className="mb-subheading font-semibold text-foreground dark:text-foreground">
              Performance Optimization
            </h3>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Faster load times mean better user experience and higher conversion rates.
            </p>
          </Card>

          <Card size="sm" dark:border-border>
            <h3 className="mb-subheading font-semibold text-foreground dark:text-foreground">
              Strategic Design
            </h3>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Data-driven design decisions that guide visitors toward conversion.
            </p>
          </Card>

          <Card size="sm" dark:border-border>
            <h3 className="mb-subheading font-semibold text-foreground dark:text-foreground">
              Analytics & Testing
            </h3>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Continuous monitoring and improvement based on real user data.
            </p>
          </Card>
        </div>
      </div>
    </CalculatorLayout>
  );
}
