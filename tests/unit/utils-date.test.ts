import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import { formatCalendarDate, formatDate } from '@/lib/utils'

// Run west of UTC, where the off-by-one bug shows: a calendar day parsed as
// UTC midnight is still the previous evening in Dallas.
// Capture the effective zone, not just the env var: when TZ is unset,
// writing `undefined` back (or deleting it) does not reset ICU, so the zone
// set here would leak into every later file in the run.
const originalTZ =
	process.env.TZ ?? Intl.DateTimeFormat().resolvedOptions().timeZone
beforeAll(() => {
	process.env.TZ = 'America/Chicago'
})
afterAll(() => {
	process.env.TZ = originalTZ
})

describe('formatCalendarDate', () => {
	test('keeps the picked day for a date input value', () => {
		expect(formatCalendarDate('2026-11-15')).toBe('Nov 15, 2026')
	})

	test('keeps the day for a UTC-midnight ISO date (blog publishedAt)', () => {
		expect(formatCalendarDate('2026-01-15T00:00:00.000Z', 'long')).toBe(
			'January 15, 2026'
		)
		expect(formatCalendarDate(new Date('2026-06-03T00:00:00Z'))).toBe(
			'Jun 3, 2026'
		)
	})
})

describe('formatDate', () => {
	test('formats a timestamp in local time', () => {
		// 03:00 UTC on Nov 15 is 9pm on Nov 14 in Dallas
		expect(formatDate('2026-11-15T03:00:00.000Z')).toBe('Nov 14, 2026')
	})
})
