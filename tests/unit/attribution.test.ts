import { describe, expect, it } from 'bun:test'
import {
	buildAttributionTouch,
	deriveChannel
} from '@/lib/attribution'

const NOW = '2026-01-01T00:00:00.000Z'

describe('deriveChannel', () => {
	it('classifies Google click IDs as paid_search', () => {
		expect(deriveChannel({ gclid: 'abc' })).toBe('paid_search')
		expect(deriveChannel({ wbraid: 'abc' })).toBe('paid_search')
		expect(deriveChannel({ gbraid: 'abc' })).toBe('paid_search')
	})

	it('classifies fbclid as paid_social', () => {
		expect(deriveChannel({ fbclid: 'abc' })).toBe('paid_social')
	})

	it('falls back to utm medium, then referral, then direct', () => {
		expect(deriveChannel({ utmMedium: 'email' })).toBe('email')
		expect(deriveChannel({ referrer: 'https://news.ycombinator.com' })).toBe(
			'referral'
		)
		expect(deriveChannel({})).toBe('direct')
	})
})

describe('buildAttributionTouch', () => {
	it('captures utm params + gclid from the URL', () => {
		const touch = buildAttributionTouch(
			new URLSearchParams(
				'utm_source=google&utm_medium=cpc&utm_campaign=dfw-web-design&gclid=XYZ123'
			),
			undefined,
			'/services',
			undefined,
			NOW
		)

		expect(touch?.utmSource).toBe('google')
		expect(touch?.utmMedium).toBe('cpc')
		expect(touch?.utmCampaign).toBe('dfw-web-design')
		expect(touch?.gclid).toBe('XYZ123')
		expect(touch?.landingPage).toBe('/services')
		expect(touch?.firstTouchAt).toBe(NOW)
		expect(touch?.lastTouchAt).toBe(NOW)
	})

	it('records a first-touch baseline on a direct visit', () => {
		const touch = buildAttributionTouch(
			new URLSearchParams(''),
			undefined,
			'/',
			undefined,
			NOW
		)
		expect(touch).not.toBeNull()
		expect(touch?.landingPage).toBe('/')
		expect(touch?.utmSource).toBeUndefined()
	})

	it('preserves a stored paid touch on a later paramless visit (returns null)', () => {
		const existing = { gclid: 'FIRSTCLICK', firstTouchAt: NOW }
		const touch = buildAttributionTouch(
			new URLSearchParams(''),
			undefined,
			'/about',
			existing,
			'2026-02-02T00:00:00.000Z'
		)
		expect(touch).toBeNull()
	})

	it('overwrites with a newer ad click but keeps the first-touch timestamp', () => {
		const existing = { gclid: 'FIRSTCLICK', firstTouchAt: NOW }
		const later = '2026-02-02T00:00:00.000Z'
		const touch = buildAttributionTouch(
			new URLSearchParams('gclid=SECONDCLICK'),
			undefined,
			'/landing',
			existing,
			later
		)
		expect(touch?.gclid).toBe('SECONDCLICK')
		expect(touch?.firstTouchAt).toBe(NOW)
		expect(touch?.lastTouchAt).toBe(later)
	})
})
