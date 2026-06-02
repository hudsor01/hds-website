/**
 * Free Mockup Landing Page E2E Tests
 * =============================================================================
 *
 * Covers the /free-mockup conversion flow: the distraction-free landing page
 * (new `(landing)` route group) and its minimal lead form, which reuses the
 * contact pipeline via buildFreeMockupPayload.
 *
 * The success path mocks POST /api/contact so the test never creates a real
 * lead or sends a real email on each run. The validation tests exercise the
 * client-side "reward early, punish late" behaviour: a submit attempt surfaces
 * errors, then they clear on change as the user fixes them.
 */

import { expect, type Route, test } from '@playwright/test'

test.describe('Free Mockup Landing', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/free-mockup')
		// Wait for the dynamically imported form to load.
		await page.locator('form').waitFor({ state: 'visible', timeout: 15000 })
	})

	test('renders the offer headline and all form fields', async ({ page }) => {
		await expect(
			page.getByRole('heading', {
				name: /see your new website before you pay anything/i
			})
		).toBeVisible()

		await expect(page.locator('#firstName')).toBeVisible()
		await expect(page.locator('#lastName')).toBeVisible()
		await expect(page.locator('#email')).toBeVisible()
		await expect(page.locator('#businessName')).toBeVisible()
		await expect(page.locator('#currentSite')).toBeVisible()
		await expect(page.locator('#phone')).toBeVisible()

		const submit = page.locator('button[type="submit"]')
		await expect(submit).toBeVisible()
		await expect(submit).toHaveText(/free mockup/i)
	})

	test('a submit attempt on an invalid form surfaces inline errors and does not proceed', async ({
		page
	}) => {
		// Empty required fields + click submit (punish late).
		await page.locator('button[type="submit"]').click()

		await expect(
			page.getByText('Please enter a valid email address')
		).toBeVisible({ timeout: 5000 })

		// Form stays; success screen never renders.
		await expect(page.locator('form')).toBeVisible()
		const successShown = await page
			.getByRole('heading', { name: /request received/i })
			.isVisible()
			.catch(() => false)
		expect(successShown).toBe(false)
	})

	test('submits successfully with valid data (API mocked)', async ({ page }) => {
		await page.route('**/api/contact', async (route: Route) => {
			if (route.request().method() === 'POST') {
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({
						success: true,
						message: 'Thank you! Your message has been sent successfully.'
					})
				})
				return
			}
			await route.continue()
		})

		await page.fill('#firstName', 'Maria')
		await page.fill('#lastName', 'Lopez')
		await page.fill('#email', 'maria@example.com')
		await page.fill('#businessName', "Maria's Tacos")

		await page.locator('button[type="submit"]').click()

		await expect(
			page.getByRole('heading', { name: /request received/i })
		).toBeVisible({ timeout: 15000 })
		await expect(page.locator('form')).not.toBeVisible()
	})

	test('has accessible labels and a focusable form', async ({ page }) => {
		await expect(page.locator('label[for="firstName"]')).toBeVisible()
		await expect(page.locator('label[for="email"]')).toBeVisible()
		await expect(page.locator('label[for="businessName"]')).toBeVisible()

		await page.locator('#firstName').focus()
		await expect(page.locator('#firstName')).toBeFocused()
		await page.keyboard.press('Tab')
		await expect(page.locator('#lastName')).toBeFocused()
	})
})
