/**
 * Texas TTL Calculator
 * Calculate vehicle tax, title, license fees and monthly payments
 */

import type { Metadata } from 'next';
import { Calculator } from '@/components/calculators/Calculator';

export const metadata: Metadata = {
  title: 'Texas TTL Calculator | Hudson Digital Solutions',
  description:
    'Calculate tax, title, license fees and monthly payments for vehicles in Texas. Free online calculator for car buyers and dealers.',
  openGraph: {
    title: 'Texas TTL Calculator',
    description:
      'Calculate tax, title, license fees and monthly payments for vehicles in Texas.',
  },
};

export default function TTLCalculatorPage() {
  return <Calculator />;
}
