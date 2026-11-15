/**
 * Performance Savings Calculator
 * Analyzes website performance and calculates revenue lost due to slow load times
 */

import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'
import PerformanceCalculatorClient from './PerformanceCalculatorClient'

export const metadata: Metadata = buildMetadata({
	title: 'Performance Savings Calculator | Hudson Digital Solutions',
	description:
		'Analyze how website load times affect your revenue. Calculate potential savings from performance optimization with this free calculator.',
	path: '/tools/performance-calculator',
	socialTitle: 'Performance Savings Calculator',
	socialDescription: 'Calculate revenue lost due to slow website load times.'
})

export default function PerformanceCalculatorPage() {
	return <PerformanceCalculatorClient />
}
