/**
 * Comma Separator
 * Convert a pasted column or list into comma-separated (or other) text.
 */

import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'
import CommaSeparatorClient from './CommaSeparatorClient'

export const metadata: Metadata = buildMetadata({
	title: 'Comma Separator - Column to Comma List | Hudson Digital',
	description:
		'Convert a column of values into a comma-separated list. Paste a spreadsheet column or list and pick the delimiter, quotes and duplicate removal.',
	path: '/tools/comma-separator'
})

export default function CommaSeparatorPage() {
	return <CommaSeparatorClient />
}
