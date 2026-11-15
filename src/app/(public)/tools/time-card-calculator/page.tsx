/**
 * Time Card / Hours Calculator
 */

import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'
import TimeCardCalculatorClient from './TimeCardCalculatorClient'

export const metadata: Metadata = buildMetadata({
	title: 'Time Card Calculator with Breaks & Overtime | Hudson Digital',
	description:
		'Free time card calculator. Add clock-in and clock-out times with lunch breaks to total daily and weekly hours, split overtime, and calculate gross pay.',
	path: '/tools/time-card-calculator'
})

export default function TimeCardCalculatorPage() {
	return <TimeCardCalculatorClient />
}
