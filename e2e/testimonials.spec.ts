/**
 * /testimonials renders only published client reviews. With none, it shows
 * an honest empty state, stays noindexed and makes no rating claim.
 */

import { expect, test } from '@playwright/test'

test('testimonials page never claims a rating it cannot back up', async ({
	page
}) => {
	await page.goto('/testimonials')
	await page.waitForLoadState('networkidle')
	await expect(page.locator('h1')).toHaveText('What Clients Say')

	const empty = page.getByRole('heading', { name: 'Reviews Are On the Way' })
	const schema = (
		await page.locator('script[type="application/ld+json"]').allTextContents()
	).join('\n')

	if ((await empty.count()) > 0) {
		await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
			'content',
			/noindex/
		)
		expect(schema).not.toContain('AggregateRating')
		await expect(
			page.getByRole('link', { name: 'Worked With Me? Leave a Review' })
		).toHaveAttribute('href', '/testimonials/submit')
	} else {
		expect(schema).toContain('AggregateRating')
		expect(schema).toContain('"@type":"Review"')
	}
})
