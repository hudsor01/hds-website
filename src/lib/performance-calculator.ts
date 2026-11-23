/**
 * Site Speed Revenue Calculator math.
 *
 * Pure functions so the page can derive every number during render from
 * the PageSpeed metrics plus the visitor's current inputs.
 */

import type { PagespeedMetrics } from '@/lib/schemas/pagespeed'

// Lighthouse performance score bands:
// https://developer.chrome.com/docs/lighthouse/performance/performance-scoring
export type ScoreBand = 'Poor' | 'Needs Improvement' | 'Good'

export function scoreBand(score: number): ScoreBand {
	if (score >= 90) {
		return 'Good'
	}
	if (score >= 50) {
		return 'Needs Improvement'
	}
	return 'Poor'
}

export const SCORE_BAND_RANGE: Record<ScoreBand, string> = {
	Poor: '0 to 49',
	'Needs Improvement': '50 to 89',
	Good: '90 to 100'
}

type LabMetricKey = keyof Omit<PagespeedMetrics, 'performanceScore'>

interface LabMetricGuide {
	key: LabMetricKey
	abbr: string
	name: string
	/** Upper bound of "good", in the audit's numericValue unit */
	goodAtMost: number
	goodLabel: string
	note?: string
}

// Good thresholds from web.dev: LCP and CLS (https://web.dev/articles/vitals),
// TBT (https://web.dev/articles/tbt), FCP (https://web.dev/articles/fcp).
export const LAB_METRICS: readonly LabMetricGuide[] = [
	{
		key: 'lcp',
		abbr: 'LCP',
		name: 'Largest Contentful Paint',
		goodAtMost: 2500,
		goodLabel: '2.5 s or less'
	},
	{
		key: 'cls',
		abbr: 'CLS',
		name: 'Cumulative Layout Shift',
		goodAtMost: 0.1,
		goodLabel: '0.1 or less'
	},
	{
		key: 'tbt',
		abbr: 'TBT',
		name: 'Total Blocking Time',
		goodAtMost: 200,
		goodLabel: 'under 200 ms',
		note: 'Lab stand-in for responsiveness, since INP needs real visitors.'
	},
	{
		key: 'fcp',
		abbr: 'FCP',
		name: 'First Contentful Paint',
		goodAtMost: 1800,
		goodLabel: '1.8 s or less'
	}
] as const

/** "a" or "an" for a spoken number: an 8.4%, an 11%, an 18%, a 20% */
export function indefiniteArticle(value: number): 'a' | 'an' {
	const whole = Math.trunc(Math.abs(value))
	return String(whole).startsWith('8') || whole === 11 || whole === 18
		? 'an'
		: 'a'
}

export function isGoodLabValue(
	guide: LabMetricGuide,
	numericValue: number | null
): boolean | null {
	if (numericValue === null) {
		return null
	}
	return guide.key === 'tbt'
		? numericValue < guide.goodAtMost
		: numericValue <= guide.goodAtMost
}

/**
 * Default "expected conversion lift if the site gets fast". Deloitte's
 * Milliseconds Make Millions study (commissioned by Google, 37 brands)
 * associated a 0.1 s mobile speed improvement with an 8.4% rise in retail
 * conversions: https://web.dev/case-studies/milliseconds-make-millions
 */
export const DEFAULT_LIFT_PERCENT = 8.4

export interface RevenueScenarioInput {
	monthlyVisitors: number
	conversionRatePercent: number
	averageOrderValue: number
	liftPercent: number
}

export interface RevenueScenario {
	monthlyRevenue: number
	scenarioConversionRatePercent: number
	monthlyGain: number
	annualGain: number
	/** True when the lift would have pushed the conversion rate past 100% */
	capped: boolean
}

/**
 * monthly revenue = visitors x conversion rate x order value
 * scenario gain   = monthly revenue x lift, with the lifted conversion
 *                   rate capped at 100%
 */
export function revenueScenario(input: RevenueScenarioInput): RevenueScenario {
	const {
		monthlyVisitors,
		conversionRatePercent,
		averageOrderValue,
		liftPercent
	} = input
	const monthlyRevenue =
		monthlyVisitors * (conversionRatePercent / 100) * averageOrderValue
	const uncapped = conversionRatePercent * (1 + liftPercent / 100)
	const scenarioConversionRatePercent = Math.min(100, uncapped)
	const monthlyGain =
		conversionRatePercent > 0
			? monthlyRevenue *
				((scenarioConversionRatePercent - conversionRatePercent) /
					conversionRatePercent)
			: 0

	return {
		monthlyRevenue,
		scenarioConversionRatePercent,
		monthlyGain,
		annualGain: monthlyGain * 12,
		capped: uncapped > 100
	}
}
