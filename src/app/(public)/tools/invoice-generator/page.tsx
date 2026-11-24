/**
 * Invoice Generator
 * Create professional invoices with PDF download
 */

import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'
import InvoiceGeneratorClient from './InvoiceGeneratorClient'

export const metadata: Metadata = buildMetadata({
	title: 'Invoice Generator | Hudson Digital Solutions',
	description:
		'Create a professional invoice and download it as a PDF. Free invoice generator with line items, sales tax and due dates that follow your payment terms.',
	path: '/tools/invoice-generator',
	socialTitle: 'Invoice Generator',
	socialDescription: 'Create professional invoices with PDF download.'
})

export default function InvoiceGeneratorPage() {
	return <InvoiceGeneratorClient />
}
