/**
 * ROI Calculator
 * Calculate potential revenue increase from website optimization
 */

import type { Metadata } from 'next';
import { CalculatorLayout } from '@/components/calculators/CalculatorLayout';
import { ROICalculatorClient } from './ROICalculatorClient';
import { TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'ROI Calculator | Hudson Digital Solutions',
  description:
    'Calculate how much additional revenue you could generate by improving your website conversion rate. Free ROI calculator for businesses.',
  openGraph: {
    title: 'ROI Calculator',
    description:
      'Calculate potential revenue increase from website optimization.',
  },
};

export default function ROICalculatorPage() {
  return (
    <CalculatorLayout
      title="ROI Calculator"
      description="Calculate how much additional revenue you could generate by improving your website's conversion rate"
      icon={<TrendingUp className="h-8 w-8 text-primary" />}
    >
      <ROICalculatorClient />
    </CalculatorLayout>
  );
}
