/**
 * Locations E2E Tests
 * =============================================================================
 *
 * Smoke tests for the /locations index page and a representative location slug.
 * Verifies routes resolve, pages render, and core UI elements are present.
 *
 * Strategy: smoke-test level — confirm page loads and key elements visible.
 * Full SEO verification and structured data tests are out of scope.
 */

import { expect, test } from '@playwright/test'

test.describe('Locations Index', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/locations')
		await page.waitForLoadState('networkidle')
	})

	test('should display locations page heading', async ({ page }) => {
		await expect(page.locator('h1')).toBeVisible()
	})

	test('should link every DFW city page', async ({ page }) => {
		for (const slug of ['lewisville', 'dallas', 'fort-worth', 'arlington']) {
			await expect(page.locator(`a[href="/locations/${slug}"]`)).toHaveCount(1)
		}
	})

	test('should display a CTA link to /contact', async ({ page }) => {
		await expect(page.locator('a[href="/contact"]').first()).toBeVisible()
	})
})

test.describe('Dallas Location Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/locations/dallas')
		await page.waitForLoadState('networkidle')
	})

	test('should display Dallas content on the page', async ({ page }) => {
		await expect(page.locator('body')).toContainText('Dallas')
	})

	test('should display a contact CTA', async ({ page }) => {
		await expect(page.locator('a[href="/contact"]').first()).toBeVisible()
	})

	test('should not show a 404 error', async ({ page }) => {
		await expect(page.locator('body')).not.toContainText(/not found/i)
	})
})

test('a retired out-of-area city page redirects to /locations', async ({
	page
}) => {
	const response = await page.goto('/locations/phoenix')
	expect(response?.url()).toMatch(/\/locations$/)
	expect(response?.request().redirectedFrom()?.url()).toMatch(
		/\/locations\/phoenix$/
	)
})
