/**
 * Mortgage Calculator
 * Calculate monthly mortgage payments with taxes, insurance, and PMI
 */

import type { Metadata } from 'next';
import { CalculatorLayout } from '@/components/calculators/CalculatorLayout';
import { MortgageCalculatorClient } from './MortgageCalculatorClient';
import { Home } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Mortgage Calculator | Hudson Digital Solutions',
  description:
    'Calculate your monthly mortgage payment including principal, interest, taxes, insurance, and PMI. Free mortgage calculator.',
  openGraph: {
    title: 'Mortgage Calculator',
    description:
      'Calculate monthly mortgage payments with taxes, insurance, and PMI.',
  },
};

export default function MortgageCalculatorPage() {
  return (
    <CalculatorLayout
      title="Mortgage Calculator"
      description="Calculate your monthly mortgage payment including principal, interest, property taxes, insurance, and PMI"
      icon={<Home className="h-8 w-8 text-primary" />}
    >
      <MortgageCalculatorClient />
    </CalculatorLayout>
  );
}
