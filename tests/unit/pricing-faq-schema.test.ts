import { describe, expect, test } from 'bun:test'
import { faqs } from '@/lib/pricing/faqs'

describe('pricing FAQ JSON-LD parity', () => {
	const faqSchema = {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faqs.map(faq => ({
			'@type': 'Question',
			name: faq.question,
			acceptedAnswer: {
				'@type': 'Answer',
				text: faq.answer
			}
		}))
	}

	test('mainEntity length matches faqs length', () => {
		expect(faqSchema.mainEntity.length).toBe(faqs.length)
	})

	test('every entry has 1:1 question/answer parity with the source array', () => {
		for (let i = 0; i < faqs.length; i++) {
			const faq = faqs[i]
			const entry = faqSchema.mainEntity[i]
			if (!faq || !entry) {
				throw new Error(`Missing FAQ or schema entry at index ${i}`)
			}
			expect(entry.name).toBe(faq.question)
			expect(entry.acceptedAnswer.text).toBe(faq.answer)
		}
	})

	test('covers all 6 expected pricing FAQs', () => {
		expect(faqs.length).toBe(6)
	})
})
