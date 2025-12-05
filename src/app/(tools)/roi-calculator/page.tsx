/**
 * ROI Calculator
 * Shows potential revenue increase from improving website conversion rates
 */

'use client';

import { useState } from 'react';
import { CalculatorLayout } from '@/components/calculators/CalculatorLayout';
import { CalculatorInput } from '@/components/calculators/CalculatorInput';
import { CalculatorResults } from '@/components/calculators/CalculatorResults';
import { trackEvent } from '@/lib/analytics';

interface CalculatorInputs {
  monthlyTraffic: number;
  conversionRate: number;
  averageOrderValue: number;
  improvementPercentage: number;
}

interface CalculatorResultsType {
  currentMonthlyRevenue: string;
  currentAnnualRevenue: string;
  projectedMonthlyRevenue: string;
  projectedAnnualRevenue: string;
  monthlyIncrease: string;
  annualIncrease: string;
  roiPercentage: string;
}

export default function ROICalculatorPage() {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    monthlyTraffic: 0,
    conversionRate: 0,
    averageOrderValue: 0,
    improvementPercentage: 20,
  });

  const [results, setResults] = useState<CalculatorResultsType | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleInputChange = (field: keyof CalculatorInputs, value: string) => {
    const numValue = parseFloat(value) || 0;
    setInputs(prev => ({ ...prev, [field]: numValue }));
  };

  const calculateROI = () => {
    const { monthlyTraffic, conversionRate, averageOrderValue, improvementPercentage } = inputs;

    // Current metrics
    const currentConversionRate = conversionRate / 100;
    const currentMonthlyConversions = monthlyTraffic * currentConversionRate;
    const currentMonthlyRevenue = currentMonthlyConversions * averageOrderValue;
    const currentAnnualRevenue = currentMonthlyRevenue * 12;

    // Improved metrics
    const improvedConversionRate = currentConversionRate * (1 + improvementPercentage / 100);
    const improvedMonthlyConversions = monthlyTraffic * improvedConversionRate;
    const improvedMonthlyRevenue = improvedMonthlyConversions * averageOrderValue;
    const improvedAnnualRevenue = improvedMonthlyRevenue * 12;

    // Calculate increases
    const monthlyIncrease = improvedMonthlyRevenue - currentMonthlyRevenue;
    const annualIncrease = improvedAnnualRevenue - currentAnnualRevenue;
    const roiPercentage = ((monthlyIncrease / currentMonthlyRevenue) * 100) || 0;

    const calculatedResults: CalculatorResultsType = {
      currentMonthlyRevenue: `$${currentMonthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      currentAnnualRevenue: `$${currentAnnualRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      projectedMonthlyRevenue: `$${improvedMonthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      projectedAnnualRevenue: `$${improvedAnnualRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      monthlyIncrease: `$${monthlyIncrease.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      annualIncrease: `$${annualIncrease.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      roiPercentage: `${roiPercentage.toFixed(1)}%`,
    };

    setResults(calculatedResults);
    setShowResults(true);

    // Track calculator usage
    trackEvent('calculator_used', {
      calculator_type: 'roi-calculator',
      monthly_traffic: monthlyTraffic,
      conversion_rate: conversionRate,
      potential_increase: annualIncrease,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateROI();
  };

  const resultItems = results ? [
    {
      label: 'Current Annual Revenue',
      value: results.currentAnnualRevenue,
      description: 'Based on your current conversion rate',
    },
    {
      label: 'Projected Annual Revenue',
      value: results.projectedAnnualRevenue,
      description: `With a ${inputs.improvementPercentage}% conversion improvement`,
      highlight: true,
    },
    {
      label: 'Additional Monthly Revenue',
      value: results.monthlyIncrease,
      description: 'Extra revenue per month',
      highlight: true,
    },
    {
      label: 'Additional Annual Revenue',
      value: results.annualIncrease,
      description: 'Total additional revenue per year',
      highlight: true,
    },
    {
      label: 'ROI Percentage',
      value: results.roiPercentage,
      description: 'Revenue increase percentage',
    },
  ] : [];

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
      {!showResults ? (
        <form onSubmit={handleSubmit} className="space-y-comfortable">
          <div className="grid gap-comfortable md:grid-cols-2">
            <CalculatorInput
              label="Monthly Website Traffic"
              id="monthlyTraffic"
              type="number"
              min="0"
              step="1"
              value={inputs.monthlyTraffic || ''}
              onChange={(e) => handleInputChange('monthlyTraffic', e.target.value)}
              helpText="Average number of visitors per month"
              required
            />

            <CalculatorInput
              label="Current Conversion Rate"
              id="conversionRate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={inputs.conversionRate || ''}
              onChange={(e) => handleInputChange('conversionRate', e.target.value)}
              suffix="%"
              helpText="Percentage of visitors who convert"
              required
            />

            <CalculatorInput
              label="Average Order Value"
              id="averageOrderValue"
              type="number"
              min="0"
              step="0.01"
              value={inputs.averageOrderValue || ''}
              onChange={(e) => handleInputChange('averageOrderValue', e.target.value)}
              prefix="$"
              helpText="Average value per conversion/sale"
              required
            />

            <CalculatorInput
              label="Target Improvement"
              id="improvementPercentage"
              type="number"
              min="1"
              max="500"
              step="1"
              value={inputs.improvementPercentage}
              onChange={(e) => handleInputChange('improvementPercentage', e.target.value)}
              suffix="%"
              helpText="Expected conversion rate improvement"
              required
            />
          </div>

          <div className="rounded-lg bg-info-light card-padding-sm dark:bg-info-bg-dark/20">
            <div className="flex">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-info-text" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-info-darker dark:text-info-muted">
                  <strong>Industry Average:</strong> Most businesses see 15-50% conversion rate improvements with professional website optimization.
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-xs hover:bg-primary-hover focus:outline-hidden focus:ring-2 focus:ring-primary"
          >
            Calculate My ROI
          </button>
        </form>
      ) : (
        <div>
          <CalculatorResults
            results={resultItems}
            calculatorType="roi-calculator"
            inputs={inputs}
          />

          <button
            onClick={() => setShowResults(false)}
            className="mt-content-block w-full rounded-md border border-border bg-card px-6 py-3 text-base font-semibold text-muted-foreground shadow-xs hover:bg-muted dark:border-border dark:bg-muted dark:text-muted dark:hover:bg-muted-foreground"
          >
            ← Recalculate
          </button>
        </div>
      )}

      {/* Educational Content */}
      <div className="mt-heading space-y-content border-t pt-8 dark:border-border">
        <h2 className="text-lg font-semibold text-foreground dark:text-primary-foreground">
          How We Help You Achieve These Results
        </h2>

        <div className="grid gap-content sm:grid-cols-2">
          <div className="rounded-lg border border-border card-padding-sm dark:border-border">
            <h3 className="mb-subheading font-semibold text-foreground dark:text-primary-foreground">
              Conversion Optimization
            </h3>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              A/B testing, UX improvements, and optimized user flows that increase conversions.
            </p>
          </div>

          <div className="rounded-lg border border-border card-padding-sm dark:border-border">
            <h3 className="mb-subheading font-semibold text-foreground dark:text-primary-foreground">
              Performance Optimization
            </h3>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Faster load times mean better user experience and higher conversion rates.
            </p>
          </div>

          <div className="rounded-lg border border-border card-padding-sm dark:border-border">
            <h3 className="mb-subheading font-semibold text-foreground dark:text-primary-foreground">
              Strategic Design
            </h3>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Data-driven design decisions that guide visitors toward conversion.
            </p>
          </div>

          <div className="rounded-lg border border-border card-padding-sm dark:border-border">
            <h3 className="mb-subheading font-semibold text-foreground dark:text-primary-foreground">
              Analytics & Testing
            </h3>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Continuous monitoring and improvement based on real user data.
            </p>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}
