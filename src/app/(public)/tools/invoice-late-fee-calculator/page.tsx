/**
 * Invoice Late Fee Calculator
 */

import type { Metadata } from 'next'
import InvoiceLateFeeCalculatorClient from './InvoiceLateFeeCalculatorClient'

export const metadata: Metadata = {
	title: 'Invoice Late Fee Calculator | Hudson Digital Solutions',
	description:
		'Free invoice late fee calculator. Work out the late fee and total owed on an overdue invoice using a flat fee or a percentage rate per day, week, or month.'
}

export default function InvoiceLateFeeCalculatorPage() {
	return <InvoiceLateFeeCalculatorClient />
}
