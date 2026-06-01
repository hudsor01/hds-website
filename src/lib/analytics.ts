/**
 * Lightweight Analytics Module
 * Direct wrapper for Vercel Analytics with minimal abstraction
 */

import { track as vercelTrack } from '@vercel/analytics'
import { logger } from '@/lib/logger'
import type { EventProperties } from '@/types/analytics'

declare global {
	interface Window {
		dataLayer?: Record<string, unknown>[]
	}
}

type AnalyticsValue = string | number | boolean | null | undefined

// Property keys never forwarded to an analytics sink. The dataLayer is read
// by third-party tag managers / ad pixels, and Vercel Analytics is not a PII
// store either, so these are stripped centrally before any send.
const PII_KEYS = new Set([
	'email',
	'phone',
	'telephone',
	'name',
	'firstname',
	'lastname',
	'fullname',
	'address'
])

function stripPii(
	properties?: Record<string, AnalyticsValue>
): Record<string, AnalyticsValue> {
	if (!properties) {
		return {}
	}
	const out: Record<string, AnalyticsValue> = {}
	for (const [key, val] of Object.entries(properties)) {
		if (!PII_KEYS.has(key.toLowerCase())) {
			out[key] = val
		}
	}
	return out
}

/**
 * Track custom event
 * Used for general event tracking (page views, user actions, etc.)
 */
export function trackEvent(
	eventName: string,
	properties?: EventProperties
): void {
	if (typeof window === 'undefined') {
		return
	}

	try {
		vercelTrack(eventName, properties)
	} catch (error) {
		logger.warn('Failed to track event:', error)
	}
}

/**
 * Track conversion event
 * For tracking business-critical conversion events
 */
export function trackConversion(
	conversionType: string,
	value?: number,
	currency = 'USD',
	properties?: Record<string, AnalyticsValue>
): void {
	if (typeof window === 'undefined') {
		return
	}

	const safeProperties = stripPii(properties)

	try {
		vercelTrack('conversion', {
			conversionType,
			value,
			currency,
			...safeProperties
		})
	} catch (error) {
		logger.warn('Failed to track conversion:', error)
	}

	// Also push a GA4/GTM-standard event to the dataLayer, so a Google Ads /
	// Meta pixel added later via a tag manager fires with zero code change.
	pushToDataLayer(conversionType, value, currency, safeProperties)
}

function pushToDataLayer(
	event: string,
	value?: number,
	currency = 'USD',
	properties?: Record<string, AnalyticsValue>
): void {
	if (typeof window === 'undefined') {
		return
	}

	window.dataLayer = window.dataLayer ?? []
	window.dataLayer.push({
		event,
		...(value !== undefined ? { value, currency } : {}),
		...properties
	})
}
