/**
 * Profit Margin & Markup Calculator
 */

import type { Metadata } from 'next'
import ProfitMarginCalculatorClient from './ProfitMarginCalculatorClient'

export const metadata: Metadata = {
	title: 'Profit Margin & Markup Calculator | Hudson Digital Solutions',
	description:
		'Free profit margin and markup calculator. Enter cost and selling price to get gross margin, markup, and profit, or find the price for a target margin.'
}

export default function ProfitMarginCalculatorPage() {
	return <ProfitMarginCalculatorClient />
}
