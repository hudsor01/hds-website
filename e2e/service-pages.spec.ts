/**
 * Service Pages E2E Tests
 * =============================================================================
 *
 * The three /services/[slug] pages are the ranking targets for each service.
 * Checks each one renders its content and schema, unknown slugs are a real
 * 404 and the /services grid links to every page.
 */

import { expect, test } from '@playwright/test'

const SERVICE_PAGES = [
	{ slug: 'web-design', heading: /Website Design for Dallas-Fort Worth/i },
	{ slug: 'local-seo', heading: /Local SEO for Dallas-Fort Worth/i },
	{ slug: 'booking-payments', heading: /Online Booking, Payments/i }
]

for (const { slug, heading } of SERVICE_PAGES) {
	test.describe(`/services/${slug}`, () => {
		test.beforeEach(async ({ page }) => {
			await page.goto(`/services/${slug}`)
			await page.waitForLoadState('networkidle')
		})

		test('renders the headline, included list and FAQ', async ({ page }) => {
			await expect(page.locator('h1')).toHaveText(heading)
			await expect(
				page.getByRole('heading', { name: "What's Included" })
			).toBeVisible()
			await expect(
				page.getByRole('heading', { name: 'Common Questions' })
			).toBeVisible()
			await expect(page.locator('a[href="/contact"]').first()).toBeVisible()
		})

		test('emits Service and FAQPage structured data', async ({ page }) => {
			const blocks = await page
				.locator('script[type="application/ld+json"]')
				.allTextContents()
			const types = blocks.flatMap(text => {
				const data = JSON.parse(text)
				return (data['@graph'] ?? [data]).map(
					(node: { '@type': string }) => node['@type']
				)
			})
			expect(types).toContain('Service')
			expect(types).toContain('FAQPage')
			expect(types).toContain('BreadcrumbList')
		})
	})
}

test('unknown service slug is a 404', async ({ page }) => {
	const response = await page.goto('/services/not-a-service')
	expect(response?.status()).toBe(404)
})

test('/services links every service page', async ({ page }) => {
	await page.goto('/services')
	for (const { slug } of SERVICE_PAGES) {
		await expect(
			page.locator(`#services-list a[href="/services/${slug}"]`)
		).toHaveCount(1)
	}
})
