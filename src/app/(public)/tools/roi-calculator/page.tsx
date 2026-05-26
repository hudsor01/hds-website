/**
 * ROI Calculator
 * Calculate potential revenue increase from website optimization
 */

import type { Metadata } from 'next'
import { ROICalculatorClient } from './ROICalculatorClient'

export const metadata: Metadata = {
	title: 'ROI Calculator | Hudson Digital Solutions',
	description:
		'Calculate how much additional revenue you could generate by improving your website conversion rate. Free ROI calculator for businesses.',
	openGraph: {
		title: 'ROI Calculator',
		description:
			'Calculate potential revenue increase from website optimization.'
	}
}

export default function ROICalculatorPage() {
	return <ROICalculatorClient />
}
