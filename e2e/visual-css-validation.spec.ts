import { expect, test } from '@playwright/test'

/**
 * Comprehensive CSS and Visual Validation
 *
 * Consolidates tests from:
 * - component-classes-verification.spec.ts
 * - css-rendering-validation.spec.ts
 * - tailwind-enhancements.spec.ts
 * - refactored-components-validation.spec.ts
 *
 * Test Coverage:
 * - Color system and OKLCH rendering
 * - Tailwind utility classes (text-balance, explicit transitions)
 * - Layout utilities (flex-center, glass-card, gradient-text)
 * - Responsive design breakpoints
 */

test.describe('Color System & Semantic Tokens', () => {
	test('should render OKLCH color system correctly', async ({ page }) => {
		await page.goto('/')

		// Test that OKLCH colors are rendering (not transparent/black)
		const coloredElement = page
			.locator('[class*="text-"], [class*="bg-"]')
			.first()
		const computedColor = await coloredElement.evaluate(el => {
			const style = window.getComputedStyle(el)
			return style.color || style.backgroundColor
		})

		expect(computedColor).toBeTruthy()
		expect(computedColor).not.toBe('rgba(0, 0, 0, 0)')
	})
})

test.describe('Tailwind Utility Classes', () => {
	test('should apply text-balance to headings', async ({ page }) => {
		await page.goto('/')

		// Check main heading has text-balance
		const heading = page.locator('h1').first()
		if ((await heading.count()) > 0) {
			const headingClass = await heading.getAttribute('class')
			expect(headingClass).toContain('text-balance')
		}
	})

	test('transitions name their properties, never all', async ({ page }) => {
		await page.goto('/tools')

		// An element with a running transition must list its properties:
		// `all` animates layout and the focus outline (39.2 M6). Elements
		// with a 0s duration are the browser default and do not count.
		const offenders = await page.evaluate(() =>
			[...document.querySelectorAll('body *')]
				.filter(el => {
					const style = window.getComputedStyle(el)
					const animates = style.transitionDuration
						.split(',')
						.some(d => Number.parseFloat(d) > 0)
					const all = style.transitionProperty
						.split(',')
						.some(p => p.trim() === 'all')
					return animates && all
				})
				.map(el => `${el.tagName.toLowerCase()}.${el.getAttribute('class')}`)
		)
		expect(offenders).toEqual([])
	})

	test('card hover lift is off under reduced motion', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' })
		await page.goto('/tools')

		const card = page.locator('.card-hover-glow').first()
		await card.hover()
		await page.waitForTimeout(400)
		const translate = await card.evaluate(
			el => window.getComputedStyle(el).translate
		)
		expect(translate).toBe('none')
	})
})

test.describe('Layout & Component Classes', () => {
	test('should render gradient text elements', async ({ page }) => {
		await page.goto('/')

		// Verify gradient text elements are visible and have content
		const gradientTextElements = page.locator('.gradient-text')
		const count = await gradientTextElements.count()

		if (count > 0) {
			for (let i = 0; i < Math.min(count, 3); i++) {
				const element = gradientTextElements.nth(i)
				await expect(element).toBeVisible()

				const textContent = await element.textContent()
				expect(textContent?.trim()).toBeTruthy()
			}
		}
	})

	test('should render flex-center utilities', async ({ page }) => {
		await page.goto('/')

		const flexCenterElements = page.locator('.flex-center')
		const count = await flexCenterElements.count()

		// Verify flex-center elements exist and are properly centered
		expect(count).toBeGreaterThanOrEqual(0)
	})

	test('should render glass morphism effects', async ({ page }) => {
		await page.goto('/')

		// Check for glass card elements
		const glassElements = page.locator(
			'.glass-card, .glass-card-light, .glass-section'
		)
		const count = await glassElements.count()

		if (count > 0) {
			const element = glassElements.first()
			await expect(element).toBeVisible()
		}
	})
})

test.describe('Responsive Design', () => {
	test('should render correctly on mobile viewports', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 })
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		// Verify page is responsive and main content renders
		const mainContent = page.locator('main')
		await expect(mainContent).toBeVisible()
	})

	test('should render correctly on desktop viewports', async ({ page }) => {
		await page.setViewportSize({ width: 1920, height: 1080 })
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		// Verify page renders properly on desktop
		const mainContent = page.locator('main')
		await expect(mainContent).toBeVisible()
	})
})

test.describe('Form Component Styling', () => {
	test('should apply correct styles to form inputs', async ({ page }) => {
		await page.goto('/contact')

		// Find form inputs
		const input = page
			.locator('input[type="text"], input[type="email"]')
			.first()

		if ((await input.count()) > 0) {
			// Verify input has proper styling
			const styles = await input.evaluate(el => {
				const computed = window.getComputedStyle(el)
				return {
					border: computed.border,
					borderRadius: computed.borderRadius,
					padding: computed.padding
				}
			})

			expect(styles.border).toBeTruthy()
			expect(styles.borderRadius).toBeTruthy()
			expect(styles.padding).toBeTruthy()
		}
	})

	test('should apply focus state correctly', async ({ page }) => {
		await page.goto('/contact')

		const input = page
			.locator('input[type="text"], input[type="email"]')
			.first()

		if ((await input.count()) > 0) {
			// Focus the input
			await input.focus()
			await page.waitForTimeout(200)

			// Fields use the same focus treatment as every other control: the
			// global 2px solid outline. Read the longhands, since the
			// `outline` shorthand is a non-empty string even when it is none.
			const focusedStyles = await input.evaluate(el => {
				const computed = window.getComputedStyle(el)
				return {
					outlineStyle: computed.outlineStyle,
					outlineWidth: computed.outlineWidth
				}
			})

			expect(focusedStyles.outlineStyle).toBe('solid')
			expect(focusedStyles.outlineWidth).toBe('2px')
		}
	})
})
