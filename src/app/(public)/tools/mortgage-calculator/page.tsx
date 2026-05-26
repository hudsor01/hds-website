/**
 * Mortgage Calculator
 * Calculate monthly mortgage payments with taxes, insurance, and PMI
 */

import type { Metadata } from 'next'
import { MortgageCalculatorClient } from './MortgageCalculatorClient'

export const metadata: Metadata = {
	title: 'Mortgage Calculator | Hudson Digital Solutions',
	description:
		'Calculate your monthly mortgage payment including principal, interest, taxes, insurance, and PMI. Free mortgage calculator.',
	openGraph: {
		title: 'Mortgage Calculator',
		description:
			'Calculate monthly mortgage payments with taxes, insurance, and PMI.'
	}
}

export default function MortgageCalculatorPage() {
	return <MortgageCalculatorClient />
}
