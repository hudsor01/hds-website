/**
 * Blog Journey E2E Tests
 * =============================================================================
 *
 * Tests the blog listing page, slug navigation, tag/author pages, and the 404
 * for unknown slugs. Posts are compiled from content/blog at build time, so
 * these run without a database.
 */

import { expect, type TestInfo, test } from '@playwright/test'
import { createTestLogger } from './test-logger'

// Oldest legacy posts. The listing must show newer posts, not only these.
const PLACEHOLDER_SLUGS = [
	'small-business-website-cost-2025',
	'how-to-increase-website-conversion-rates-2025-guide',
	'beyond-just-works-why-businesses-need-websites-that-dominate'
]

test.describe('Blog Journey', () => {
	test('should show at least one post card on /blog', async ({
		page
	}, testInfo: TestInfo) => {
		const logger = createTestLogger(testInfo.title)

		await page.goto('/blog')
		await page.waitForLoadState('networkidle')
		logger.step('Navigated to /blog')

		// At least one post card must be visible (not the empty state)
		const postLinks = page.locator('article a[href^="/blog/"]')
		await expect(postLinks.first()).toBeVisible({ timeout: 10000 })

		const count = await postLinks.count()
		expect(count).toBeGreaterThanOrEqual(1)
		logger.complete(`${count} post card(s) visible on /blog`)
	})

	test('should show at least one real (non-placeholder) post on /blog', async ({
		page
	}, testInfo: TestInfo) => {
		const logger = createTestLogger(testInfo.title)

		await page.goto('/blog')
		await page.waitForLoadState('networkidle')

		const postLinks = page.locator('article a[href^="/blog/"]')
		await expect(postLinks.first()).toBeVisible({ timeout: 10000 })

		// Collect all post slugs from card links
		const hrefs = await postLinks.evaluateAll((els: Element[]) =>
			els.map(el => el.getAttribute('href') ?? '')
		)
		const slugs = hrefs.map(href => href.replace('/blog/', ''))
		logger.step(`Found slugs: ${slugs.join(', ')}`)

		// At least one slug must be a newer post, not one of the legacy three
		const realPostCount = slugs.filter(
			slug => !PLACEHOLDER_SLUGS.includes(slug)
		).length
		expect(realPostCount).toBeGreaterThanOrEqual(1)
		logger.complete(`${realPostCount} real (non-placeholder) post(s) confirmed`)
	})

	test('should navigate to a blog post and render content', async ({
		page
	}, testInfo: TestInfo) => {
		const logger = createTestLogger(testInfo.title)

		await page.goto('/blog')
		await page.waitForLoadState('networkidle')

		const firstCard = page.locator('article a[href^="/blog/"]').first()
		await expect(firstCard).toBeVisible({ timeout: 10000 })

		const href = await firstCard.getAttribute('href')
		logger.step(`Clicking through to: ${href}`)

		await firstCard.click()
		await page.waitForLoadState('networkidle')

		// Post detail page must render
		await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 })
		await expect(page.locator('article').first()).toBeVisible()
		await expect(page.locator('body')).not.toContainText(/not found/i)
		logger.complete(`Post page rendered at ${page.url()}`)
	})

	test('should not show empty state on /blog', async ({ page }) => {
		await page.goto('/blog')
		await page.waitForLoadState('networkidle')

		// Empty state text must NOT appear
		const emptyState = page.locator(
			'text=No articles found. Check back soon for new content!'
		)
		await expect(emptyState).not.toBeVisible()
	})

	test('should render a tag page and an author page', async ({ page }) => {
		await page.goto('/blog/tag/seo')
		await expect(page.locator('h1').first()).toHaveText('SEO')
		await expect(
			page.locator('article a[href^="/blog/"]').first()
		).toBeVisible()

		await page.goto('/blog/author/richard-hudson')
		await expect(page.locator('h1').first()).toHaveText('Richard Hudson')
		await expect(
			page.locator('article a[href^="/blog/"]').first()
		).toBeVisible()
	})

	test('should return 404 for an unknown slug', async ({ page }) => {
		const response = await page.goto('/blog/wp-login.php')
		expect(response?.status()).toBe(404)
	})

	test('should serve social cards for known slugs and 404 unknown ones', async ({
		page,
		request
	}) => {
		const slug = 'workflow-automation-tools-small-business'
		await page.goto(`/blog/${slug}`)

		// Image route paths carry a build hash, so read them off the page.
		for (const property of ['og:image', 'twitter:image']) {
			const attr = property.startsWith('og:') ? 'property' : 'name'
			const content = await page
				.locator(`meta[${attr}="${property}"]`)
				.first()
				.getAttribute('content')
			expect(content).toBeTruthy()
			const { pathname } = new URL(content ?? '')

			const known = await request.get(pathname)
			expect(known.status()).toBe(200)
			expect(known.headers()['content-type']).toBe('image/png')

			const unknown = await request.get(
				pathname.replace(`/blog/${slug}/`, '/blog/wp-login.php/')
			)
			expect(unknown.status()).toBe(404)
		}
	})
})
