/**
 * Blog Journey E2E Tests
 * =============================================================================
 *
 * Tests the blog listing page and slug navigation. Key assertion: confirms
 * real (n8n auto-generated) posts exist at /blog, not just Phase 42 placeholders.
 *
 * DB state (confirmed 2026-02-24): 8 published posts — 3 Phase-42 placeholders,
 * 5 n8n auto-generated. Placeholder slugs are stable (not regenerated).
 */

import { test, expect, type TestInfo } from '@playwright/test'
import { createTestLogger } from './test-logger'

// Phase 42 placeholder slugs — seeded during blog data strategy phase.
// Test must confirm at least 1 NON-placeholder post is visible.
const PLACEHOLDER_SLUGS = [
  'small-business-website-cost-2025',
  'how-to-increase-website-conversion-rates-2025-guide',
  'beyond-just-works-why-businesses-need-websites-that-dominate',
]

test.describe('Blog Journey', () => {
  test('should show at least one post card on /blog', async ({ page }, testInfo: TestInfo) => {
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

  test('should show at least one real (non-placeholder) post on /blog', async ({ page }, testInfo: TestInfo) => {
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

    // At least one slug must be from the n8n pipeline (not a Phase 42 placeholder)
    const realPostCount = slugs.filter(slug => !PLACEHOLDER_SLUGS.includes(slug)).length
    expect(realPostCount).toBeGreaterThanOrEqual(1)
    logger.complete(`${realPostCount} real (non-placeholder) post(s) confirmed`)
  })

  test('should navigate to a blog post and render content', async ({ page }, testInfo: TestInfo) => {
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
    await expect(page.locator('h1')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('article')).toBeVisible()
    await expect(page.locator('body')).not.toContainText(/not found/i)
    logger.complete(`Post page rendered at ${page.url()}`)
  })

  test('should not show empty state on /blog', async ({ page }) => {
    await page.goto('/blog')
    await page.waitForLoadState('networkidle')

    // Empty state text must NOT appear
    const emptyState = page.locator('text=No articles found. Check back soon for new content!')
    await expect(emptyState).not.toBeVisible()
  })
})
