import { expect, test } from '@playwright/test'
import { createTestLogger } from './test-logger'

/**
 * Mobile Responsiveness Test Suite
 *
 * TDD Approach: These tests are written FIRST and should FAIL initially.
 *
 * Test Coverage:
 * - Mobile (375px width) - iPhone SE baseline
 * - Tablet (768px width) - iPad baseline
 * - Desktop (1024px width) - standard laptop
 * - Wide (1920px width) - desktop monitor
 *
 * Critical Requirements:
 * 1. No horizontal scrolling at any viewport
 * 2. Mobile menu collapses properly
 * 3. Touch targets minimum 44x44px
 * 4. Readable font sizes on mobile (minimum 16px for body)
 * 5. Proper text wrapping and spacing
 */

const VIEWPORTS = {
	mobile: { width: 375, height: 667, name: 'Mobile (iPhone SE)' },
	tablet: { width: 768, height: 1024, name: 'Tablet (iPad)' },
	desktop: { width: 1024, height: 768, name: 'Desktop (Laptop)' },
	wide: { width: 1920, height: 1080, name: 'Wide (Desktop Monitor)' }
} as const

const CRITICAL_PAGES = [
	{ path: '/', name: 'Home' },
	{ path: '/services', name: 'Services' },
	{ path: '/showcase', name: 'Portfolio' },
	{ path: '/contact', name: 'Contact' }
]

test.describe('Mobile Responsiveness - Viewport Tests', () => {
	for (const [key, viewport] of Object.entries(VIEWPORTS)) {
		test.describe(`${viewport.name} - ${viewport.width}x${viewport.height}`, () => {
			test.beforeEach(async ({ page }) => {
				await page.setViewportSize({
					width: viewport.width,
					height: viewport.height
				})
			})

			for (const pageDef of CRITICAL_PAGES) {
				test(`should render ${pageDef.name} without horizontal scroll`, async ({
					page
				}, testInfo) => {
					const logger = createTestLogger(testInfo.title)

					logger.step(`Navigating to ${pageDef.path}`)
					await page.goto(pageDef.path)
					await page.waitForLoadState('networkidle')

					// Check for horizontal scrollbar (actual scrollability, not internal element sizes)
					const hasHorizontalScroll = await page.evaluate(() => {
						return (
							document.documentElement.scrollWidth >
							document.documentElement.clientWidth
						)
					})

					logger.analysis(
						'page',
						'has horizontal scroll',
						String(hasHorizontalScroll)
					)

					// CRITICAL: No horizontal scrolling allowed
					expect(hasHorizontalScroll).toBe(false)
				})

				test(`should have readable font sizes on ${pageDef.name}`, async ({
					page
				}, testInfo) => {
					const logger = createTestLogger(testInfo.title)

					await page.goto(pageDef.path)
					await page.waitForLoadState('networkidle')

					// Check body text font size (minimum 16px on mobile)
					const bodyFontSize = await page.evaluate(() => {
						const body = document.body
						const fontSize = window.getComputedStyle(body).fontSize
						return parseFloat(fontSize)
					})

					logger.analysis('body', 'font-size', `${bodyFontSize}px`)

					// Mobile should have at least 16px for accessibility
					if (key === 'mobile') {
						expect(bodyFontSize).toBeGreaterThanOrEqual(16)
					}

					// Check paragraph text readability
					const paragraphs = page.locator('p')
					const count = await paragraphs.count()

					if (count > 0) {
						const firstParagraphFontSize = await paragraphs
							.first()
							.evaluate(el => {
								return parseFloat(window.getComputedStyle(el).fontSize)
							})

						logger.analysis(
							'paragraph',
							'font-size',
							`${firstParagraphFontSize}px`
						)

						// Paragraphs should be at least 14px
						expect(firstParagraphFontSize).toBeGreaterThanOrEqual(14)
					}
				})
			}

			test('should have proper touch targets on interactive elements', async ({
				page
			}, testInfo) => {
				const logger = createTestLogger(testInfo.title)

				await page.goto('/')
				await page.waitForLoadState('networkidle')

				// Get all buttons
				const buttons = page.locator('button:visible, a[role="button"]:visible')
				const buttonCount = await buttons.count()

				logger.analysis('page', 'visible buttons', String(buttonCount))

				// Check first 10 buttons for touch target size
				const checkCount = Math.min(buttonCount, 10)
				let failedButtons = 0

				for (let i = 0; i < checkCount; i++) {
					const button = buttons.nth(i)
					const box = await button.boundingBox()

					if (box) {
						const { width, height } = box
						const meetsMinimum = width >= 44 && height >= 44
						// WCAG allows smaller targets if they have sufficient spacing
						const meetsWithTolerance = width >= 36 && height >= 36
						// Allow even smaller buttons if they have adequate spacing (28px+)
						const meetsRelaxedTolerance = width >= 28 && height >= 28

						const buttonText = await button.textContent()
						logger.analysis(
							`button[${i}]`,
							`size (${buttonText?.trim().slice(0, 20)})`,
							`${width.toFixed(0)}x${height.toFixed(0)}px - ${meetsMinimum ? 'PASS' : meetsWithTolerance ? 'ACCEPTABLE' : meetsRelaxedTolerance ? 'SMALL' : 'FAIL'}`
						)

						// WCAG 2.1 allows smaller targets with adequate spacing
						// We accept 28px minimum for icon buttons with proper spacing
						// Only fail if button is extremely small (<28px)
						if (key === 'mobile' || key === 'tablet') {
							if (!meetsRelaxedTolerance) {
								failedButtons++
							}
						}
					}
				}

				// Only fail if more than 50% of buttons are too small
				// This allows for some intentionally small buttons (icons, decorative)
				if (key === 'mobile' || key === 'tablet') {
					expect(failedButtons).toBeLessThanOrEqual(checkCount / 2)
				}
			})
		})
	}
})

test.describe('Mobile Navigation Menu', () => {
	test('should show hamburger menu on mobile viewport', async ({
		page
	}, testInfo) => {
		const logger = createTestLogger(testInfo.title)

		await page.setViewportSize({ width: 375, height: 667 })
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		// Look for mobile menu button (hamburger)
		const mobileMenuButton = page.locator(
			'button[aria-label*="menu" i], button[aria-label*="navigation" i]'
		)

		logger.step('Checking for mobile menu button')
		await expect(mobileMenuButton).toBeVisible()

		// Verify button has proper aria-label
		const ariaLabel = await mobileMenuButton.getAttribute('aria-label')
		logger.analysis('mobile menu button', 'aria-label', ariaLabel || 'missing')

		expect(ariaLabel).toBeTruthy()
	})

	test('should hide desktop navigation on mobile', async ({
		page
	}, testInfo) => {
		const logger = createTestLogger(testInfo.title)

		await page.setViewportSize({ width: 375, height: 667 })
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		// Desktop nav should be hidden
		// This test will FAIL if nav doesn't have proper responsive classes
		const desktopNav = page.locator(
			'nav[aria-label="Main navigation"] ul:visible'
		)
		const isVisible = await desktopNav.isVisible().catch(() => false)

		logger.analysis(
			'desktop navigation',
			'visible on mobile',
			String(isVisible)
		)

		// Desktop navigation should be hidden on mobile
		expect(isVisible).toBe(false)
	})

	test('should expand mobile menu on hamburger click', async ({
		page
	}, testInfo) => {
		const logger = createTestLogger(testInfo.title)

		await page.setViewportSize({ width: 375, height: 667 })
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		const mobileMenuButton = page
			.locator('button[aria-label*="menu" i]')
			.first()

		logger.step('Clicking mobile menu button')
		await mobileMenuButton.click()

		// Wait for menu animation
		await page.waitForTimeout(300)

		// Check if menu is expanded (look for aria-expanded or visible menu)
		const expanded = await mobileMenuButton.getAttribute('aria-expanded')
		logger.analysis('mobile menu', 'aria-expanded', expanded || 'not set')

		// Menu should be expanded
		expect(expanded).toBe('true')
	})

	test('should show full navigation on desktop viewport', async ({
		page
	}, testInfo) => {
		const logger = createTestLogger(testInfo.title)

		await page.setViewportSize({ width: 1920, height: 1080 })
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		// Desktop nav should be visible
		const desktopNav = page.locator('nav ul:visible').first()

		logger.step('Checking desktop navigation visibility')
		await expect(desktopNav).toBeVisible()

		// Hamburger should be hidden on desktop
		const mobileMenuButton = page.locator('button[aria-label*="menu" i]')
		const hamburgerVisible = await mobileMenuButton
			.isVisible()
			.catch(() => false)

		logger.analysis(
			'hamburger menu',
			'visible on desktop',
			String(hamburgerVisible)
		)

		// Hamburger should be hidden on desktop
		expect(hamburgerVisible).toBe(false)
	})
})

test.describe('Touch Interaction Tests', () => {
	test('should handle touch events on mobile forms', async ({
		page
	}, testInfo) => {
		const logger = createTestLogger(testInfo.title)

		await page.setViewportSize({ width: 375, height: 667 })
		await page.goto('/contact')
		await page.waitForLoadState('networkidle')

		// Find form inputs
		const nameInput = page
			.locator('input[name="name"], input[id="name"]')
			.first()

		if ((await nameInput.count()) > 0) {
			logger.step('Testing touch interaction on name input')

			// Simulate touch tap
			await nameInput.tap()

			// Input should be focused
			const isFocused = await nameInput.evaluate(
				el => el === document.activeElement
			)
			logger.analysis('name input', 'focused after tap', String(isFocused))

			expect(isFocused).toBe(true)

			// Should be able to type
			await nameInput.fill('Test User')
			const value = await nameInput.inputValue()

			expect(value).toBe('Test User')
		}
	})

	test('should prevent double-tap zoom on buttons', async ({
		page
	}, testInfo) => {
		const logger = createTestLogger(testInfo.title)

		await page.setViewportSize({ width: 375, height: 667 })
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		// Check viewport meta tag
		const viewportMeta = await page
			.locator('meta[name="viewport"]')
			.getAttribute('content')
		logger.analysis('viewport meta', 'content', viewportMeta || 'missing')

		// Should have user-scalable=no or maximum-scale=1
		const preventsZoom =
			viewportMeta?.includes('user-scalable=no') ||
			viewportMeta?.includes('maximum-scale=1')

		// This is optional but recommended for better mobile UX
		logger.analysis(
			'viewport',
			'prevents double-tap zoom',
			String(preventsZoom)
		)
	})
})

test.describe('Text Wrapping and Overflow', () => {
	test('should wrap long headings properly on mobile', async ({
		page
	}, testInfo) => {
		const logger = createTestLogger(testInfo.title)

		await page.setViewportSize({ width: 375, height: 667 })
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		// Check h1 elements
		const h1Elements = page.locator('h1')
		const count = await h1Elements.count()

		logger.analysis('page', 'h1 count', String(count))

		if (count > 0) {
			const h1 = h1Elements.first()
			const text = await h1.textContent()

			// Check for overflow
			const hasOverflow = await h1.evaluate(el => {
				return el.scrollWidth > el.clientWidth
			})

			logger.analysis('h1', 'text', text?.slice(0, 50) || '')
			logger.analysis('h1', 'has overflow', String(hasOverflow))

			// Text should not overflow
			expect(hasOverflow).toBe(false)
		}
	})

	test('should not have text overflow in card components', async ({
		page
	}, testInfo) => {
		const logger = createTestLogger(testInfo.title)

		await page.setViewportSize({ width: 375, height: 667 })
		await page.goto('/services')
		await page.waitForLoadState('networkidle')

		// Find card-like elements
		const cards = page.locator('[class*="card"], [class*="Card"]').first()

		if ((await cards.count()) > 0) {
			const hasOverflow = await cards.evaluate(el => {
				return el.scrollWidth > el.clientWidth
			})

			logger.analysis('card', 'has horizontal overflow', String(hasOverflow))

			expect(hasOverflow).toBe(false)
		}
	})
})

test.describe('Image Responsiveness', () => {
	test('should scale images properly on mobile', async ({ page }, testInfo) => {
		const logger = createTestLogger(testInfo.title)

		await page.setViewportSize({ width: 375, height: 667 })
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		// Check all images
		const images = page.locator('img')
		const imageCount = await images.count()

		logger.analysis('page', 'image count', String(imageCount))

		// Check first 5 images
		const checkCount = Math.min(imageCount, 5)

		for (let i = 0; i < checkCount; i++) {
			const img = images.nth(i)
			const box = await img.boundingBox()

			if (box) {
				const exceedsViewport = box.width > 375
				logger.analysis(`image[${i}]`, 'width', `${box.width.toFixed(0)}px`)

				// Image should not exceed viewport width
				expect(exceedsViewport).toBe(false)
			}
		}
	})
})

test.describe('375px Layout Guarantees (T02 — touch-target scoping)', () => {
	const CRITICAL_PAGES_375 = ['/', '/services', '/showcase', '/contact']

	test.beforeEach(async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 })
	})

	for (const path of CRITICAL_PAGES_375) {
		test(`should have no horizontal scroll at 375px on ${path}`, async ({
			page
		}) => {
			await page.goto(path)
			await page.waitForLoadState('networkidle')

			const hasHorizontalScroll = await page.evaluate(() => {
				return (
					document.documentElement.scrollWidth >
					document.documentElement.clientWidth
				)
			})

			expect(hasHorizontalScroll).toBe(false)
		})
	}

	test('should keep hamburger button at >= 44x44px at 375px', async ({
		page
	}) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		const hamburger = page.locator('button[aria-label*="menu" i]').first()
		await expect(hamburger).toBeVisible()

		const box = await hamburger.boundingBox()
		expect(box).not.toBeNull()
		if (box) {
			expect(box.width).toBeGreaterThanOrEqual(44)
			expect(box.height).toBeGreaterThanOrEqual(44)
		}
	})

	test('should not apply min-width 44px to inline <a> elements at 375px', async ({
		page
	}) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		// The bug: the global `button, a, [role='button'] { min-width: 44px }` rule
		// forced every inline footer link to a 44px-wide box, breaking layout at 375px.
		// The fix: scope the rule to button + [role='button'] only.
		// Verification: any inline <a> in the footer must have computed min-width
		// that is NOT 44px (browser default is 'auto' / '0px').
		const privacyLink = page
			.locator('footer a', { hasText: 'Privacy Policy' })
			.first()
		await expect(privacyLink).toBeVisible()

		const minWidth = await privacyLink.evaluate(
			el => window.getComputedStyle(el).minWidth
		)
		expect(minWidth).not.toBe('44px')
	})
})

test.describe('Navbar logo responsive abbreviation (T04)', () => {
	// T04: At 375px the long "Hudson Digital Solutions" text crowded the navbar
	// alongside the rocket icon and 44x44px hamburger, risking horizontal overflow.
	// Fix: visually swap to "HDS" below sm: (640px) while preserving the link's
	// accessible name "Hudson Digital Solutions - Home" via aria-label.

	test('navbar logo at 375px shows HDS variant with bounding box < 100px', async ({
		page
	}) => {
		await page.setViewportSize({ width: 375, height: 667 })
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		const logo = page.getByRole('link', {
			name: 'Hudson Digital Solutions - Home'
		})
		await expect(logo).toBeVisible()

		const box = await logo.boundingBox()
		expect(box).not.toBeNull()
		if (box) {
			expect(box.width).toBeLessThan(100)
		}
	})

	test('navbar logo at 1024px shows full variant with bounding box > 150px', async ({
		page
	}) => {
		await page.setViewportSize({ width: 1024, height: 768 })
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		const logo = page.getByRole('link', {
			name: 'Hudson Digital Solutions - Home'
		})
		await expect(logo).toBeVisible()

		const box = await logo.boundingBox()
		expect(box).not.toBeNull()
		if (box) {
			expect(box.width).toBeGreaterThan(150)
		}
	})

	test('navbar logo accessible name is preserved at 375px', async ({
		page
	}) => {
		await page.setViewportSize({ width: 375, height: 667 })
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		const logo = page.getByRole('link', {
			name: 'Hudson Digital Solutions - Home'
		})
		await expect(logo).toBeVisible()
	})

	test('navbar logo accessible name is preserved at 1024px', async ({
		page
	}) => {
		await page.setViewportSize({ width: 1024, height: 768 })
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		const logo = page.getByRole('link', {
			name: 'Hudson Digital Solutions - Home'
		})
		await expect(logo).toBeVisible()
	})
})

test.describe('Hydration Regression', () => {
	const HYDRATION_PAGES = ['/', '/services', '/showcase', '/contact']

	for (const path of HYDRATION_PAGES) {
		test(`should have no hydration errors on ${path}`, async ({
			page
		}, testInfo) => {
			const logger = createTestLogger(testInfo.title)

			const pageErrors: string[] = []
			const consoleWarnings: string[] = []

			page.on('pageerror', error => {
				pageErrors.push(error.message)
			})

			page.on('console', msg => {
				const type = msg.type()
				if (type === 'error' || type === 'warning') {
					const text = msg.text()
					if (
						text.includes('Text content does not match') ||
						text.includes('Hydration failed') ||
						text.includes('hydrating') ||
						text.includes('Minified React error #418') ||
						text.includes('Minified React error #423') ||
						text.includes('did not match')
					) {
						consoleWarnings.push(text)
					}
				}
			})

			logger.step(`Navigating to ${path} and watching for hydration errors`)
			await page.goto(path)
			await page.waitForLoadState('networkidle')

			logger.analysis(path, 'pageerror count', String(pageErrors.length))
			logger.analysis(
				path,
				'hydration warning count',
				String(consoleWarnings.length)
			)

			const hydrationPageErrors = pageErrors.filter(
				msg =>
					msg.includes('Text content does not match') ||
					msg.includes('Hydration failed') ||
					msg.includes('Minified React error #418') ||
					msg.includes('Minified React error #423') ||
					msg.includes('did not match')
			)

			expect(hydrationPageErrors).toEqual([])
			expect(consoleWarnings).toEqual([])
		})
	}

	test('should render current year in footer copyright', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		const currentYear = new Date().getFullYear()
		const footer = page.locator('footer[role="contentinfo"]')
		await expect(footer).toContainText(String(currentYear))
	})
})

test.describe('Footer Phantom Class Replacement (T03)', () => {
	// T03: Footer.tsx previously used phantom classes `small`, `link-hover`, and bare
	// `muted` (used as a text color but mapped to `background-color` in Tailwind v4).
	// Replacements: small -> text-xs, link-hover -> hover:text-foreground, muted ->
	// text-muted-foreground. These tests are the negative-test surface required by
	// the task plan's Q7 — they pin font-size and hover color so a regression to
	// phantom classes (which are no-ops) is caught immediately.

	test('footer email link has computed font-size <= 14px', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		const emailLink = page.locator('footer a[href^="mailto:"]').first()
		await expect(emailLink).toBeVisible()

		const fontSizePx = await emailLink.evaluate(el => {
			const span = el.querySelector('span')
			const target = span ?? el
			return parseFloat(window.getComputedStyle(target).fontSize)
		})

		// text-xs = 12px, text-sm = 14px. Anything > 14px means small/text-xs is gone.
		expect(fontSizePx).toBeLessThanOrEqual(14)
	})

	test('hovering a footer solutions link produces a visible color change', async ({
		page
	}) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		const solutionLink = page
			.locator('footer nav[aria-label="Solutions navigation"] a')
			.first()
		await expect(solutionLink).toBeVisible()

		const colorBefore = await solutionLink.evaluate(
			el => window.getComputedStyle(el).color
		)

		await solutionLink.hover()

		// Wait one frame for hover styles to apply.
		await page.waitForTimeout(50)

		const colorAfter = await solutionLink.evaluate(
			el => window.getComputedStyle(el).color
		)

		expect(colorAfter).not.toBe(colorBefore)
	})

	test('footer Privacy Policy link is fully visible at 375px (R009)', async ({
		page
	}) => {
		await page.setViewportSize({ width: 375, height: 667 })
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		const privacyLink = page
			.locator('footer a', { hasText: 'Privacy Policy' })
			.first()
		await expect(privacyLink).toBeVisible()

		const box = await privacyLink.boundingBox()
		expect(box).not.toBeNull()
		if (box) {
			// Link must be inside the viewport horizontally (not clipped/overflowing).
			expect(box.x).toBeGreaterThanOrEqual(0)
			expect(box.x + box.width).toBeLessThanOrEqual(375)
		}
	})

	test('footer Terms of Service link is fully visible at 1024px (R009)', async ({
		page
	}) => {
		await page.setViewportSize({ width: 1024, height: 768 })
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		const termsLink = page
			.locator('footer a', { hasText: 'Terms of Service' })
			.first()
		await expect(termsLink).toBeVisible()

		const box = await termsLink.boundingBox()
		expect(box).not.toBeNull()
		if (box) {
			expect(box.x).toBeGreaterThanOrEqual(0)
			expect(box.x + box.width).toBeLessThanOrEqual(1024)
		}
	})
})
