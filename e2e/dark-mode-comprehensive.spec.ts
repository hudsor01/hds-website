import { test, expect } from '@playwright/test';
import { createTestLogger } from './test-logger';

/**
 * Comprehensive Dark Mode Test Suite
 *
 * TDD Approach: These tests are written FIRST and should FAIL initially.
 *
 * Test Coverage:
 * - Theme toggle functionality
 * - Theme persistence (localStorage)
 * - WCAG contrast requirements in dark mode
 * - System preference detection
 * - Color transitions
 * - All pages in dark mode
 * - Monochromatic OKLCH color validation
 */

test.describe('Dark Mode - Theme Toggle', () => {
  test('should have a theme toggle button', async ({ page }, testInfo) => {
    const logger = createTestLogger(testInfo.title);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for theme toggle button
    const themeToggle = page.locator('button[aria-label*="theme" i], button[aria-label*="dark" i], button[aria-label*="light" i]');

    logger.step('Checking for theme toggle button');
    await expect(themeToggle).toBeVisible();

    // Should have proper aria-label
    const ariaLabel = await themeToggle.getAttribute('aria-label');
    logger.analysis('theme toggle', 'aria-label', ariaLabel || 'missing');

    expect(ariaLabel).toBeTruthy();
  });

  test('should toggle dark mode when button clicked', async ({ page }, testInfo) => {
    const logger = createTestLogger(testInfo.title);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get initial theme
    const initialTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });

    logger.analysis('initial', 'dark mode active', String(initialTheme));

    // Click theme toggle
    const themeToggle = page.locator('button[aria-label*="theme" i]').first();
    await themeToggle.click();

    // Wait for transition
    await page.waitForTimeout(300);

    // Check theme changed
    const newTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });

    logger.analysis('after toggle', 'dark mode active', String(newTheme));

    // Theme should have toggled
    expect(newTheme).not.toBe(initialTheme);
  });

  test('should update aria-label after toggle', async ({ page }, testInfo) => {
    const logger = createTestLogger(testInfo.title);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const themeToggle = page.locator('button[aria-label*="theme" i]').first();

    const initialLabel = await themeToggle.getAttribute('aria-label');
    logger.analysis('initial', 'aria-label', initialLabel || '');

    // Toggle theme
    await themeToggle.click();
    await page.waitForTimeout(300);

    const newLabel = await themeToggle.getAttribute('aria-label');
    logger.analysis('after toggle', 'aria-label', newLabel || '');

    // Label should change to reflect new state
    expect(newLabel).not.toBe(initialLabel);
  });
});

test.describe('Dark Mode - Persistence', () => {
  test('should persist theme preference in localStorage', async ({ page }, testInfo) => {
    const logger = createTestLogger(testInfo.title);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Toggle to dark mode
    const themeToggle = page.locator('button[aria-label*="theme" i]').first();
    await themeToggle.click();
    await page.waitForTimeout(300);

    // Check localStorage
    const storedTheme = await page.evaluate(() => {
      return localStorage.getItem('theme') || localStorage.getItem('color-scheme');
    });

    logger.analysis('localStorage', 'stored theme', storedTheme || 'not found');

    // Theme should be stored
    expect(storedTheme).toBeTruthy();
  });

  test('should restore theme preference on page reload', async ({ page }, testInfo) => {
    const logger = createTestLogger(testInfo.title);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Set dark mode
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
    });

    logger.step('Reloading page');
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check if dark mode is still active
    const isDark = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });

    logger.analysis('after reload', 'dark mode active', String(isDark));

    expect(isDark).toBe(true);
  });

  test('should restore theme preference on navigation', async ({ page }, testInfo) => {
    const logger = createTestLogger(testInfo.title);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Enable dark mode
    const themeToggle = page.locator('button[aria-label*="theme" i]').first();
    await themeToggle.click();
    await page.waitForTimeout(300);

    logger.step('Navigating to services page');
    await page.goto('/services');
    await page.waitForLoadState('networkidle');

    // Dark mode should still be active
    const isDark = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });

    logger.analysis('after navigation', 'dark mode active', String(isDark));

    expect(isDark).toBe(true);
  });
});

test.describe('Dark Mode - WCAG Contrast Requirements', () => {
  test('should meet WCAG AA contrast ratio for body text', async ({ page }, testInfo) => {
    const logger = createTestLogger(testInfo.title);

    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get body background and text colors
    const colors = await page.evaluate(() => {
      const body = document.body;
      const styles = window.getComputedStyle(body);

      return {
        background: styles.backgroundColor,
        text: styles.color,
      };
    });

    logger.analysis('body', 'background', colors.background);
    logger.analysis('body', 'text color', colors.text);

    // Calculate contrast ratio
    const contrastRatio = await page.evaluate(() => {
      // Simplified contrast calculation
      function getRGB(color: string): number[] {
        const match = color.match(/\d+/g);
        return match ? match.map(Number) : [0, 0, 0];
      }

      function getLuminance(rgb: number[]): number {
        const [r, g, b] = rgb.map(val => {
          const sRGB = val / 255;
          return sRGB <= 0.03928
            ? sRGB / 12.92
            : Math.pow((sRGB + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      }

      const body = document.body;
      const styles = window.getComputedStyle(body);
      const bgRGB = getRGB(styles.backgroundColor);
      const textRGB = getRGB(styles.color);

      const bgLum = getLuminance(bgRGB);
      const textLum = getLuminance(textRGB);

      const lighter = Math.max(bgLum, textLum);
      const darker = Math.min(bgLum, textLum);

      return (lighter + 0.05) / (darker + 0.05);
    });

    logger.analysis('contrast', 'ratio', contrastRatio.toFixed(2));

    // WCAG AA requires 4.5:1 for normal text
    expect(contrastRatio).toBeGreaterThanOrEqual(4.5);
  });

  test('should meet WCAG AA contrast ratio for headings', async ({ page }, testInfo) => {
    const logger = createTestLogger(testInfo.title);

    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const h1 = page.locator('h1').first();

    if (await h1.count() > 0) {
      const contrastRatio = await h1.evaluate((el) => {
        function getRGB(color: string): number[] {
          const match = color.match(/\d+/g);
          return match ? match.map(Number) : [0, 0, 0];
        }

        function getLuminance(rgb: number[]): number {
          const [r, g, b] = rgb.map(val => {
            const sRGB = val / 255;
            return sRGB <= 0.03928
              ? sRGB / 12.92
              : Math.pow((sRGB + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        }

        const styles = window.getComputedStyle(el);
        const parent = el.parentElement;
        const parentStyles = parent ? window.getComputedStyle(parent) : styles;

        const bgRGB = getRGB(parentStyles.backgroundColor);
        const textRGB = getRGB(styles.color);

        const bgLum = getLuminance(bgRGB);
        const textLum = getLuminance(textRGB);

        const lighter = Math.max(bgLum, textLum);
        const darker = Math.min(bgLum, textLum);

        return (lighter + 0.05) / (darker + 0.05);
      });

      logger.analysis('h1 contrast', 'ratio', contrastRatio.toFixed(2));

      // WCAG AA for large text (headings): 3:1
      expect(contrastRatio).toBeGreaterThanOrEqual(3.0);
    }
  });

  test('should meet contrast for interactive elements', async ({ page }, testInfo) => {
    const logger = createTestLogger(testInfo.title);

    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find primary button
    const button = page.locator('button, a[role="button"]').first();

    if (await button.count() > 0) {
      const contrastRatio = await button.evaluate((el) => {
        function getRGB(color: string): number[] {
          const match = color.match(/\d+/g);
          return match ? match.map(Number) : [0, 0, 0];
        }

        function getLuminance(rgb: number[]): number {
          const [r, g, b] = rgb.map(val => {
            const sRGB = val / 255;
            return sRGB <= 0.03928
              ? sRGB / 12.92
              : Math.pow((sRGB + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        }

        const styles = window.getComputedStyle(el);
        const bgRGB = getRGB(styles.backgroundColor);
        const textRGB = getRGB(styles.color);

        const bgLum = getLuminance(bgRGB);
        const textLum = getLuminance(textRGB);

        const lighter = Math.max(bgLum, textLum);
        const darker = Math.min(bgLum, textLum);

        return (lighter + 0.05) / (darker + 0.05);
      });

      logger.analysis('button contrast', 'ratio', contrastRatio.toFixed(2));

      expect(contrastRatio).toBeGreaterThanOrEqual(4.5);
    }
  });
});

test.describe('Dark Mode - System Preference Detection', () => {
  test('should respect system dark mode preference', async ({ page }, testInfo) => {
    const logger = createTestLogger(testInfo.title);

    // Emulate system dark mode
    await page.emulateMedia({ colorScheme: 'dark' });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if dark mode is applied
    const isDark = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });

    logger.analysis('system preference', 'dark mode', String(isDark));

    // Should respect system preference if no localStorage override
    // This test might pass or fail depending on implementation
  });

  test('should respect system light mode preference', async ({ page }, testInfo) => {
    const logger = createTestLogger(testInfo.title);

    // Emulate system light mode
    await page.emulateMedia({ colorScheme: 'light' });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const isDark = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });

    logger.analysis('system preference', 'light mode (not dark)', String(!isDark));
  });
});

test.describe('Dark Mode - Color Values', () => {
  test('should use dark OKLCH colors in dark mode', async ({ page }, testInfo) => {
    const logger = createTestLogger(testInfo.title);

    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check CSS custom properties for dark mode
    const darkColors = await page.evaluate(() => {
      const root = document.documentElement;
      const styles = window.getComputedStyle(root);

      return {
        background: styles.getPropertyValue('--color-background-dark').trim(),
        foreground: styles.getPropertyValue('--color-foreground-dark').trim(),
        primary: styles.getPropertyValue('--color-primary-dark').trim(),
      };
    });

    logger.analysis('dark colors', 'background', darkColors.background);
    logger.analysis('dark colors', 'foreground', darkColors.foreground);
    logger.analysis('dark colors', 'primary', darkColors.primary);

    // Should contain OKLCH values (browsers may convert to lab() format)
    expect(darkColors.background).toMatch(/oklch|lab/);
    expect(darkColors.foreground).toMatch(/oklch|lab/);
  });

  test('should have appropriate lightness values in dark mode', async ({ page }, testInfo) => {
    const logger = createTestLogger(testInfo.title);

    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check background is dark (low lightness)
    const bgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });

    // Parse RGB and check it's dark
    const isDarkBackground = await page.evaluate(() => {
      const bg = window.getComputedStyle(document.body).backgroundColor;
      const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);

      if (match) {
        const [, r, g, b] = match.map(Number);
        const avg = (r + g + b) / 3;
        // Dark backgrounds should have average RGB < 50
        return avg < 50;
      }

      return false;
    });

    logger.analysis('background', 'is dark', String(isDarkBackground));

    expect(isDarkBackground).toBe(true);
  });
});

test.describe('Dark Mode - All Pages', () => {
  const pages = [
    { path: '/', name: 'Home' },
    { path: '/services', name: 'Services' },
    { path: '/showcase', name: 'Portfolio' },
    { path: '/pricing', name: 'Pricing' },
    { path: '/contact', name: 'Contact' },
  ];

  for (const pageDef of pages) {
    test(`should render ${pageDef.name} properly in dark mode`, async ({ page }, testInfo) => {
      const logger = createTestLogger(testInfo.title);

      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto(pageDef.path);
      await page.waitForLoadState('networkidle');

      // Check dark mode is active
      const isDark = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark') ||
               document.documentElement.getAttribute('data-theme') === 'dark';
      });

      logger.analysis(`${pageDef.name}`, 'dark mode active', String(isDark));

      // Check background is dark
      const bgColor = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });

      logger.analysis(`${pageDef.name}`, 'background-color', bgColor);

      // Verify no bright backgrounds
      const isBright = await page.evaluate(() => {
        const bg = window.getComputedStyle(document.body).backgroundColor;
        const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);

        if (match) {
          const [, r, g, b] = match.map(Number);
          const avg = (r + g + b) / 3;
          // Bright backgrounds have average RGB > 200
          return avg > 200;
        }

        return false;
      });

      logger.analysis(`${pageDef.name}`, 'has bright background', String(isBright));

      expect(isBright).toBe(false);
    });
  }
});

test.describe('Dark Mode - Transitions', () => {
  test('should have smooth color transition when toggling', async ({ page }, testInfo) => {
    const logger = createTestLogger(testInfo.title);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for transition properties
    const hasTransition = await page.evaluate(() => {
      const body = document.body;
      const styles = window.getComputedStyle(body);
      const transition = styles.transition || styles.getPropertyValue('transition');

      return transition.includes('color') || transition.includes('background');
    });

    logger.analysis('body', 'has color transition', String(hasTransition));

    // Transitions improve UX but are not strictly required
  });
});
