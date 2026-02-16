/**
 * Tip Calculator
 * Calculate tip amount and split bills among multiple people
 */

import type { Metadata } from 'next';
import TipCalculatorClient from './TipCalculatorClient';

export const metadata: Metadata = {
  title: 'Tip Calculator | Hudson Digital Solutions',
  description:
    'Calculate tip amounts and split bills among multiple people. Free tip calculator with customizable percentages and per-person breakdown.',
  openGraph: {
    title: 'Tip Calculator',
    description:
      'Calculate tip amounts and split bills among multiple people.',
  },
};

export default function TipCalculatorPage() {
  return <TipCalculatorClient />;
}
