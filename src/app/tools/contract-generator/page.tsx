/**
 * Contract Generator
 * Create professional contracts with PDF download
 */

import type { Metadata } from 'next';
import ContractGeneratorClient from './ContractGeneratorClient';

export const metadata: Metadata = {
  title: 'Contract Generator | Hudson Digital Solutions',
  description:
    'Create professional contracts with PDF download. Free contract generator with customizable clauses, terms, and legal templates.',
  openGraph: {
    title: 'Contract Generator',
    description:
      'Create professional contracts with PDF download.',
  },
};

export default function ContractGeneratorPage() {
  return <ContractGeneratorClient />;
}
