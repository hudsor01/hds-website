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

	for (const slug of [
		'spf-dkim-dmarc-for-small-business-email',
		'beyond-just-works-why-businesses-need-websites-that-dominate'
	]) {
		test(`table of contents links resolve on ${slug}`, async ({ page }) => {
			await page.setViewportSize({ width: 1280, height: 900 })
			await page.goto(`/blog/${slug}`)
			const links = page.locator('nav[aria-label="Table of contents"] a')
			await expect(links.first()).toBeVisible()

			const items = await links.evaluateAll((els: Element[]) =>
				els.map(el => ({
					href: el.getAttribute('href') ?? '',
					text: el.textContent ?? ''
				}))
			)
			expect(items.length).toBeGreaterThanOrEqual(2)
			for (const { href, text } of items) {
				expect(text).not.toContain('&')
				const id = decodeURIComponent(href.replace(/^#/, ''))
				await expect(page.locator(`[id="${id}"]`)).toHaveCount(1)
			}

			const last = items.at(-1)
			if (!last) {
				throw new Error('table of contents is empty')
			}
			await links.last().click()
			await expect(
				page.locator(`[id="${decodeURIComponent(last.href.slice(1))}"]`)
			).toBeInViewport()
		})
	}

	for (const path of [
		'/blog',
		'/blog/tag/seo',
		'/blog/tag/business',
		'/blog/author/richard-hudson'
	]) {
		test(`heading levels never skip on ${path}`, async ({ page }) => {
			await page.goto(path)
			await expect(page.locator('main h1')).toHaveCount(1)
			await expect(page.locator('main article').first()).toBeVisible()
			const levels = await page
				.locator('main :is(h1, h2, h3, h4, h5, h6)')
				.evaluateAll((els: Element[]) =>
					els.map(el => Number(el.tagName.slice(1)))
				)
			expect(levels[0]).toBe(1)
			for (let i = 1; i < levels.length; i++) {
				const previous = levels[i - 1] ?? 1
				expect(levels[i] ?? 1).toBeLessThanOrEqual(previous + 1)
			}
		})
	}

	test('listing pages link to each other and stay disjoint', async ({
		page
	}) => {
		await page.goto('/blog')
		const pager = page.locator('nav[aria-label="Blog pages"]')
		await expect(pager.locator('a[href="/blog/page/2"]').first()).toBeVisible()

		const allArticles = (scope: string) =>
			page
				.locator(`${scope} article a[href^="/blog/"]`)
				.evaluateAll((els: Element[]) =>
					els.map(el => el.getAttribute('href') ?? '')
				)
		const scope = 'div.flex-1'
		const firstPage = await allArticles(scope)
		expect(firstPage).toHaveLength(10)

		const response = await page.goto('/blog/page/2')
		expect(response?.status()).toBe(200)
		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
			'href',
			'https://hudsondigitalsolutions.com/blog/page/2'
		)
		const secondPage = await allArticles(scope)
		expect(secondPage).toHaveLength(10)
		expect(secondPage.filter(href => firstPage.includes(href))).toEqual([])
		await expect(
			page.locator('nav[aria-label="Blog pages"] a[aria-current="page"]')
		).toHaveText('2')
	})

	test('page 1 redirects to /blog and out-of-range pages 404', async ({
		page,
		request
	}) => {
		await page.goto('/blog/page/1')
		await expect(page).toHaveURL(/\/blog$/)

		for (const path of ['/blog/page/999', '/blog/page/abc', '/blog/page/0']) {
			const response = await request.get(path)
			expect(response.status()).toBe(404)
		}
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
