/**
 * Profit Margin & Markup Calculator
 */

import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'
import ProfitMarginCalculatorClient from './ProfitMarginCalculatorClient'

export const metadata: Metadata = buildMetadata({
	title: 'Profit Margin & Markup Calculator | Hudson Digital Solutions',
	description:
		'Free profit margin and markup calculator. Enter cost and selling price to get gross margin, markup, and profit, or find the price for a target margin.',
	path: '/tools/profit-margin-calculator'
})

export default function ProfitMarginCalculatorPage() {
	return <ProfitMarginCalculatorClient />
}
