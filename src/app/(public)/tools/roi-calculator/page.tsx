/**
 * ROI Calculator
 * Calculate potential revenue increase from website optimization
 */

import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'
import { ROICalculatorClient } from './ROICalculatorClient'

export const metadata: Metadata = buildMetadata({
	title: 'ROI Calculator | Hudson Digital Solutions',
	description:
		'Calculate how much additional revenue you could generate by improving your website conversion rate. Free ROI calculator for businesses.',
	path: '/tools/roi-calculator',
	socialTitle: 'ROI Calculator',
	socialDescription:
		'Calculate potential revenue increase from website optimization.'
})

export default function ROICalculatorPage() {
	return <ROICalculatorClient />
}
