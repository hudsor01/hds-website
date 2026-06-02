/**
 * Tools E2E Tests
 * =============================================================================
 *
 * Smoke tests for the /tools index page and key tool generator pages.
 * Verifies routes resolve, pages render, and core UI elements are present.
 *
 * Strategy: smoke-test level — confirm page loads and key elements visible.
 * Full interaction tests (form submission, PDF generation) are out of scope.
 */

import { expect, test } from '@playwright/test'

test.describe('Tools Index', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/tools')
		await page.waitForLoadState('networkidle')
	})

	test('should display tools page heading', async ({ page }) => {
		await expect(page.locator('h1')).toBeVisible()
		await expect(page.locator('h1')).toContainText(/business tools/i)
	})

	test('should display tool cards linking to /tools/*', async ({ page }) => {
		const toolLinks = page.locator('a[href^="/tools/"]')
		const count = await toolLinks.count()
		expect(count).toBeGreaterThanOrEqual(13)
	})

	test('should link to the paystub calculator', async ({ page }) => {
		await expect(
			page.locator('a[href="/tools/paystub-calculator"]')
		).toBeVisible()
	})

	test('should link to the invoice generator', async ({ page }) => {
		await expect(
			page.locator('a[href="/tools/invoice-generator"]')
		).toBeVisible()
	})

	test('should link to the contract generator', async ({ page }) => {
		await expect(
			page.locator('a[href="/tools/contract-generator"]')
		).toBeVisible()
	})
})

test.describe('Paystub Calculator', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/tools/paystub-calculator')
		await page.waitForLoadState('networkidle')
	})

	test('should display paystub page heading', async ({ page }) => {
		const heading = page
			.locator('h1, h2')
			.filter({ hasText: /paystub/i })
			.first()
		await expect(heading).toBeVisible()
	})

	test('should display at least one input field', async ({ page }) => {
		const inputs = page.locator('input, textarea')
		expect(await inputs.count()).toBeGreaterThan(0)
	})

	test('tax year dropdown offers only 2025 (no 2023/2024)', async ({
		page
	}) => {
		await page.locator('#taxYear').click()
		const options = page.locator('[role="option"]')
		await expect(options.filter({ hasText: '2025' })).toHaveCount(1)
		await expect(options.filter({ hasText: '2024' })).toHaveCount(0)
		await expect(options.filter({ hasText: '2023' })).toHaveCount(0)
	})
})

test.describe('Paystub Calculator URL restore (PAYSTUB-10 intersect)', () => {
	test('?state=AL (unsupported) does NOT select Alabama', async ({ page }) => {
		await page.goto('/tools/paystub-calculator?state=AL')
		await page.waitForLoadState('networkidle')
		// The state trigger keeps its placeholder; an unsupported code is dropped.
		const stateTrigger = page.locator('#state')
		await expect(stateTrigger).not.toContainText(/alabama/i)
		await expect(stateTrigger).toContainText(/select state/i)
	})

	test('?state=ca (supported, lowercase) selects California', async ({
		page
	}) => {
		await page.goto('/tools/paystub-calculator?state=ca')
		await page.waitForLoadState('networkidle')
		await expect(page.locator('#state')).toContainText(/california/i)
	})

	test('?state=TX (no-income-tax) selects Texas', async ({ page }) => {
		await page.goto('/tools/paystub-calculator?state=TX')
		await page.waitForLoadState('networkidle')
		await expect(page.locator('#state')).toContainText(/texas/i)
	})

	test('?year=2024 (stale) clamps to 2025, does not block the form', async ({
		page
	}) => {
		await page.goto('/tools/paystub-calculator?year=2024')
		await page.waitForLoadState('networkidle')
		// A stale year is clamped to the supported default; the trigger shows 2025.
		await expect(page.locator('#taxYear')).toContainText('2025')
		await expect(page.locator('#taxYear')).not.toContainText('2024')
	})
})

test.describe('Invoice Generator', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/tools/invoice-generator')
		await page.waitForLoadState('networkidle')
	})

	test('should display invoice page heading', async ({ page }) => {
		const heading = page
			.locator('h1, h2')
			.filter({ hasText: /invoice/i })
			.first()
		await expect(heading).toBeVisible()
	})

	test('should display at least one input field or button', async ({
		page
	}) => {
		const interactive = page.locator(
			'input, textarea, button[type="button"], button[type="submit"]'
		)
		expect(await interactive.count()).toBeGreaterThan(0)
	})
})

test.describe('Contract Generator', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/tools/contract-generator')
		await page.waitForLoadState('networkidle')
	})

	test('should display contract page heading', async ({ page }) => {
		const heading = page
			.locator('h1, h2')
			.filter({ hasText: /contract/i })
			.first()
		await expect(heading).toBeVisible()
	})

	test('should display at least one input field or button', async ({
		page
	}) => {
		const interactive = page.locator(
			'input, textarea, button[type="button"], button[type="submit"]'
		)
		expect(await interactive.count()).toBeGreaterThan(0)
	})
})
