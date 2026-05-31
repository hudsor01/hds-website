/**
 * Comma Separator
 * Convert space/tab/newline separated lists into comma-separated text.
 */

import type { Metadata } from 'next'
import CommaSeparatorClient from './CommaSeparatorClient'

export const metadata: Metadata = {
	alternates: { canonical: '/tools/comma-separator' },
	title: 'Comma Separator - Column to Comma Separated List | Hudson Digital',
	description:
		'Free tool to convert a column of values into a comma-separated list. Paste a spreadsheet column or space-separated list and get a clean comma-separated series, with optional quotes.'
}

export default function CommaSeparatorPage() {
	return <CommaSeparatorClient />
}
