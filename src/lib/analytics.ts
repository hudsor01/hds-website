/**
 * Lightweight Analytics Module
 * Direct wrapper for Vercel Analytics with minimal abstraction
 */

import { track as vercelTrack } from '@vercel/analytics'
import { logger } from '@/lib/logger'
import type { EventProperties, UserProperties } from '@/types/analytics'

type AnalyticsValue = string | number | boolean | null | undefined

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
 * Identify user (tracked as event since Vercel Analytics doesn't support user identification)
 */
export function identify(userId: string, properties?: UserProperties): void {
	if (typeof window === 'undefined') {
		return
	}

	try {
		vercelTrack('user_identified', { userId, ...properties })
	} catch (error) {
		logger.warn('Failed to identify user:', error)
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

	try {
		vercelTrack('conversion', {
			conversionType,
			value,
			currency,
			...properties
		})
	} catch (error) {
		logger.warn('Failed to track conversion:', error)
	}
}
