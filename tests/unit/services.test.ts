/**
 * SERVICES feeds the /services/[slug] pages, their FAQPage JSON-LD and
 * /llms.txt. The copy ships to search engines verbatim, so it has to meet
 * the SEO length rules and the honesty rules (no prices, no dashes).
 */

import { describe, expect, test } from 'bun:test'
import { getServiceBySlug, SERVICES } from '@/lib/constants/services'
import { generateFaqSchema } from '@/lib/seo-utils'

const DASH = /[–—]/
const PRICE = /\$\s?\d/
const COMMA_AND = /, and\b/

function allCopy(service: (typeof SERVICES)[number]): string[] {
	return [
		service.title,
		service.description,
		service.headline,
		service.metaTitle,
		service.metaDescription,
		service.overviewHeading,
		...service.overview,
		...service.included.flatMap(detail => [detail.title, detail.body]),
		...service.faqs.flatMap(faq => [faq.question, faq.answer])
	]
}

describe('SERVICES', () => {
	test('slugs and anchors are unique and resolve', () => {
		expect(new Set(SERVICES.map(s => s.slug)).size).toBe(SERVICES.length)
		expect(new Set(SERVICES.map(s => s.anchorId)).size).toBe(SERVICES.length)
		for (const service of SERVICES) {
			expect(getServiceBySlug(service.slug)).toBe(service)
		}
		expect(getServiceBySlug('wp-login.php')).toBeUndefined()
	})

	test('meta descriptions are 120 to 160 characters', () => {
		for (const service of SERVICES) {
			expect(service.metaDescription.length).toBeGreaterThanOrEqual(120)
			expect(service.metaDescription.length).toBeLessThanOrEqual(160)
		}
	})

	test('every page has content to rank with', () => {
		for (const service of SERVICES) {
			expect(service.overview.length).toBeGreaterThan(0)
			expect(service.included.length).toBeGreaterThanOrEqual(3)
			expect(service.faqs.length).toBeGreaterThanOrEqual(3)
			expect(service.overviewHeading.endsWith('?')).toBe(true)
		}
	})

	test('copy has no prices, dashes or comma before "and"', () => {
		for (const service of SERVICES) {
			for (const text of allCopy(service)) {
				expect(text).not.toMatch(DASH)
				expect(text).not.toMatch(PRICE)
				expect(text).not.toMatch(COMMA_AND)
			}
		}
	})

	test('FAQPage schema mirrors the visible questions', () => {
		for (const service of SERVICES) {
			const node = generateFaqSchema(service.faqs)
			expect(node['@type']).toBe('FAQPage')
			expect(node.mainEntity.map(q => q.name)).toEqual(
				service.faqs.map(faq => faq.question)
			)
			expect(node.mainEntity[0]?.acceptedAnswer.text).toBe(
				service.faqs[0]?.answer
			)
		}
	})
})
