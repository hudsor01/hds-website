/**
 * JSON Formatter
 * Format, validate, and minify JSON data
 */

import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'
import JsonFormatterClient from './JsonFormatterClient'

export const metadata: Metadata = buildMetadata({
	title: 'JSON Formatter | Hudson Digital Solutions',
	description:
		'Format, validate, and minify JSON data online. Free JSON formatter with syntax highlighting, instant error detection, and one-click copy for cleaner data.',
	path: '/tools/json-formatter',
	socialTitle: 'JSON Formatter',
	socialDescription: 'Format, validate, and minify JSON data online.'
})

export default function JsonFormatterPage() {
	return <JsonFormatterClient />
}
