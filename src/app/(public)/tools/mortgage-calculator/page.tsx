/**
 * Mortgage Calculator
 * Calculate monthly mortgage payments with taxes, insurance, and PMI
 */

import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'
import { MortgageCalculatorClient } from './MortgageCalculatorClient'

export const metadata: Metadata = buildMetadata({
	title: 'Mortgage Calculator | Hudson Digital Solutions',
	description:
		'Calculate your monthly mortgage payment including principal, interest, taxes, insurance, and PMI. Free mortgage calculator.',
	path: '/tools/mortgage-calculator',
	socialTitle: 'Mortgage Calculator',
	socialDescription:
		'Calculate monthly mortgage payments with taxes, insurance, and PMI.'
})

export default function MortgageCalculatorPage() {
	return <MortgageCalculatorClient />
}
