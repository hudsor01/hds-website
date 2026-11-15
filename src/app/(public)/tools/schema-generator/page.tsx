/**
 * LocalBusiness Schema Generator
 * Generate schema.org LocalBusiness JSON-LD structured data for local SEO.
 */

import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'
import SchemaGeneratorClient from './SchemaGeneratorClient'

export const metadata: Metadata = buildMetadata({
	title: 'LocalBusiness Schema Generator (JSON-LD) | Hudson Digital',
	description:
		'Free LocalBusiness schema markup generator. Build valid schema.org JSON-LD structured data for local SEO and Google rich results, then paste it into your site.',
	path: '/tools/schema-generator'
})

export default function SchemaGeneratorPage() {
	return <SchemaGeneratorClient />
}
