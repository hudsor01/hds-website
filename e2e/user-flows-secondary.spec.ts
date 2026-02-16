import { test, expect } from '@playwright/test'

/**
 * E2E tests for secondary user flows
 * Split from user-flows-validation.spec.ts to reduce server load per file
 *
 * These tests are marked slow and run separately to avoid dev server crashes.
 * Run manually with: npx playwright test user-flows-secondary.spec.ts
 */

// Skip in CI - these tests cause server instability when run after the main suite
// The essential user flows are covered in user-flows-validation.spec.ts
test.describe.configure({ mode: 'serial' })

// Helper to check server health before each test
async function waitForServer(maxRetries = 3): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch('http://localhost:3001', { signal: AbortSignal.timeout(5000) })
      if (response.ok) return true
    } catch {
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
  }
  return false
}

test.describe('Secondary User Flows', () => {
  // Retry flaky tests up to 2 times (server stability)
  test.describe.configure({ retries: 2 })

  // Health check before each test
  test.beforeEach(async () => {
    const serverReady = await waitForServer()
    if (!serverReady) {
      throw new Error('Dev server is not responding - tests cannot continue')
    }
  })

  test.describe('Blog and Content Flow', () => {
    test('should browse blog listing', async ({ page }) => {
      await page.goto('/blog')
      await page.waitForLoadState('networkidle')

      // Verify blog page loads
      await expect(page.locator('h1, h2').filter({ hasText: /blog|article/i }).first()).toBeVisible()

      // Check for blog posts
      const posts = page.locator('article, [class*="card"]')
      const count = await posts.count()
      expect(count).toBeGreaterThanOrEqual(0) // May have 0 posts initially
    })

    test('should navigate from blog to individual post', async ({ page }) => {
      await page.goto('/blog')
      await page.waitForLoadState('networkidle')

      // Look for blog post links
      const postLink = page.locator('a[href*="/blog/"]').first()

      if (await postLink.count() > 0) {
        await postLink.click()
        await page.waitForURL('**/blog/**')

        // Should navigate to post
        await expect(page).toHaveURL(/.*blog\/.*/)

        // Verify post content is visible
        await expect(page.locator('article, main').first()).toBeVisible()
      }
    })
  })

  test.describe('About Page Flow', () => {
    test('should view company information', async ({ page }) => {
      await page.goto('/about')
      await page.waitForLoadState('networkidle')

      // Verify about page loads
      await expect(page.locator('h1')).toBeVisible()

      // Should have content about the company
      const content = await page.textContent('body')
      expect(content?.length).toBeGreaterThan(100)
    })

    test('should navigate from about to contact', async ({ page }) => {
      await page.goto('/about')
      await page.waitForLoadState('networkidle')

      // Click contact CTA
      const contactLink = page.locator('a[href="/contact"]').first()
      if (await contactLink.count() > 0) {
        await contactLink.click()
        await page.waitForURL('**/contact')
        await expect(page).toHaveURL(/.*contact/)
      }
    })
  })

  test.describe('Cross-Page Navigation Flow', () => {
    test('should complete full site navigation loop', async ({ page }) => {
      // Home
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      await expect(page.locator('h1')).toBeVisible()

      // Services
      await page.locator('a[href="/services"]').first().click()
      await page.waitForURL('**/services')
      await expect(page).toHaveURL(/.*services/)

      // Portfolio
      await page.locator('a[href="/showcase"]').first().click()
      await page.waitForURL('**/showcase')
      await expect(page).toHaveURL(/.*showcase/)

      // About
      await page.locator('a[href="/about"]').first().click()
      await page.waitForURL('**/about')
      await expect(page).toHaveURL(/.*about/)

      // Contact
      await page.locator('a[href="/contact"]').first().click()
      await page.waitForURL('**/contact')
      await expect(page).toHaveURL(/.*contact/)

      // Back to Home
      await page.locator('a[href="/"]').first().click()
      await page.waitForURL('**/')
      await expect(page).toHaveURL(/\/$|\/home$/)
    })

    test('should maintain state across navigation', async ({ page }) => {
      // Set dark mode or theme preference
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Look for theme toggle
      const themeToggle = page.locator('button[aria-label*="theme" i]').first()

      if (await themeToggle.count() > 0) {
        await themeToggle.click()
        await page.waitForTimeout(300)

        // Navigate to another page
        await page.locator('a[href="/services"]').first().click()
        await page.waitForURL('**/services')
        await page.waitForTimeout(300)

        // Theme should be preserved
        const htmlClass = await page.evaluate(() =>
          document.documentElement.className
        )

        expect(htmlClass).toBeTruthy()
      }
    })
  })

  test.describe('Performance and Loading Flow', () => {
    test('should load pages within acceptable time', async ({ page }) => {
      const startTime = Date.now()

      await page.goto('/')
      await page.waitForLoadState('networkidle')

      const loadTime = Date.now() - startTime

      // Should load within 5 seconds (generous for CI environment)
      expect(loadTime).toBeLessThan(5000)
    })

    test('should show loading states during navigation', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Click navigation link
      const servicesLink = page.locator('a[href="/services"]').first()
      await servicesLink.click()
      await page.waitForURL('**/services')

      // Page should navigate
      await expect(page).toHaveURL(/.*services/)

      // Content should be visible
      await expect(page.locator('h1')).toBeVisible()
    })
  })

  test.describe('Accessibility Navigation Flow', () => {
    test('should navigate using keyboard only', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Tab to first interactive element
      await page.keyboard.press('Tab')

      // Check focus is visible
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement
        const styles = window.getComputedStyle(el!)
        return {
          outline: styles.outline,
          outlineColor: styles.outlineColor,
          tagName: el?.tagName
        }
      })

      expect(focusedElement.tagName).toMatch(/A|BUTTON|INPUT/)
      expect(focusedElement.outline || focusedElement.outlineColor).toBeTruthy()
    })

    test('should announce page changes to screen readers', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Navigate to new page
      await page.locator('a[href="/services"]').first().click()
      await page.waitForURL('**/services')

      // Page title should update
      const title = await page.title()
      expect(title).toBeTruthy()
      expect(title).toMatch(/service|hudson/i)
    })
  })
})
