import { beforeEach, describe, expect, it } from 'bun:test'
import {
	buildAttributionTouch,
	deriveChannel,
	getAttribution
} from '@/lib/attribution'

const NOW = '2026-01-01T00:00:00.000Z'
const STORAGE_KEY = 'hds_attr'

describe('deriveChannel', () => {
	it('classifies Google click IDs as paid_search', () => {
		expect(deriveChannel({ gclid: 'abc' })).toBe('paid_search')
		expect(deriveChannel({ wbraid: 'abc' })).toBe('paid_search')
		expect(deriveChannel({ gbraid: 'abc' })).toBe('paid_search')
	})

	it('classifies fbclid as paid_social', () => {
		expect(deriveChannel({ fbclid: 'abc' })).toBe('paid_social')
	})

	it('resolves priority when multiple signals co-occur', () => {
		expect(deriveChannel({ gclid: 'G', fbclid: 'F' })).toBe('paid_search')
		expect(deriveChannel({ gclid: 'G', utmMedium: 'email' })).toBe(
			'paid_search'
		)
		expect(deriveChannel({ fbclid: 'F', utmMedium: 'cpc' })).toBe('paid_social')
	})

	it('collapses an unrecognized utm medium to "other" but keeps known ones', () => {
		expect(deriveChannel({ utmMedium: 'cpc' })).toBe('cpc')
		expect(deriveChannel({ utmMedium: 'email' })).toBe('email')
		// Crafted / misconfigured medium must not fragment channel reporting.
		expect(deriveChannel({ utmMedium: 'totally-made-up-value' })).toBe('other')
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

// The write glue (captureAttribution reading window.location) is verified in
// the browser; here we cover the localStorage read path + TTL/eviction, which
// happy-dom (registered in tests/setup.ts) supports.
describe('getAttribution (localStorage read + TTL)', () => {
	beforeEach(() => {
		window.localStorage.clear()
	})

	it('returns undefined when nothing is stored', () => {
		expect(getAttribution()).toBeUndefined()
	})

	it('reads back a stored, in-window record', () => {
		// Recent timestamp so it is inside the 90-day TTL regardless of run date.
		const recent = new Date().toISOString()
		window.localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({ utmSource: 'google', gclid: 'X', lastTouchAt: recent })
		)
		const attr = getAttribution()
		expect(attr?.utmSource).toBe('google')
		expect(attr?.gclid).toBe('X')
	})

	it('evicts and returns undefined past the 90-day TTL', () => {
		const old = new Date(Date.now() - 91 * 24 * 60 * 60 * 1000).toISOString()
		window.localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({ gclid: 'X', lastTouchAt: old })
		)
		expect(getAttribution()).toBeUndefined()
		expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
	})

	it('evicts a record with a non-ISO timestamp (schema rejects it)', () => {
		window.localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({ gclid: 'X', lastTouchAt: 'not-a-date' })
		)
		expect(getAttribution()).toBeUndefined()
		expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
	})

	it('returns undefined for a corrupt (non-JSON) record without throwing', () => {
		window.localStorage.setItem(STORAGE_KEY, 'not-json{{{')
		expect(getAttribution()).toBeUndefined()
	})

	it('evicts a record with no lastTouchAt (treated as expired)', () => {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ gclid: 'X' }))
		expect(getAttribution()).toBeUndefined()
		expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
	})
})
