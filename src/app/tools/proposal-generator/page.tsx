/**
 * Proposal Generator
 * Create professional project proposals with PDF download
 */

import type { Metadata } from 'next';
import ProposalGeneratorClient from './ProposalGeneratorClient';

export const metadata: Metadata = {
  title: 'Proposal Generator | Hudson Digital Solutions',
  description:
    'Create professional project proposals with PDF download. Free proposal generator with customizable templates for freelancers and agencies.',
  openGraph: {
    title: 'Proposal Generator',
    description:
      'Create professional project proposals with PDF download.',
  },
};

export default function ProposalGeneratorPage() {
  return <ProposalGeneratorClient />;
}
