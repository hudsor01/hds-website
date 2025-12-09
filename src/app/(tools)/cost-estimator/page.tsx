/**
 * Website Cost Estimator Page
 * Helps prospects understand project costs based on requirements
 */

import { Suspense } from 'react';
import { CalculatorLayout } from '@/components/calculators/CalculatorLayout';
import { CostEstimatorClient } from './CostEstimatorClient';

function CostEstimatorLoading() {
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
      <div className="space-y-tight">
        <div className="h-5 w-36 rounded bg-muted" />
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted" />
          ))}
        </div>
      </div>
      <div className="h-10 w-full rounded bg-muted" />
    </div>
  );
}

export default function CostEstimatorPage() {
  return (
    <CalculatorLayout
      title="Website Cost Estimator"
      description="Get an instant estimate for your website project based on your specific requirements"
      icon={
        <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      }
    >
      <Suspense fallback={<CostEstimatorLoading />}>
        <CostEstimatorClient />
      </Suspense>

      {/* Disclaimer */}
      <div className="mt-heading rounded-lg bg-warning-light card-padding-sm dark:bg-warning-bg-dark/20">
        <div className="flex">
          <div className="shrink-0">
            <svg className="h-5 w-5 text-warning-text" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-warning-darker dark:text-warning-muted">
              This is an estimate only. Final pricing may vary based on specific requirements, complexity, and project scope. Contact us for a detailed quote.
            </p>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}
