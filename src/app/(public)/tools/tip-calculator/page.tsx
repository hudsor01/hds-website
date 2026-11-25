/**
 * Tip Calculator
 * Calculate tip amount and split bills among multiple people
 */

import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'
import TipCalculatorClient from './TipCalculatorClient'

export const metadata: Metadata = buildMetadata({
	title: 'Tip Calculator | Hudson Digital',
	description:
		'Calculate tip amounts and split bills among multiple people. Free tip calculator with customizable percentages and per-person breakdown.',
	path: '/tools/tip-calculator',
	socialTitle: 'Tip Calculator',
	socialDescription:
		'Calculate tip amounts and split bills among multiple people.'
})

export default function TipCalculatorPage() {
	return <TipCalculatorClient />
}
