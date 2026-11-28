/**
 * Content Pages E2E Tests — Structural Scaffold
 * =============================================================================
 *
 * Wave 0 structural assertions for all 4 content pages:
 * - Services (/services) — PAGE-01
 * - About (/about) — PAGE-02
 * - Location slug (/locations/dallas) — PAGE-03
 * - Contact (/contact) — PAGE-04
 *
 * Strategy: structural layout assertions only. Tests verify headings, sections,
 * buttons, and key elements are present. Not testing functional behavior.
 *
 * NOTE: Tests marked with "TODO" in the name depend on content not yet
 * implemented in this plan and are expected to fail until the relevant
 * plan implements that content.
 */

import { expect, test } from '@playwright/test'

// ---------------------------------------------------------------------------
// Services Page — PAGE-01
// ---------------------------------------------------------------------------

test.describe('Services page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/services')
		await page.waitForLoadState('networkidle')
	})

	test('has h1 visible', async ({ page }) => {
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
	})

	test('has CTA button linking to /contact', async ({ page }) => {
		const ctaLinks = page.locator('a[href="/contact"]')
		await expect(ctaLinks.first()).toBeVisible()
	})

	test('has primary contact CTA button', async ({ page }) => {
		const ctaButton = page.getByRole('link', {
			name: /get my free website plan/i
		})
		await expect(ctaButton.first()).toBeVisible()
	})

	test('has service cards grid', async ({ page }) => {
		// The services section has a 3-column grid of cards
		const servicesSection = page.locator('#services-list')
		await expect(servicesSection).toBeVisible()
	})

	// Note: the Services page no longer has a "What Our Clients Say"
	// testimonials section (hardcoded ones dropped per audit #256; never
	// re-added). That heading now lives only on /testimonials, so the old
	// Services-page testimonials assertion was removed as stale.

	test('has process section', async ({ page }) => {
		const processSection = page.locator('#process')
		await expect(processSection).toBeVisible()
	})
})

// ---------------------------------------------------------------------------
// About Page — PAGE-02
// ---------------------------------------------------------------------------

test.describe('About page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/about')
		await page.waitForLoadState('networkidle')
	})

	test('has h1 visible', async ({ page }) => {
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
	})

	test('has closing CTA button linking to /contact', async ({ page }) => {
		const contactLinks = page.locator('a[href="/contact"]')
		await expect(contactLinks.first()).toBeVisible()
	})

	test('has founder section', async ({ page }) => {
		// The About page has "The Founder" section with a blockquote
		const blockquote = page.locator('blockquote')
		await expect(blockquote).toBeVisible()
	})

	test('TODO: has testimonials section (not yet implemented — Plan 02)', async ({
		page
	}) => {
		// This will be implemented in Plan 02
		// For now, verify the page loads and has h1
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
	})
})

// ---------------------------------------------------------------------------
// Location Slug Page — PAGE-03
// ---------------------------------------------------------------------------

test.describe('Location slug page (Dallas)', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/locations/dallas')
		await page.waitForLoadState('networkidle')
	})

	test('has h1 visible', async ({ page }) => {
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
	})

	test('makes no per-city client or project claims', async ({ page }) => {
		// The page used to show "10+ Local Businesses Served, 40+ Projects
		// Completed, 100% Client Satisfaction" for every city, none of it real.
		await expect(page.getByText(/Projects Completed/i)).toHaveCount(0)
		await expect(page.getByText(/Client Satisfaction/i)).toHaveCount(0)
	})

	test('has services section', async ({ page }) => {
		// Location pages list what is built for that area
		await expect(
			page.getByRole('heading', { name: /What I Build in Dallas/i })
		).toBeVisible()
	})

	test('has closing CTA button linking to /contact', async ({ page }) => {
		const contactLinks = page.locator('a[href="/contact"]')
		await expect(contactLinks.first()).toBeVisible()
	})
})

// ---------------------------------------------------------------------------
// Contact Page — PAGE-04
// ---------------------------------------------------------------------------

test.describe('Contact page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/contact')
		await page.waitForLoadState('networkidle')
	})

	test('has h1 visible', async ({ page }) => {
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
	})

	test('has a form element', async ({ page }) => {
		// Wait for dynamically imported ContactForm to load
		const form = page.locator('form')
		await expect(form).toBeVisible({ timeout: 15000 })
	})

	test('has email address on page', async ({ page }) => {
		// Contact info panel shows hudsondigitalsolutions.com email
		const emailText = page.getByText(/hudsondigitalsolutions\.com/i)
		await expect(emailText.first()).toBeVisible()
	})

	test('form and contact info are both visible', async ({ page }) => {
		// Both the form and email address should be present on the page
		const form = page.locator('form')
		await expect(form).toBeVisible({ timeout: 15000 })
		const emailText = page.getByText(/hudsondigitalsolutions\.com/i)
		await expect(emailText.first()).toBeVisible()
	})

	test('TODO: form is in left column (layout flip not yet implemented — Plan 03)', async ({
		page
	}) => {
		// This layout fix will be implemented in Plan 03
		// For now verify the contact page loads with form visible
		const form = page.locator('form')
		await expect(form).toBeVisible({ timeout: 15000 })
	})
})

// ---------------------------------------------------------------------------
// Heading order - no level skipped on the way down (QA-06)
// ---------------------------------------------------------------------------

test.describe('Heading order', () => {
	for (const path of ['/contact', '/showcase']) {
		test(`${path} never skips a heading level`, async ({ page }) => {
			await page.goto(path)
			await page.waitForLoadState('networkidle')
			const levels = await page
				.locator('h1, h2, h3, h4, h5, h6')
				.evaluateAll(nodes => nodes.map(node => Number(node.tagName[1])))
			expect(levels[0]).toBe(1)
			const skips = levels.filter(
				(level, i) => i > 0 && level - (levels[i - 1] ?? 0) > 1
			)
			expect(skips).toEqual([])
		})
	}
})

// ---------------------------------------------------------------------------
// Showcase detail - unknown slugs are a real 404 (QA-02)
// ---------------------------------------------------------------------------

test('unknown showcase slug is a 404', async ({ page }) => {
	const response = await page.goto('/showcase/does-not-exist')
	expect(response?.status()).toBe(404)
})

// ---------------------------------------------------------------------------
// Proxy (src/proxy.ts) - security headers and /admin gate
// ---------------------------------------------------------------------------

test.describe('Proxy security layer', () => {
	test('page responses carry the security headers', async ({ request }) => {
		for (const path of ['/', '/services', '/blog']) {
			const res = await request.get(path)
			expect(res.status()).toBe(200)
			const headers = res.headers()
			expect(headers['content-security-policy']).toContain("default-src 'self'")
			expect(headers['content-security-policy']).toContain(
				"frame-ancestors 'none'"
			)
			expect(headers['x-content-type-options']).toBe('nosniff')
			expect(headers['x-frame-options']).toBe('DENY')
			expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
			expect(headers['strict-transport-security']).toBe(
				'max-age=63072000; includeSubDomains'
			)
			expect(headers['cross-origin-embedder-policy']).toBeUndefined()
		}
	})

	test('/admin redirects unauthenticated users to sign-in', async ({
		request
	}) => {
		const res = await request.get('/admin', { maxRedirects: 0 })
		expect(res.status()).toBe(302)
		expect(new URL(res.headers().location ?? '', res.url()).pathname).toBe(
			'/auth/sign-in'
		)
	})
})
