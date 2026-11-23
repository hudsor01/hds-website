/**
 * Paystub Calculator
 * 2026 paycheck withholding: federal (IRS Pub. 15-T), FICA and state payroll formulas
 */

import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'
import PaystubCalculatorClient from './PaystubCalculatorClient'

export const metadata: Metadata = buildMetadata({
	title: 'Paystub Calculator | Hudson Digital Solutions',
	description:
		'Free 2026 paystub calculator. Federal withholding from your W-4, Social Security, Medicare, 401(k) and state tax for CA, NY, IL, PA and MA.',
	path: '/tools/paystub-calculator',
	socialTitle: 'Paystub Calculator',
	socialDescription:
		'See take-home pay for each 2026 paycheck with your W-4 and deductions.'
})

export default function PaystubCalculatorPage() {
	return <PaystubCalculatorClient />
}
