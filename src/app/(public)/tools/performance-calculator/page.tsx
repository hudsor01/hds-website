/**
 * Site Speed Revenue Calculator
 * Real PageSpeed score and lab metrics for a URL, plus a revenue scenario
 * built on a conversion lift the visitor chooses
 */

import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'
import PerformanceCalculatorClient from './PerformanceCalculatorClient'

export const metadata: Metadata = buildMetadata({
	title: 'Site Speed Revenue Calculator | Hudson Digital Solutions',
	description:
		'Run a free mobile PageSpeed test on your site, see your score and lab metrics, then model the revenue at stake with a conversion lift you choose.',
	path: '/tools/performance-calculator',
	socialTitle: 'Site Speed Revenue Calculator',
	socialDescription:
		'Your real PageSpeed score, plus a revenue scenario you control.'
})

export default function PerformanceCalculatorPage() {
	return <PerformanceCalculatorClient />
}
