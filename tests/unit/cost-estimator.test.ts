import { describe, expect, test } from 'bun:test'
import {
	calculateEstimate,
	estimatorParsers,
	formatWholeDollars,
	parsePageCount
} from '@/lib/cost-estimator'

describe('calculateEstimate', () => {
	test('Landing Page, 5 pages, standard design, standard pace, no maintenance', () => {
		const e = calculateEstimate({
			websiteType: 'landing-page',
			pages: 5,
			features: [],
			design: 'standard',
			timeline: 'normal',
			maintenance: false
		})
		expect(e).toEqual({
			low: 1600,
			high: 2400,
			midpoint: 2000,
			weeks: 4,
			annualMaintenance: null,
			monthlyMaintenance: null
		})
	})

	test('Business Website, 12 pages, blog and booking, fully custom, maintenance on', () => {
		const e = calculateEstimate({
			websiteType: 'business-website',
			pages: 12,
			features: ['blog', 'booking'],
			design: 'custom',
			timeline: 'normal',
			maintenance: true
		})
		// (5000 + 7 x 500 + 1500 + 3500) x 1.3 = 17,550
		expect(e.midpoint).toBe(17_550)
		expect(e.low).toBe(14_040)
		expect(e.high).toBe(21_060)
		expect(e.weeks).toBe(6)
		expect(e.annualMaintenance).toBe(2633)
		expect(e.monthlyMaintenance).toBe(219)
	})

	test('rush adds 25% to the range but maintenance uses the pre-rush build', () => {
		const normal = calculateEstimate({
			websiteType: 'business-website',
			pages: 5,
			features: [],
			design: 'standard',
			timeline: 'normal',
			maintenance: true
		})
		const rush = calculateEstimate({
			websiteType: 'business-website',
			pages: 5,
			features: [],
			design: 'standard',
			timeline: 'urgent',
			maintenance: true
		})
		expect(rush.midpoint).toBe(6250)
		expect(rush.weeks).toBe(3)
		expect(rush.annualMaintenance).toBe(normal.annualMaintenance)
		expect(rush.annualMaintenance).toBe(750)
	})

	test('a duplicated feature is only counted once', () => {
		const once = calculateEstimate({
			websiteType: 'landing-page',
			pages: 5,
			features: ['blog'],
			design: 'standard',
			timeline: 'normal',
			maintenance: false
		})
		const twice = calculateEstimate({
			websiteType: 'landing-page',
			pages: 5,
			features: ['blog', 'blog'],
			design: 'standard',
			timeline: 'normal',
			maintenance: false
		})
		expect(twice).toEqual(once)
	})
})

describe('URL parsing', () => {
	test('type only accepts known website types', () => {
		expect(estimatorParsers.type.parse('e-commerce')).toBe('e-commerce')
		expect(estimatorParsers.type.parse('foo')).toBeNull()
	})

	test('design and timeline reject unknown values (the dead "flexible" too)', () => {
		expect(estimatorParsers.design.parse('custom')).toBe('custom')
		expect(estimatorParsers.design.parse('gold')).toBeNull()
		expect(estimatorParsers.timeline.parse('urgent')).toBe('urgent')
		expect(estimatorParsers.timeline.parse('flexible')).toBeNull()
	})

	test('features are allowlisted and de-duplicated', () => {
		expect(
			estimatorParsers.features.parse('blog,blog,unknown,booking')
		).toEqual(['blog', 'booking'])
		expect(estimatorParsers.features.serialize(['blog', 'blog'])).toBe('blog')
	})

	test('page count must be a whole number from 1 to 100', () => {
		expect(parsePageCount('12')).toBe(12)
		expect(parsePageCount(' 1 ')).toBe(1)
		expect(parsePageCount('100')).toBe(100)
		expect(parsePageCount('')).toBeNull()
		expect(parsePageCount('0')).toBeNull()
		expect(parsePageCount('101')).toBeNull()
		expect(parsePageCount('2.5')).toBeNull()
		expect(parsePageCount('-3')).toBeNull()
		expect(parsePageCount('abc')).toBeNull()
	})
})

describe('formatWholeDollars', () => {
	test('prints whole dollars without cents', () => {
		expect(formatWholeDollars(17_550)).toBe('$17,550')
		expect(formatWholeDollars(219)).toBe('$219')
	})
})
