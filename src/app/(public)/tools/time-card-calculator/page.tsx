/**
 * Time Card / Hours Calculator (one workweek)
 */

import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'
import TimeCardCalculatorClient from './TimeCardCalculatorClient'

export const metadata: Metadata = buildMetadata({
	title: 'Time Card Calculator with Breaks & Overtime | Hudson Digital',
	description:
		'Free time card calculator for one workweek. Add clock-in and clock-out times with unpaid meal breaks to total hours, weekly overtime and gross pay.',
	path: '/tools/time-card-calculator'
})

export default function TimeCardCalculatorPage() {
	return <TimeCardCalculatorClient />
}
