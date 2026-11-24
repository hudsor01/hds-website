/**
 * LocalBusiness Schema Generator
 * Generate schema.org LocalBusiness JSON-LD structured data.
 */

import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'
import SchemaGeneratorClient from './SchemaGeneratorClient'

export const metadata: Metadata = buildMetadata({
	title: 'LocalBusiness Schema Generator (JSON-LD) | Hudson Digital',
	description:
		"Free LocalBusiness schema generator. Build schema.org JSON-LD that follows Google's LocalBusiness structured data guidelines, then paste it into your site.",
	path: '/tools/schema-generator'
})

export default function SchemaGeneratorPage() {
	return <SchemaGeneratorClient />
}
