/**
 * Mortgage Calculator Page
 * Calculate monthly mortgage payments and total costs
 */

  import { Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { CalculatorLayout } from '@/components/calculators/CalculatorLayout';
import { MortgageCalculatorClient } from './MortgageCalculatorClient';
import { Home } from 'lucide-react';

function MortgageCalculatorLoading() {
  return (
    <div className="space-y-comfortable animate-pulse">
      <div className="space-y-tight">
        <div className="h-5 w-24 rounded bg-muted" />
        <div className="h-10 w-full rounded bg-muted" />
      </div>
      <div className="space-y-tight">
        <div className="h-5 w-32 rounded bg-muted" />
        <div className="h-10 w-full rounded bg-muted" />
      </div>
      <div className="grid gap-content md:grid-cols-2">
        <div className="h-20 rounded bg-muted" />
        <div className="h-20 rounded bg-muted" />
      </div>
      <div className="h-10 w-full rounded bg-muted" />
    </div>
  );
}

export default function MortgageCalculatorPage() {
  return (
    <CalculatorLayout
      title="Mortgage Calculator"
      description="Calculate your monthly mortgage payment, including principal, interest, taxes, and insurance"
      icon={<Home className="h-8 w-8 text-primary" />}
    >
      <Suspense fallback={<MortgageCalculatorLoading />}>
        <MortgageCalculatorClient />
      </Suspense>

      {/* Educational Content */}
      <div className="mt-heading space-y-content border-t pt-8 dark:border-border">
        <h2 className="text-lg font-semibold text-foreground dark:text-foreground">
          Understanding Your Mortgage
        </h2>

        <div className="grid gap-content sm:grid-cols-2">
          <Card size="sm">
            <h3 className="mb-subheading font-semibold text-foreground dark:text-foreground">
              Principal vs Interest
            </h3>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Early payments go mostly toward interest. As you pay down the loan, more goes to principal.
            </p>
          </Card>

          <Card size="sm">
            <h3 className="mb-subheading font-semibold text-foreground dark:text-foreground">
              20% Down Payment
            </h3>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Putting 20% down typically eliminates PMI and gets you better interest rates.
            </p>
          </Card>

          <Card size="sm">
            <h3 className="mb-subheading font-semibold text-foreground dark:text-foreground">
              15 vs 30 Year
            </h3>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              15-year loans have higher payments but save significantly on total interest paid.
            </p>
          </Card>

          <Card size="sm">
            <h3 className="mb-subheading font-semibold text-foreground dark:text-foreground">
              Total Cost of Ownership
            </h3>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Don't forget taxes, insurance, maintenance, and HOA fees in your budget.
            </p>
          </Card>
        </div>
      </div>
    </CalculatorLayout>
  );
}
