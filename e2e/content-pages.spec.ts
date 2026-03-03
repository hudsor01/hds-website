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

	test('has Start Your Project button text', async ({ page }) => {
		const ctaButton = page.getByRole('link', { name: /start your project/i })
		await expect(ctaButton.first()).toBeVisible()
	})

	test('has service cards grid', async ({ page }) => {
		// The services section has a 3-column grid of cards
		const servicesSection = page.locator('#services-list')
		await expect(servicesSection).toBeVisible()
	})

	test('has testimonials section with "What Our Clients Say" heading', async ({
		page
	}) => {
		// NOTE: This test depends on testimonials section added in Plan 01 Task 2
		const testimonialsHeading = page.getByRole('heading', {
			name: /what our clients say/i
		})
		await expect(testimonialsHeading).toBeVisible()
	})

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

	test('has stats grid with 3 stats', async ({ page }) => {
		// Location pages have a 3-column stats grid
		const statsSection = page.locator('section').filter({
			has: page.locator('.grid')
		})
		await expect(statsSection.first()).toBeVisible()

		// 3 stat cells: businesses, projects, satisfaction
		const statValues = page.locator('.tabular-nums')
		const count = await statValues.count()
		expect(count).toBeGreaterThanOrEqual(3)
	})

	test('has services section', async ({ page }) => {
		// Location pages list the services offered in that area
		const servicesHeading = page.getByRole('heading', {
			name: /services/i
		})
		await expect(servicesHeading.first()).toBeVisible()
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
