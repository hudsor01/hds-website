/**
 * Review markup is only honest when it mirrors real, published reviews.
 * No reviews must mean no rating claim at all.
 */

import { describe, expect, test } from 'bun:test'
import { BUSINESS_ID, generateReviewSchema } from '@/lib/seo-utils'
import type { Testimonial } from '@/types/testimonials'

function review(rating: number, name: string): Testimonial {
	return {
		id: name,
		client_name: name,
		rating,
		content: `Review from ${name}.`,
		approved: true,
		featured: false,
		created_at: '2026-11-01T12:00:00.000Z'
	}
}

describe('generateReviewSchema', () => {
	test('emits nothing without reviews', () => {
		expect(generateReviewSchema([])).toEqual([])
	})

	test('rates the business from the reviews it is given', () => {
		const [business, ...reviews] = generateReviewSchema([
			review(5, 'Ana'),
			review(4, 'Ben'),
			review(4, 'Cy')
		])
		expect(business).toMatchObject({
			'@id': BUSINESS_ID,
			aggregateRating: { ratingValue: 4.3, reviewCount: 3, bestRating: 5 }
		})
		expect(reviews).toHaveLength(3)
		expect(reviews[0]).toMatchObject({
			'@type': 'Review',
			itemReviewed: { '@id': BUSINESS_ID },
			author: { name: 'Ana' },
			reviewRating: { ratingValue: 5 },
			datePublished: '2026-11-01'
		})
	})

	test('omits datePublished when a review has no created date', () => {
		const undated: Testimonial = { ...review(5, 'Dee'), created_at: null }
		// JSON-LD is emitted with JSON.stringify, which drops undefined keys.
		const [, node] = generateReviewSchema([undated])
		expect(JSON.stringify(node)).not.toContain('datePublished')
	})
})
