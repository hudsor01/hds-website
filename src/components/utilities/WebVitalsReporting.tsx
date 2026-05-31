/**
 * Web Vitals Reporting Component
 * Tracks and reports Core Web Vitals metrics
 */

'use client'

import { useReportWebVitals } from 'next/web-vitals'
import { env } from '@/env'
import { logger } from '@/lib/logger'

export function WebVitalsReporting() {
	useReportWebVitals(metric => {
		// Store in database for admin dashboard
		storeWebVital(metric)

		// Log in development so good metrics show as info and sub-par metrics
		// surface in the warn filter. Call the logger methods directly rather
		// than extracting one into a local: `const log = logger.error` detaches
		// the method from `logger`, so `this` is undefined and `this.log(...)`
		// throws on the client. Warn (not error) is used for poor metrics too,
		// since a web vital is not an application error and should not write to
		// the error_logs table that logger.error feeds.
		if (env.NODE_ENV === 'development') {
			const message = `[WebVitals] ${metric.name}: ${metric.value} (${metric.rating})`
			const data = {
				name: metric.name,
				value: metric.value,
				rating: metric.rating
			}
			if (metric.rating === 'good') {
				logger.info(message, data)
			} else {
				logger.warn(message, data)
			}
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
		if (env.NODE_ENV !== 'production') {
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
