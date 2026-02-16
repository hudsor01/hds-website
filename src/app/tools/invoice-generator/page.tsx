/**
 * Invoice Generator
 * Create professional invoices with PDF download
 */

import type { Metadata } from 'next';
import InvoiceGeneratorClient from './InvoiceGeneratorClient';

export const metadata: Metadata = {
  title: 'Invoice Generator | Hudson Digital Solutions',
  description:
    'Create professional invoices with PDF download. Free invoice generator with customizable line items, tax calculations, and branding.',
  openGraph: {
    title: 'Invoice Generator',
    description:
      'Create professional invoices with PDF download.',
  },
};

export default function InvoiceGeneratorPage() {
  return <InvoiceGeneratorClient />;
}
