/**
 * Paystub Calculator
 * Estimate 2025 payroll tax breakdowns with federal and state income tax
 */

import type { Metadata } from 'next'
import PaystubCalculatorClient from './PaystubCalculatorClient'

export const metadata: Metadata = {
	alternates: { canonical: '/tools/paystub-calculator' },
	title: 'Paystub Calculator | Hudson Digital Solutions',
	description:
		'Estimate 2025 payroll tax breakdowns with our free paystub calculator. Federal tax for all filers and state income tax for CA, NY, IL, PA, and MA.',
	openGraph: {
		title: 'Paystub Calculator',
		description:
			'Estimate 2025 payroll tax breakdowns with our free paystub calculator.'
	}
}

export default function PaystubCalculatorPage() {
	return <PaystubCalculatorClient />
}
