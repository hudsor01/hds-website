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

		// Log performance issues in development
		if (process.env.NODE_ENV === 'development') {
			logger.warn(
				`[WebVitals] ${metric.name}: ${metric.value} (${metric.rating})`,
				{
					name: metric.name,
					value: metric.value,
					rating: metric.rating
				}
			)
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
