/**
 * JSON Formatter
 * Format, validate, and minify JSON data
 */

import type { Metadata } from 'next'
import JsonFormatterClient from './JsonFormatterClient'

export const metadata: Metadata = {
	alternates: { canonical: '/tools/json-formatter' },
	title: 'JSON Formatter | Hudson Digital Solutions',
	description:
		'Format, validate, and minify JSON data online. Free JSON formatter with syntax highlighting, instant error detection, and one-click copy for cleaner data.',
	openGraph: {
		title: 'JSON Formatter',
		description: 'Format, validate, and minify JSON data online.'
	}
}

export default function JsonFormatterPage() {
	return <JsonFormatterClient />
}
