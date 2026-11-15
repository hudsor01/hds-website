/**
 * Paystub Calculator
 * Estimate 2025 payroll tax breakdowns with federal and state income tax
 */

import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'
import PaystubCalculatorClient from './PaystubCalculatorClient'

export const metadata: Metadata = buildMetadata({
	title: 'Paystub Calculator | Hudson Digital Solutions',
	description:
		'Estimate 2025 payroll tax breakdowns with this free paystub calculator. Federal tax for all filers and state income tax for CA, NY, IL, PA, and MA.',
	path: '/tools/paystub-calculator',
	socialTitle: 'Paystub Calculator',
	socialDescription:
		'Estimate 2025 payroll tax breakdowns with this free paystub calculator.'
})

export default function PaystubCalculatorPage() {
	return <PaystubCalculatorClient />
}
