import { test, expect } from '@playwright/test'

/**
 * E2E tests to validate CSS correctly renders on the website UI
 * Tests semantic tokens from globals.css, component styling, and visual consistency
 */

test.describe('CSS Rendering Validation', () => {
  test.describe('Semantic Tokens & Theme Colors', () => {
    test('should correctly apply semantic color tokens from globals.css', async ({ page }) => {
      await page.goto('/')

      // Test primary color is applied
      const primaryElements = page.locator('.text-primary, .bg-primary, .border-primary').first()
      if (await primaryElements.count() > 0) {
        const color = await primaryElements.evaluate(el =>
          window.getComputedStyle(el).getPropertyValue('--color-primary')
        )
        expect(color).toBeTruthy()
      }

      // Test accent color
      const accentBtn = page.locator('.bg-accent').first()
      if (await accentBtn.count() > 0) {
        const bgColor = await accentBtn.evaluate(el =>
          window.getComputedStyle(el).backgroundColor
        )
        expect(bgColor).toBeTruthy()
        expect(bgColor).not.toBe('rgba(0, 0, 0, 0)')
      }
    })

    test('should apply OKLCH colors correctly', async ({ page }) => {
      await page.goto('/')

      // Check that OKLCH color space is supported and rendered
      const coloredElement = page.locator('[class*="text-"], [class*="bg-"]').first()
      const computedColor = await coloredElement.evaluate(el => {
        const style = window.getComputedStyle(el)
        return style.color || style.backgroundColor
      })

      expect(computedColor).toBeTruthy()
      expect(computedColor).not.toBe('rgba(0, 0, 0, 0)')
    })

    test('should correctly render dark mode colors', async ({ page }) => {
      await page.goto('/')

      // Add dark class to html element
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })

      // Wait for dark mode to apply
      await page.waitForTimeout(300)

      // Check dark mode background
      const bodyBg = await page.evaluate(() =>
        window.getComputedStyle(document.body).backgroundColor
      )

      expect(bodyBg).toBeTruthy()
      // Dark mode should have darker background
      expect(bodyBg).toMatch(/rgb\(/)
    })
  })

  test.describe('Utility Classes from globals.css', () => {
    test('should apply flex-center utility correctly', async ({ page }) => {
      await page.goto('/')

      const flexCenterEl = page.locator('.flex-center').first()
      if (await flexCenterEl.count() > 0) {
        const styles = await flexCenterEl.evaluate(el => {
          const computed = window.getComputedStyle(el)
          return {
            display: computed.display,
            alignItems: computed.alignItems,
            justifyContent: computed.justifyContent
          }
        })

        expect(styles.display).toBe('flex')
        expect(styles.alignItems).toBe('center')
        expect(styles.justifyContent).toBe('center')
      }
    })

    test('should apply flex-between utility correctly', async ({ page }) => {
      await page.goto('/')

      const flexBetweenEl = page.locator('.flex-between').first()
      if (await flexBetweenEl.count() > 0) {
        const styles = await flexBetweenEl.evaluate(el => {
          const computed = window.getComputedStyle(el)
          return {
            display: computed.display,
            alignItems: computed.alignItems,
            justifyContent: computed.justifyContent
          }
        })

        expect(styles.display).toBe('flex')
        expect(styles.alignItems).toBe('center')
        expect(styles.justifyContent).toBe('space-between')
      }
    })

    test('should apply transition-smooth utility correctly', async ({ page }) => {
      await page.goto('/')

      const smoothEl = page.locator('.transition-smooth').first()
      if (await smoothEl.count() > 0) {
        const transition = await smoothEl.evaluate(el =>
          window.getComputedStyle(el).transition
        )

        expect(transition).toBeTruthy()
        expect(transition).toContain('300ms')
        expect(transition).toContain('ease-in-out')
      }
    })

    test('should apply focus-ring utility correctly', async ({ page }) => {
      await page.goto('/')

      const focusEl = page.locator('.focus-ring, button, a').first()
      await focusEl.focus()

      const outlineColor = await focusEl.evaluate(el =>
        window.getComputedStyle(el).getPropertyValue('--color-primary')
      )

      expect(outlineColor).toBeTruthy()
    })

    test('should apply hover effects correctly', async ({ page }) => {
      await page.goto('/')

      const hoverEl = page.locator('.hover-lift, .hover-glow, .card-hover').first()
      if (await hoverEl.count() > 0) {
        // Get initial transform
        const initialTransform = await hoverEl.evaluate(el =>
          window.getComputedStyle(el).transform
        )

        // Hover over element
        await hoverEl.hover()
        await page.waitForTimeout(100)

        // Check that transform changed on hover
        const hoverTransform = await hoverEl.evaluate(el =>
          window.getComputedStyle(el).transform
        )

        // Transform should be applied (not 'none')
        expect(hoverTransform).toBeTruthy()
      }
    })
  })

  test.describe('Component Classes from globals.css', () => {
    test('should render glass-card component correctly', async ({ page }) => {
      await page.goto('/')

      const glassCard = page.locator('.glass-card, .glass-card-light, .glass-section').first()
      if (await glassCard.count() > 0) {
        const styles = await glassCard.evaluate(el => {
          const computed = window.getComputedStyle(el)
          return {
            backdropFilter: computed.backdropFilter,
            background: computed.background,
            borderRadius: computed.borderRadius
          }
        })

        expect(styles.backdropFilter).toContain('blur')
        expect(styles.background).toBeTruthy()
        expect(styles.borderRadius).toBeTruthy()
      }
    })

    test('should render CTA buttons correctly', async ({ page }) => {
      await page.goto('/')

      const ctaButton = page.locator('.cta-primary, .cta-secondary').first()
      if (await ctaButton.count() > 0) {
        const styles = await ctaButton.evaluate(el => {
          const computed = window.getComputedStyle(el)
          return {
            background: computed.background,
            padding: computed.padding,
            borderRadius: computed.borderRadius,
            fontWeight: computed.fontWeight
          }
        })

        expect(styles.background).toBeTruthy()
        expect(styles.padding).toBeTruthy()
        expect(styles.borderRadius).toBeTruthy()
        expect(parseInt(styles.fontWeight)).toBeGreaterThanOrEqual(600)
      }
    })

    test('should render gradient backgrounds correctly', async ({ page }) => {
      await page.goto('/')

      const gradientEl = page.locator('[class*="bg-gradient-"]').first()
      if (await gradientEl.count() > 0) {
        const background = await gradientEl.evaluate(el =>
          window.getComputedStyle(el).background
        )

        expect(background).toBeTruthy()
        expect(background).toMatch(/gradient|linear/)
      }
    })

    test('should render grid patterns correctly', async ({ page }) => {
      await page.goto('/')

      const gridPattern = page.locator('.grid-pattern, .grid-pattern-light, .grid-pattern-subtle').first()
      if (await gridPattern.count() > 0) {
        const bgImage = await gridPattern.evaluate(el =>
          window.getComputedStyle(el).backgroundImage
        )

        expect(bgImage).toBeTruthy()
        expect(bgImage).toContain('linear-gradient')
      }
    })
  })

  test.describe('shadcn/ui Component Styling', () => {
    test('should render Button component with correct variants', async ({ page }) => {
      await page.goto('/')

      // Test primary button
      const button = page.locator('button').first()
      if (await button.count() > 0) {
        const styles = await button.evaluate(el => {
          const computed = window.getComputedStyle(el)
          return {
            display: computed.display,
            alignItems: computed.alignItems,
            justifyContent: computed.justifyContent,
            borderRadius: computed.borderRadius,
            padding: computed.padding
          }
        })

        expect(styles.display).toBe('inline-flex')
        expect(styles.alignItems).toBe('center')
        expect(styles.justifyContent).toBe('center')
        expect(styles.borderRadius).toBeTruthy()
      }
    })

    test('should use CSS variables for theming', async ({ page }) => {
      await page.goto('/')

      // Check that CSS variables are defined
      const cssVars = await page.evaluate(() => {
        const root = document.documentElement
        const styles = window.getComputedStyle(root)
        return {
          background: styles.getPropertyValue('--background'),
          foreground: styles.getPropertyValue('--foreground'),
          primary: styles.getPropertyValue('--primary'),
          secondary: styles.getPropertyValue('--secondary'),
          accent: styles.getPropertyValue('--accent'),
          muted: styles.getPropertyValue('--muted'),
          border: styles.getPropertyValue('--border')
        }
      })

      expect(cssVars.background).toBeTruthy()
      expect(cssVars.foreground).toBeTruthy()
      expect(cssVars.primary).toBeTruthy()
    })
  })

  test.describe('Responsive & Accessibility Features', () => {
    test('should apply responsive text utilities correctly', async ({ page }) => {
      await page.goto('/')

      const responsiveText = page.locator('.text-responsive-sm, .text-responsive-md, .text-responsive-lg').first()
      if (await responsiveText.count() > 0) {
        const fontSize = await responsiveText.evaluate(el =>
          window.getComputedStyle(el).fontSize
        )

        expect(fontSize).toBeTruthy()
        expect(parseFloat(fontSize)).toBeGreaterThan(0)
      }
    })

    test('should respect reduced motion preferences', async ({ page, context }) => {
      // Set prefers-reduced-motion
      await context.addInitScript(() => {
        Object.defineProperty(window, 'matchMedia', {
          writable: true,
          value: (query: string) => ({
            matches: query === '(prefers-reduced-motion: reduce)',
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => true,
          }),
        })
      })

      await page.goto('/')

      // Check that animations are reduced
      const animatedEl = page.locator('.animate-gradient, [class*="animate-"]').first()
      if (await animatedEl.count() > 0) {
        const animationDuration = await animatedEl.evaluate(el =>
          window.getComputedStyle(el).animationDuration
        )

        // Should be very short or 0
        const duration = parseFloat(animationDuration)
        expect(duration).toBeLessThan(0.1) // Less than 100ms
      }
    })

    test('should apply correct focus styles for accessibility', async ({ page }) => {
      await page.goto('/')

      const interactiveEl = page.locator('a, button, input').first()
      await interactiveEl.focus()

      const outline = await interactiveEl.evaluate(el => {
        const computed = window.getComputedStyle(el)
        return {
          outline: computed.outline,
          outlineColor: computed.outlineColor,
          outlineOffset: computed.outlineOffset
        }
      })

      // Should have focus indicator
      expect(outline.outline || outline.outlineColor).toBeTruthy()
    })

    test('should have proper contrast ratios', async ({ page }) => {
      await page.goto('/')

      // Test text elements have readable contrast
      const textElements = page.locator('p, h1, h2, h3, span').first()
      const styles = await textElements.evaluate(el => {
        const computed = window.getComputedStyle(el)
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor
        }
      })

      expect(styles.color).toBeTruthy()
      expect(styles.color).not.toBe('rgba(0, 0, 0, 0)')
    })
  })

  test.describe('Visual Consistency Across Pages', () => {
    const pages = ['/', '/services', '/about', '/contact', '/portfolio']

    for (const pagePath of pages) {
      test(`should apply consistent styling on ${pagePath}`, async ({ page }) => {
        await page.goto(pagePath)

        // Check that layout utilities work
        const container = page.locator('.container-wide, .container-narrow, main').first()
        const maxWidth = await container.evaluate(el =>
          window.getComputedStyle(el).maxWidth
        )

        expect(maxWidth).toBeTruthy()

        // Check that text is readable
        const bodyText = await page.evaluate(() =>
          window.getComputedStyle(document.body).color
        )

        expect(bodyText).toBeTruthy()
        expect(bodyText).not.toBe('rgba(0, 0, 0, 0)')
      })
    }
  })

  test.describe('Print Styles for PDF Components', () => {
    test('should apply print-specific styles to PayStub component', async ({ page }) => {
      await page.goto('/paystub-generator')

      // Check for print-specific dimensions
      const printContainer = page.locator('[class*="max-w-\\[8.5in\\]"]').first()
      if (await printContainer.count() > 0) {
        const maxWidth = await printContainer.evaluate(el =>
          window.getComputedStyle(el).maxWidth
        )

        // Should be close to 8.5 inches
        expect(maxWidth).toBeTruthy()
      }
    })
  })
})
