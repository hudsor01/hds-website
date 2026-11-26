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

// Stretched link: the title link's ::after overlay covers the card, so a
// click on the description (not the title text) still opens the service
// page. A raw mouse click at the text's center, because Playwright's
// locator click refuses a point whose hit target (the overlay) is outside
// the <p>.
test('clicking a /services card description opens that service', async ({
	page
}) => {
	await page.goto('/services')
	const description = page
		.locator('#seo')
		.getByText(/A great website only works if customers can find it/)
	await description.scrollIntoViewIfNeeded()
	const box = await description.boundingBox()
	if (!box) {
		throw new Error('Local SEO card description is not rendered')
	}
	await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
	await expect(page).toHaveURL(/\/services\/local-seo$/)
})

test('keyboard focus on a /services card link outlines the whole card', async ({
	page,
	browserName
}) => {
	await page.goto('/services')
	const firstLink = page.locator('#design-build a')
	const card = page.locator('#seo > div')
	const link = card.getByRole('link')
	// One Tab stop per card: Tab from the first card's link lands on the
	// second card's. WebKit, like Safari, skips links on a plain Tab;
	// Option+Tab reaches them.
	// The grid streams in inside a hidden holder; focus() on a hidden link
	// is a no-op, so wait until the card is shown.
	await expect(firstLink).toBeVisible()
	await firstLink.focus()
	await expect(firstLink).toBeFocused()
	await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab')
	await expect(link).toBeFocused()

	const outline = await card.evaluate(el => {
		const style = getComputedStyle(el)
		return {
			style: style.outlineStyle,
			width: style.outlineWidth,
			offset: style.outlineOffset
		}
	})
	expect(outline).toEqual({ style: 'solid', width: '2px', offset: '2px' })
	// The ring is on the card, not doubled on the title text
	expect(await link.evaluate(el => getComputedStyle(el).outlineStyle)).toBe(
		'none'
	)
})

test('a blog post shows a breadcrumb and links its related service', async ({
	page
}) => {
	await page.goto('/blog/how-to-show-up-in-ai-search')
	const breadcrumb = page.getByRole('navigation', { name: 'breadcrumb' })
	await expect(breadcrumb.locator('a[href="/blog"]')).toBeVisible()
	await expect(
		page.getByRole('link', { name: 'See how it works' })
	).toHaveAttribute(
		'href',
		/^\/services\/(web-design|local-seo|booking-payments)$/
	)
})
