/**
 * Web Vitals Reporting Component
 * Tracks and reports Core Web Vitals metrics
 */

'use client'

import { useReportWebVitals } from 'next/web-vitals'
import { logger } from '@/lib/logger'

export function WebVitalsReporting() {
	useReportWebVitals(metric => {
		// Store in database for admin dashboard
		storeWebVital(metric)

		// Log in development at a level that matches the CWV rating so good
		// metrics show as info and bad metrics surface in warn/error filters.
		// The Phase 03 dashboard widget uses the same rating thresholds for
		// its KPI cards (text-success-text / warning / destructive); align
		// the log level here so dev-console filtering matches.
		if (process.env.NODE_ENV === 'development') {
			const log =
				metric.rating === 'poor'
					? logger.error
					: metric.rating === 'needs-improvement'
						? logger.warn
						: logger.info
			log(`[WebVitals] ${metric.name}: ${metric.value} (${metric.rating})`, {
				name: metric.name,
				value: metric.value,
				rating: metric.rating
			})
		}
	})

	return null
}

interface WebVitalMetric {
	name: string
	value: number
	rating: string
	delta: number
	id: string
	navigationType?: string
}

async function storeWebVital(metric: WebVitalMetric) {
	try {
		// Only store in production
		if (process.env.NODE_ENV !== 'production') {
			return
		}

		await fetch('/api/web-vitals', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				name: metric.name,
				value: metric.value,
				rating: metric.rating,
				delta: metric.delta,
				id: metric.id,
				navigation_type: metric.navigationType
			})
		})
	} catch (error) {
		// Silently fail - don't disrupt user experience
		logger.error('[WebVitals] Failed to store web vital', error)
	}
}
