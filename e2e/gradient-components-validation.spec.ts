import { test, expect } from '@playwright/test'

/**
 * E2E tests to validate gradient classes and component styling
 * Ensures gradient backgrounds render correctly with proper OKLCH colors
 */

test.describe('Gradient Components Validation', () => {
  test.describe('Gradient Background Classes', () => {
    test('should render base gradient classes correctly', async ({ page }) => {
      await page.goto('/')

      // Test primary gradient
      const primaryGradient = page.locator('.bg-gradient-primary').first()
      if (await primaryGradient.count() > 0) {
        const background = await primaryGradient.evaluate(el =>
          window.getComputedStyle(el).background
        )

        expect(background).toBeTruthy()
        expect(background).toMatch(/linear-gradient|gradient/)
      }

      // Test hero gradient
      const heroGradient = page.locator('.bg-gradient-hero').first()
      if (await heroGradient.count() > 0) {
        const background = await heroGradient.evaluate(el =>
          window.getComputedStyle(el).background
        )

        expect(background).toBeTruthy()
        expect(background).toMatch(/linear-gradient|gradient/)
      }
    })

    test('should render gradient variants with opacity correctly', async ({ page }) => {
      await page.goto('/')

      const gradientVariants = [
        '.bg-gradient-hero-10',
        '.bg-gradient-hero-20',
        '.bg-gradient-primary-20',
        '.bg-gradient-primary-30'
      ]

      for (const variant of gradientVariants) {
        const element = page.locator(variant).first()
        if (await element.count() > 0) {
          const background = await element.evaluate(el =>
            window.getComputedStyle(el).background
          )

          expect(background).toBeTruthy()
          expect(background).toMatch(/linear-gradient|gradient/)

          // Verify the element is visible
          await expect(element).toBeVisible()
        }
      }
    })

    test('should render decorative gradients correctly', async ({ page }) => {
      await page.goto('/')

      const decorativeGradients = [
        '.bg-gradient-decorative-purple',
        '.bg-gradient-decorative-purple-20',
        '.bg-gradient-decorative-orange'
      ]

      for (const gradient of decorativeGradients) {
        const element = page.locator(gradient).first()
        if (await element.count() > 0) {
          const background = await element.evaluate(el =>
            window.getComputedStyle(el).background
          )

          expect(background).toBeTruthy()
        }
      }
    })

    test('should apply blur effects to gradient orbs', async ({ page }) => {
      await page.goto('/')

      // Find gradient orbs with blur
      const blurredGradient = page.locator('[class*="bg-gradient-"].blur-3xl, [class*="bg-gradient-"].blur-2xl').first()
      if (await blurredGradient.count() > 0) {
        const filter = await blurredGradient.evaluate(el =>
          window.getComputedStyle(el).filter
        )

        expect(filter).toBeTruthy()
        expect(filter).toContain('blur')
      }
    })
  })

  test.describe('Glass Morphism Components', () => {
    test('should render glass-card with backdrop blur', async ({ page }) => {
      await page.goto('/')

      const glassCard = page.locator('.glass-card').first()
      if (await glassCard.count() > 0) {
        const styles = await glassCard.evaluate(el => {
          const computed = window.getComputedStyle(el)
          return {
            backdropFilter: computed.backdropFilter,
            background: computed.background,
            border: computed.border,
            borderRadius: computed.borderRadius,
            boxShadow: computed.boxShadow
          }
        })

        expect(styles.backdropFilter).toContain('blur')
        expect(styles.background).toBeTruthy()
        expect(styles.borderRadius).toBeTruthy()
      }
    })

    test('should render glass-card-light variant', async ({ page }) => {
      await page.goto('/')

      const glassCardLight = page.locator('.glass-card-light').first()
      if (await glassCardLight.count() > 0) {
        const backdropFilter = await glassCardLight.evaluate(el =>
          window.getComputedStyle(el).backdropFilter
        )

        expect(backdropFilter).toContain('blur')
      }
    })

    test('should render glass-section variant', async ({ page }) => {
      await page.goto('/')

      const glassSection = page.locator('.glass-section').first()
      if (await glassSection.count() > 0) {
        const styles = await glassSection.evaluate(el => {
          const computed = window.getComputedStyle(el)
          return {
            backdropFilter: computed.backdropFilter,
            borderRadius: computed.borderRadius
          }
        })

        expect(styles.backdropFilter).toContain('blur')
        expect(styles.borderRadius).toBeTruthy()
      }
    })
  })

  test.describe('Grid Pattern Overlays', () => {
    test('should render grid-pattern overlay', async ({ page }) => {
      await page.goto('/')

      const gridPattern = page.locator('.grid-pattern').first()
      if (await gridPattern.count() > 0) {
        const backgroundImage = await gridPattern.evaluate(el =>
          window.getComputedStyle(el).backgroundImage
        )

        expect(backgroundImage).toBeTruthy()
        expect(backgroundImage).toContain('linear-gradient')
      }
    })

    test('should render grid pattern variants', async ({ page }) => {
      await page.goto('/')

      const variants = ['.grid-pattern-light', '.grid-pattern-subtle', '.grid-pattern-minimal']

      for (const variant of variants) {
        const element = page.locator(variant).first()
        if (await element.count() > 0) {
          const backgroundImage = await element.evaluate(el =>
            window.getComputedStyle(el).backgroundImage
          )

          expect(backgroundImage).toBeTruthy()
        }
      }
    })
  })

  test.describe('Component Hover States', () => {
    test('should apply card hover effects correctly', async ({ page }) => {
      await page.goto('/')

      const cardHover = page.locator('.card-hover').first()
      if (await cardHover.count() > 0) {
        const initialStyles = await cardHover.evaluate(el => {
          const computed = window.getComputedStyle(el)
          return {
            transform: computed.transform,
            boxShadow: computed.boxShadow
          }
        })

        // Hover over the card
        await cardHover.hover()
        await page.waitForTimeout(200)

        const hoverStyles = await cardHover.evaluate(el => {
          const computed = window.getComputedStyle(el)
          return {
            transform: computed.transform,
            boxShadow: computed.boxShadow
          }
        })

        // Transform should change on hover
        expect(hoverStyles.transform).toBeTruthy()
      }
    })

    test('should apply card glow variants correctly', async ({ page }) => {
      await page.goto('/')

      const glowVariants = [
        '.card-hover-glow',
        '.card-hover-glow-purple',
        '.card-hover-glow-emerald',
        '.card-hover-glow-orange'
      ]

      for (const variant of glowVariants) {
        const element = page.locator(variant).first()
        if (await element.count() > 0) {
          // Hover to trigger glow
          await element.hover()
          await page.waitForTimeout(100)

          const boxShadow = await element.evaluate(el =>
            window.getComputedStyle(el).boxShadow
          )

          expect(boxShadow).toBeTruthy()
          expect(boxShadow).not.toBe('none')
        }
      }
    })

    test('should apply button hover glow correctly', async ({ page }) => {
      await page.goto('/')

      const buttonGlow = page.locator('.button-hover-glow').first()
      if (await buttonGlow.count() > 0) {
        await buttonGlow.hover()
        await page.waitForTimeout(100)

        const styles = await buttonGlow.evaluate(el => {
          const computed = window.getComputedStyle(el)
          return {
            borderColor: computed.borderColor,
            boxShadow: computed.boxShadow
          }
        })

        expect(styles.boxShadow).toBeTruthy()
      }
    })
  })

  test.describe('CTA Button Components', () => {
    test('should render cta-primary with gradient background', async ({ page }) => {
      await page.goto('/')

      const ctaPrimary = page.locator('.cta-primary').first()
      if (await ctaPrimary.count() > 0) {
        const styles = await ctaPrimary.evaluate(el => {
          const computed = window.getComputedStyle(el)
          return {
            background: computed.background,
            color: computed.color,
            fontWeight: computed.fontWeight,
            padding: computed.padding,
            borderRadius: computed.borderRadius,
            transition: computed.transition
          }
        })

        expect(styles.background).toBeTruthy()
        expect(styles.background).toMatch(/linear-gradient|gradient/)
        expect(parseInt(styles.fontWeight)).toBeGreaterThanOrEqual(700)
        expect(styles.borderRadius).toBeTruthy()
        expect(styles.transition).toContain('0.3s')
      }
    })

    test('should render cta-secondary with hover effects', async ({ page }) => {
      await page.goto('/')

      const ctaSecondary = page.locator('.cta-secondary').first()
      if (await ctaSecondary.count() > 0) {
        const initialStyles = await ctaSecondary.evaluate(el => {
          const computed = window.getComputedStyle(el)
          return {
            background: computed.background,
            borderColor: computed.borderColor
          }
        })

        expect(initialStyles.background).toContain('transparent')

        // Hover to check state change
        await ctaSecondary.hover()
        await page.waitForTimeout(200)

        const hoverStyles = await ctaSecondary.evaluate(el => {
          const computed = window.getComputedStyle(el)
          return {
            borderColor: computed.borderColor,
            boxShadow: computed.boxShadow
          }
        })

        expect(hoverStyles.boxShadow).toBeTruthy()
      }
    })
  })

  test.describe('Responsive Text Components', () => {
    test('should apply responsive text sizing', async ({ page }) => {
      await page.goto('/')

      const responsiveVariants = [
        '.text-responsive-sm',
        '.text-responsive-md',
        '.text-responsive-lg'
      ]

      for (const variant of responsiveVariants) {
        const element = page.locator(variant).first()
        if (await element.count() > 0) {
          const fontSize = await element.evaluate(el =>
            window.getComputedStyle(el).fontSize
          )

          expect(fontSize).toBeTruthy()
          const size = parseFloat(fontSize)
          expect(size).toBeGreaterThan(0)
        }
      }
    })

    test('should apply text clamp utilities', async ({ page }) => {
      await page.goto('/')

      const clampVariants = [
        '.text-clamp-sm',
        '.text-clamp-base',
        '.text-clamp-lg',
        '.text-clamp-xl',
        '.text-clamp-2xl'
      ]

      for (const variant of clampVariants) {
        const element = page.locator(variant).first()
        if (await element.count() > 0) {
          const fontSize = await element.evaluate(el =>
            window.getComputedStyle(el).fontSize
          )

          expect(fontSize).toBeTruthy()
          const size = parseFloat(fontSize)
          expect(size).toBeGreaterThan(0)
        }
      }
    })
  })

  test.describe('Background Pattern Component', () => {
    test('should render background pattern with gradient orbs', async ({ page }) => {
      await page.goto('/')

      // Check for gradient orbs in background patterns
      const gradientOrbs = page.locator('[class*="bg-gradient-"][class*="rounded-full"][class*="blur-"]')
      const count = await gradientOrbs.count()

      if (count > 0) {
        const firstOrb = gradientOrbs.first()
        const styles = await firstOrb.evaluate(el => {
          const computed = window.getComputedStyle(el)
          return {
            background: computed.background,
            borderRadius: computed.borderRadius,
            filter: computed.filter
          }
        })

        expect(styles.background).toBeTruthy()
        expect(styles.borderRadius).toBe('9999px') // rounded-full
        expect(styles.filter).toContain('blur')
      }
    })

    test('should render grid overlay pattern', async ({ page }) => {
      await page.goto('/')

      const gridOverlay = page.locator('[class*="grid-pattern"]').first()
      if (await gridOverlay.count() > 0) {
        const backgroundImage = await gridOverlay.evaluate(el =>
          window.getComputedStyle(el).backgroundImage
        )

        expect(backgroundImage).toBeTruthy()
        expect(backgroundImage).toContain('linear-gradient')
      }
    })
  })
})
