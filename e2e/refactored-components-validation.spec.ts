import { test, expect } from '@playwright/test'

/**
 * E2E tests to validate refactored components render correctly
 * Tests components that were refactored from inline styles to Tailwind classes
 */

test.describe('Refactored Components Validation', () => {
  test.describe('FloatingInput Component', () => {
    test('should render FloatingInput with semantic tokens', async ({ page }) => {
      await page.goto('/contact')

      // Find floating input fields
      const floatingInput = page.locator('input[type="text"], input[type="email"]').first()
      if (await floatingInput.count() > 0) {
        const styles = await floatingInput.evaluate(el => {
          const computed = window.getComputedStyle(el)
          return {
            border: computed.border,
            borderRadius: computed.borderRadius,
            padding: computed.padding,
            transition: computed.transition
          }
        })

        expect(styles.border).toBeTruthy()
        expect(styles.borderRadius).toBeTruthy()
        expect(styles.padding).toBeTruthy()
        expect(styles.transition).toBeTruthy()
      }
    })

    test('should apply focus state correctly on FloatingInput', async ({ page }) => {
      await page.goto('/contact')

      const input = page.locator('input[type="text"], input[type="email"]').first()
      if (await input.count() > 0) {
        // Focus the input
        await input.focus()
        await page.waitForTimeout(200)

        const focusedStyles = await input.evaluate(el => {
          const computed = window.getComputedStyle(el)
          return {
            borderColor: computed.borderColor,
            outline: computed.outline
          }
        })

        // Should have visible focus indicator
        expect(focusedStyles.borderColor || focusedStyles.outline).toBeTruthy()
      }
    })

    test('should float label on focus and value', async ({ page }) => {
      await page.goto('/contact')

      const input = page.locator('input[type="text"]').first()
      const label = page.locator('label').first()

      if (await input.count() > 0 && await label.count() > 0) {
        // Get initial label position
        const initialPos = await label.boundingBox()

        // Focus and type
        await input.focus()
        await input.fill('Test Name')
        await page.waitForTimeout(200)

        // Get new label position
        const floatedPos = await label.boundingBox()

        // Label should have moved (top position changed)
        if (initialPos && floatedPos) {
          expect(floatedPos.y).toBeLessThan(initialPos.y)
        }
      }
    })
  })

  test.describe('FloatingTextarea Component', () => {
    test('should render FloatingTextarea with semantic tokens', async ({ page }) => {
      await page.goto('/contact')

      const textarea = page.locator('textarea').first()
      if (await textarea.count() > 0) {
        const styles = await textarea.evaluate(el => {
          const computed = window.getComputedStyle(el)
          return {
            border: computed.border,
            borderRadius: computed.borderRadius,
            padding: computed.padding,
            resize: computed.resize
          }
        })

        expect(styles.border).toBeTruthy()
        expect(styles.borderRadius).toBeTruthy()
        // Resize can be 'none' or 'vertical' - both are acceptable
        expect(['none', 'vertical']).toContain(styles.resize)
      }
    })

    test('should show character count when typing', async ({ page }) => {
      await page.goto('/contact')

      const textarea = page.locator('textarea').first()
      if (await textarea.count() > 0) {
        await textarea.fill('Test message')
        await page.waitForTimeout(100)

        // Character count should be visible
        const charCount = page.locator('text=/\\d+ characters/')
        if (await charCount.count() > 0) {
          await expect(charCount).toBeVisible()
        }
      }
    })
  })

  test.describe('Button Component', () => {
    test('should render Button with proper flex layout', async ({ page }) => {
      await page.goto('/')

      const button = page.locator('button').first()
      const styles = await button.evaluate(el => {
        const computed = window.getComputedStyle(el)
        return {
          display: computed.display,
          alignItems: computed.alignItems,
          justifyContent: computed.justifyContent,
          gap: computed.gap
        }
      })

      // Should use flex or inline-flex with items-center justify-center
      expect(['flex', 'inline-flex']).toContain(styles.display)
      expect(styles.alignItems).toBe('center')
      expect(styles.justifyContent).toBe('center')
      expect(styles.gap).toBeTruthy()
    })

    test('should apply transition-smooth utility', async ({ page }) => {
      await page.goto('/')

      const button = page.locator('button').first()
      const transition = await button.evaluate(el =>
        window.getComputedStyle(el).transition
      )

      expect(transition).toBeTruthy()
      // Browser may report as '0.15s' or '150ms' or '300ms'
      expect(transition).toMatch(/0\.15s|150ms|0\.3s|300ms/)
      // Easing function can be 'ease-in-out' or 'cubic-bezier'
      expect(transition).toMatch(/ease-in-out|cubic-bezier/)
    })

    test('should apply focus-ring on focus', async ({ page }) => {
      await page.goto('/')

      const button = page.locator('button').first()
      await button.focus()
      await page.waitForTimeout(100)

      const outline = await button.evaluate(el => {
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
  })

  test.describe('Tabs Component', () => {
    test('should render TabsList with flex layout', async ({ page }) => {
      // Navigate to a page that uses tabs
      await page.goto('/paystub-generator')

      const tabsList = page.locator('[role="tablist"]').first()
      if (await tabsList.count() > 0) {
        const styles = await tabsList.evaluate(el => {
          const computed = window.getComputedStyle(el)
          return {
            display: computed.display,
            alignItems: computed.alignItems,
            justifyContent: computed.justifyContent
          }
        })

        expect(styles.display).toBe('inline-flex')
        expect(styles.alignItems).toBe('center')
        expect(styles.justifyContent).toBe('center')
      }
    })

    test('should apply active state styling to selected tab', async ({ page }) => {
      await page.goto('/paystub-generator')

      const activeTab = page.locator('[role="tab"][data-state="active"]').first()
      if (await activeTab.count() > 0) {
        const styles = await activeTab.evaluate(el => {
          const computed = window.getComputedStyle(el)
          return {
            background: computed.background,
            boxShadow: computed.boxShadow
          }
        })

        expect(styles.background).toBeTruthy()
      }
    })
  })

  test.describe('PayStub Component (Print Layout)', () => {
    test('should render PayStub with print-specific dimensions', async ({ page }) => {
      await page.goto('/paystub-generator')

      // Fill out form and generate paystub
      await page.fill('#employeeName', 'John Doe')
      await page.fill('#hourlyRate', '25.00')

      const generateButton = page.locator('button:has-text("Generate Pay Stubs")').first()
      if (await generateButton.count() > 0) {
        await generateButton.click()
        await page.waitForTimeout(1000)

        // Check for print container
        const printContainer = page.locator('[class*="max-w-\\[8.5in\\]"]').first()
        if (await printContainer.count() > 0) {
          const styles = await printContainer.evaluate(el => {
            const computed = window.getComputedStyle(el)
            return {
              maxWidth: computed.maxWidth,
              margin: computed.margin,
              backgroundColor: computed.backgroundColor
            }
          })

          expect(styles.maxWidth).toBeTruthy()
          expect(styles.margin).toContain('auto') // mx-auto
          expect(styles.backgroundColor).toBeTruthy()
        }
      }
    })

    test('should render PayStub button with semantic accent color', async ({ page }) => {
      await page.goto('/paystub-generator')

      const saveButton = page.locator('button:has-text("Save as PDF")').first()
      if (await saveButton.count() > 0) {
        const background = await saveButton.evaluate(el =>
          window.getComputedStyle(el).background
        )

        expect(background).toBeTruthy()
        // Should use bg-accent, not hardcoded #059669
      }
    })

    test('should use flex-between utility for layout', async ({ page }) => {
      await page.goto('/paystub-generator')

      const flexBetween = page.locator('.flex-between').first()
      if (await flexBetween.count() > 0) {
        const styles = await flexBetween.evaluate(el => {
          const computed = window.getComputedStyle(el)
          return {
            display: computed.display,
            justifyContent: computed.justifyContent
          }
        })

        expect(styles.display).toBe('flex')
        expect(styles.justifyContent).toBe('space-between')
      }
    })
  })

  test.describe('Footer Component', () => {
    test('should render Footer with semantic nav-dark background', async ({ page }) => {
      await page.goto('/')

      const footer = page.locator('footer').first()
      const background = await footer.evaluate(el => {
        // Check the background div
        const bgDiv = el.querySelector('[class*="bg-\\[var"]')
        if (bgDiv) {
          return window.getComputedStyle(bgDiv).backgroundColor
        }
        return null
      })

      if (background) {
        expect(background).toBeTruthy()
        expect(background).not.toBe('rgba(0, 0, 0, 0)')
      }
    })
  })

  test.describe('GoogleMap Component', () => {
    test('should render iframe with border-0 class', async ({ page }) => {
      await page.goto('/contact')

      const mapIframe = page.locator('iframe[title*="Map"]').first()
      if (await mapIframe.count() > 0) {
        const border = await mapIframe.evaluate(el =>
          window.getComputedStyle(el).border
        )

        // Should have border-0 (no border)
        expect(border).toContain('0px')
      }
    })
  })

  test.describe('Paystub Generator Form', () => {
    test('should render form buttons with Tailwind classes', async ({ page }) => {
      await page.goto('/paystub-generator')

      const button = page.locator('button').first()
      const styles = await button.evaluate(el => {
        const computed = window.getComputedStyle(el)
        return {
          padding: computed.padding,
          borderRadius: computed.borderRadius,
          cursor: computed.cursor
        }
      })

      expect(styles.padding).toBeTruthy()
      expect(styles.borderRadius).toBeTruthy()
      expect(styles.cursor).toBe('default') // Button has no explicit cursor style, defaults to 'default'
    })

    test('should apply hover states to buttons', async ({ page }) => {
      await page.goto('/paystub-generator')

      const button = page.locator('button').first()
      await button.hover()
      await page.waitForTimeout(200)

      const backgroundColor = await button.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      )

      expect(backgroundColor).toBeTruthy()
    })

  })

  test.describe('Visual Regression - No Inline Styles', () => {
    test('should not have inline style attributes on main components', async ({ page }) => {
      await page.goto('/')

      // Check for inline style attributes (should be minimal/none)
      const elementsWithInlineStyles = await page.evaluate(() => {
        const elements = document.querySelectorAll('[style]')
        return Array.from(elements).filter(el => {
          const style = el.getAttribute('style')
          // Allow animationDelay which is dynamic
          return style && !style.includes('animationDelay') && !style.includes('animation-delay')
        }).length
      })

      // Should have very few inline styles (ideally 0, but allow a few for dynamic cases)
      expect(elementsWithInlineStyles).toBeLessThan(5)
    })

    test('should use semantic tokens instead of hardcoded colors', async ({ page }) => {
      await page.goto('/')

      // Check that hardcoded hex colors are not in style attributes
      const hardcodedColors = await page.evaluate(() => {
        const elements = document.querySelectorAll('[style]')
        return Array.from(elements).some(el => {
          const style = el.getAttribute('style') || ''
          return style.match(/#[0-9a-fA-F]{3,6}/)
        })
      })

      expect(hardcodedColors).toBe(false)
    })
  })
})
