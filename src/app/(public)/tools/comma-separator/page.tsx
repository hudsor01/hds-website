/**
 * Comma Separator
 * Convert space/tab/newline separated lists into comma-separated text.
 */

import type { Metadata } from 'next'
import CommaSeparatorClient from './CommaSeparatorClient'

export const metadata: Metadata = {
	alternates: { canonical: '/tools/comma-separator' },
	title: 'Comma Separator - Column to Comma List | Hudson Digital',
	description:
		'Convert a column of values into a comma-separated list. Paste a spreadsheet column or space-separated list and get a clean series, with optional quotes.'
}

export default function CommaSeparatorPage() {
	return <CommaSeparatorClient />
}
