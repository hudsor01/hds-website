/**
 * ROI Calculator
 * Added revenue from a conversion-rate lift, with optional ROI and payback
 */

import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'
import { ROICalculatorClient } from './ROICalculatorClient'

export const metadata: Metadata = buildMetadata({
	title: 'ROI Calculator | Hudson Digital',
	description:
		'Estimate the added revenue from a higher website conversion rate. Enter what you would spend to see first-year ROI and payback months. Free ROI calculator.',
	path: '/tools/roi-calculator',
	socialTitle: 'ROI Calculator',
	socialDescription:
		'Added revenue from a higher conversion rate, plus first-year ROI and payback months on your own spend.'
})

export default function ROICalculatorPage() {
	return <ROICalculatorClient />
}
