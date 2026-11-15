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
		'Create professional invoices with PDF download. Free invoice generator with customizable line items, tax calculations, and branding.',
	path: '/tools/invoice-generator',
	socialTitle: 'Invoice Generator',
	socialDescription: 'Create professional invoices with PDF download.'
})

export default function InvoiceGeneratorPage() {
	return <InvoiceGeneratorClient />
}
