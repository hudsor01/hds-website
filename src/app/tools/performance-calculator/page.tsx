/**
 * Performance Savings Calculator
 * Analyzes website performance and calculates revenue lost due to slow load times
 */

import type { Metadata } from 'next';
import PerformanceCalculatorClient from './PerformanceCalculatorClient';

export const metadata: Metadata = {
  title: 'Performance Savings Calculator | Hudson Digital Solutions',
  description:
    'Analyze how website load times affect your revenue. Calculate potential savings from performance optimization with our free calculator.',
  openGraph: {
    title: 'Performance Savings Calculator',
    description:
      'Calculate revenue lost due to slow website load times.',
  },
};

export default function PerformanceCalculatorPage() {
  return <PerformanceCalculatorClient />;
}
