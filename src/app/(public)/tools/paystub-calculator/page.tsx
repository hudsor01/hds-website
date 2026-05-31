/**
 * Paystub Calculator
 * Generate detailed payroll breakdowns with federal and state tax calculations
 */

import type { Metadata } from 'next'
import PaystubCalculatorClient from './PaystubCalculatorClient'

export const metadata: Metadata = {
	alternates: { canonical: '/tools/paystub-calculator' },
	title: 'Paystub Calculator | Hudson Digital Solutions',
	description:
		'Generate detailed payroll breakdowns with federal and state tax calculations. Free paystub calculator for employers and employees.',
	openGraph: {
		title: 'Paystub Calculator',
		description: 'Generate detailed payroll breakdowns with tax calculations.'
	}
}

export default function PaystubCalculatorPage() {
	return <PaystubCalculatorClient />
}
