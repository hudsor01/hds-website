/**
 * JSON Formatter
 * Format, validate and minify JSON data without changing it
 */

import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'
import JsonFormatterClient from './JsonFormatterClient'

export const metadata: Metadata = buildMetadata({
	title: 'JSON Formatter | Hudson Digital',
	description:
		'Format, validate and minify JSON online. Values stay exactly as written, with warnings for duplicate keys or rounded numbers and errors by line and column.',
	path: '/tools/json-formatter',
	socialTitle: 'JSON Formatter',
	socialDescription:
		'Format, validate and minify JSON online without changing your data.'
})

export default function JsonFormatterPage() {
	return <JsonFormatterClient />
}
