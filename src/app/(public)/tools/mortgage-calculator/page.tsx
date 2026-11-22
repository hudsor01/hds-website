/**
 * Mortgage Calculator
 * Full monthly payment for conventional, FHA, VA and USDA loans
 */

import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'
import { MortgageCalculatorClient } from './MortgageCalculatorClient'

export const metadata: Metadata = buildMetadata({
	title: 'Mortgage Calculator: FHA, VA, Conventional | Hudson Digital',
	description:
		'Free mortgage calculator for conventional, FHA, VA and USDA loans. See the full payment with taxes, insurance, PMI or fees, cash to close and extra payments.',
	path: '/tools/mortgage-calculator',
	socialTitle: 'Mortgage Calculator',
	socialDescription:
		'Full monthly payment for conventional, FHA, VA and USDA loans, with cash to close and extra payments.'
})

export default function MortgageCalculatorPage() {
	return <MortgageCalculatorClient />
}
