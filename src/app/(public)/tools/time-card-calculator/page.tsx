/**
 * Time Card / Hours Calculator
 */

import type { Metadata } from 'next'
import TimeCardCalculatorClient from './TimeCardCalculatorClient'

export const metadata: Metadata = {
	alternates: { canonical: '/tools/time-card-calculator' },
	title: 'Time Card Calculator with Breaks & Overtime | Hudson Digital',
	description:
		'Free time card calculator. Add clock-in and clock-out times with lunch breaks to total daily and weekly hours, split overtime, and calculate gross pay.'
}

export default function TimeCardCalculatorPage() {
	return <TimeCardCalculatorClient />
}
