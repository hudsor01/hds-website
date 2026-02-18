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

import { test, expect } from '@playwright/test'

test.describe('Locations Index', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/locations')
    await page.waitForLoadState('networkidle')
  })

  test('should display locations page heading', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should display at least 11 state section headings', async ({ page }) => {
    const stateSections = page.locator('h2')
    const count = await stateSections.count()
    expect(count).toBeGreaterThanOrEqual(11)
  })

  test('should display at least 75 city links', async ({ page }) => {
    const cityLinks = page.locator('a[href^="/locations/"]')
    const count = await cityLinks.count()
    expect(count).toBeGreaterThanOrEqual(75)
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
