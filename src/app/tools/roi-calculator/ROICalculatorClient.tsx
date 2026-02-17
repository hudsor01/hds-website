/**
 * ROI Calculator Client Component
 * Contains the interactive ROI calculation form with URL state management
 */

'use client';

  import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useQueryState, parseAsFloat, parseAsInteger } from 'nuqs';
import { CalculatorInput } from '@/components/calculators/CalculatorInput';
import { CalculatorResults } from '@/components/calculators/CalculatorResults';
import { trackEvent } from '@/lib/analytics';
import { formatCurrency } from '@/lib/utils';

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

export function ROICalculatorClient() {
  const [monthlyTraffic, setMonthlyTraffic] = useQueryState('traffic', parseAsInteger.withDefault(0));
  const [conversionRate, setConversionRate] = useQueryState('conv', parseAsFloat.withDefault(0));
  const [averageOrderValue, setAverageOrderValue] = useQueryState('aov', parseAsFloat.withDefault(0));
  const [improvementPercentage, setImprovementPercentage] = useQueryState('impr', parseAsInteger.withDefault(20));

  const [results, setResults] = useState<CalculatorResultsType | null>(null);
  const [showResults, setShowResults] = useState(false);

  const inputs: CalculatorInputs = {
    monthlyTraffic,
    conversionRate,
    averageOrderValue,
    improvementPercentage
  };

  const handleInputChange = (field: keyof CalculatorInputs, value: string) => {
    const numValue = parseFloat(value) || 0;
    switch (field) {
      case 'monthlyTraffic':
        setMonthlyTraffic(numValue);
        break;
      case 'conversionRate':
        setConversionRate(numValue);
        break;
      case 'averageOrderValue':
        setAverageOrderValue(numValue);
        break;
      case 'improvementPercentage':
        setImprovementPercentage(numValue);
        break;
      default:
        break;
    }
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
      currentMonthlyRevenue: formatCurrency(currentMonthlyRevenue),
      currentAnnualRevenue: formatCurrency(currentAnnualRevenue),
      projectedMonthlyRevenue: formatCurrency(improvedMonthlyRevenue),
      projectedAnnualRevenue: formatCurrency(improvedAnnualRevenue),
      monthlyIncrease: formatCurrency(monthlyIncrease),
      annualIncrease: formatCurrency(annualIncrease),
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
      description: `With a ${improvementPercentage}% conversion improvement`,
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
    <>
      {!showResults ? (
        <form onSubmit={handleSubmit} className="space-y-comfortable">
          <div className="grid gap-comfortable md:grid-cols-2">
            <CalculatorInput
              label="Monthly Website Traffic"
              id="monthlyTraffic"
              type="number"
              min="0"
              step="1"
              value={monthlyTraffic || ''}
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
              value={conversionRate || ''}
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
              value={averageOrderValue || ''}
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
              value={improvementPercentage}
              onChange={(e) => handleInputChange('improvementPercentage', e.target.value)}
              suffix="%"
              helpText="Expected conversion rate improvement"
              required
            />
          </div>

          <Card size="sm" className="bg-info-light dark:bg-info-bg-dark/20">
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
          </Card>

          <button
            type="submit"
            className="w-full rounded-md bg-primary px-6 py-3 text-base font-semibold text-foreground shadow-xs hover:bg-primary/80 focus:outline-hidden focus:ring-2 focus:ring-primary"
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
            onClick={() => {
              setShowResults(false);
              setMonthlyTraffic(0);
              setConversionRate(0);
              setAverageOrderValue(0);
              setImprovementPercentage(20);
            }}
            className="mt-content-block w-full rounded-md border border-border bg-card px-6 py-3 text-base font-semibold text-muted-foreground shadow-xs hover:bg-muted dark:border-border dark:bg-muted dark:text-muted dark:hover:bg-muted-foreground"
          >
            Recalculate
          </button>
        </div>
      )}
    </>
  );
}
