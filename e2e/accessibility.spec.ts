import { test, expect } from './fixtures/test-fixtures';

test.describe('Accessibility Tests @accessibility', () => {
  test.beforeEach(async ({ page, accessibilityHelper }) => {
    // Inject axe-core for accessibility testing
    await accessibilityHelper.injectAxe();
  });

  test('homepage accessibility audit', async ({ page, accessibilityHelper }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Run comprehensive accessibility audit
    const audit = await accessibilityHelper.runFullAccessibilityAudit();
    
    // Assert no critical violations
    expect(audit.violations).toHaveNoAccessibilityViolations();
    
    // Assert overall score is good
    expect(audit.overall.score).toBeGreaterThan(80);
    
    // Log detailed results for debugging
    if (!audit.overall.valid) {
      console.log('Accessibility issues found:');
      console.log(await accessibilityHelper.generateAccessibilityReport());
    }

    // Check specific accessibility aspects
    expect(audit.details.headings.valid).toBe(true);
    expect(audit.details.colorContrast.valid).toBe(true);
    expect(audit.details.keyboard.valid).toBe(true);
    expect(audit.details.aria.valid).toBe(true);
  });

  test('contact page accessibility audit', async ({ page, accessibilityHelper }) => {
    await page.goto('/contact');
    await page.waitForSelector('form');

    const audit = await accessibilityHelper.runFullAccessibilityAudit();
    
    expect(audit.violations).toHaveNoAccessibilityViolations();
    expect(audit.overall.score).toBeGreaterThan(85);

    // Forms should have excellent accessibility
    expect(audit.details.forms.valid).toBe(true);
    
    // Verify form-specific accessibility
    const formCheck = await accessibilityHelper.checkFormAccessibility();
    expect(formCheck.valid).toBe(true);
    
    if (!formCheck.valid) {
      console.log('Form accessibility issues:', formCheck.issues);
    }
  });

  test('services page accessibility audit', async ({ page, accessibilityHelper }) => {
    await page.goto('/services');
    await page.waitForLoadState('networkidle');

    const audit = await accessibilityHelper.runFullAccessibilityAudit();
    
    expect(audit.violations).toHaveNoAccessibilityViolations();
    expect(audit.overall.score).toBeGreaterThan(80);
  });

  test('portfolio page accessibility audit', async ({ page, accessibilityHelper }) => {
    await page.goto('/portfolio');
    await page.waitForLoadState('networkidle');

    const audit = await accessibilityHelper.runFullAccessibilityAudit();
    
    expect(audit.violations).toHaveNoAccessibilityViolations();
    expect(audit.overall.score).toBeGreaterThan(80);

    // Images should have proper alt text
    expect(audit.details.images.valid).toBe(true);
  });

  test('heading structure validation', async ({ page, accessibilityHelper }) => {
    const pages = ['/', '/contact', '/services', '/portfolio'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      const headingCheck = await accessibilityHelper.checkHeadingStructure();
      
      expect(headingCheck.valid).toBe(true);
      
      if (!headingCheck.valid) {
        console.log(`Heading issues on ${pagePath}:`, headingCheck.issues);
      }
    }
  });

  test('keyboard navigation accessibility', async ({ page, accessibilityHelper }) => {
    await page.goto('/');
    
    // Test keyboard navigation
    const keyboardAccessible = await accessibilityHelper.simulateKeyboardNavigation();
    expect(keyboardAccessible).toBe(true);
    
    // Check keyboard navigation patterns
    const keyboardCheck = await accessibilityHelper.checkKeyboardNavigation();
    expect(keyboardCheck.valid).toBe(true);
    
    // Test tab order on contact form
    await page.goto('/contact');
    await page.waitForSelector('form');
    
    const formFields = [
      'input[name="firstName"]',
      'input[name="lastName"]',
      'input[name="email"]',
      'textarea[name="message"]',
      'button[type="submit"]'
    ];
    
    // Test tab navigation through form
    for (let i = 0; i < formFields.length; i++) {
      await page.keyboard.press('Tab');
      
      const focusedElement = await page.evaluate(() => {
        const focused = document.activeElement;
        return focused ? {
          tagName: focused.tagName.toLowerCase(),
          name: focused.getAttribute('name'),
          type: focused.getAttribute('type')
        } : null;
      });
      
      expect(focusedElement).toBeTruthy();
    }
  });

  test('screen reader compatibility', async ({ page, accessibilityHelper }) => {
    await page.goto('/');
    
    const screenReaderTest = await accessibilityHelper.testScreenReader();
    expect(screenReaderTest.accessible).toBe(true);
    
    if (!screenReaderTest.accessible) {
      console.log('Screen reader issues:', screenReaderTest.issues);
    }
    
    // Check for proper landmarks
    const landmarks = await page.evaluate(() => {
      const landmarkSelectors = [
        'main',
        'nav', 
        'header',
        'footer',
        '[role="main"]',
        '[role="navigation"]',
        '[role="banner"]',
        '[role="contentinfo"]'
      ];
      
      return landmarkSelectors.map(selector => ({
        selector,
        count: document.querySelectorAll(selector).length
      }));
    });
    
    // Should have main landmark
    const mainLandmarks = landmarks.filter(l => 
      l.selector === 'main' || l.selector === '[role="main"]'
    );
    const hasMain = mainLandmarks.some(l => l.count > 0);
    expect(hasMain).toBe(true);
    
    // Should have navigation
    const navLandmarks = landmarks.filter(l => 
      l.selector === 'nav' || l.selector === '[role="navigation"]'
    );
    const hasNav = navLandmarks.some(l => l.count > 0);
    expect(hasNav).toBe(true);
  });

  test('color contrast compliance', async ({ page, accessibilityHelper }) => {
    const pages = ['/', '/contact', '/services', '/portfolio'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      const contrastCheck = await accessibilityHelper.checkColorContrast();
      expect(contrastCheck.valid).toBe(true);
      
      if (!contrastCheck.valid) {
        console.log(`Color contrast issues on ${pagePath}:`, contrastCheck.issues);
      }
    }
  });

  test('form accessibility validation', async ({ page, accessibilityHelper }) => {
    await page.goto('/contact');
    await page.waitForSelector('form');
    
    const formCheck = await accessibilityHelper.checkFormAccessibility();
    expect(formCheck.valid).toBe(true);
    
    // Test form with screen reader announcements
    const form = page.locator('form').first();
    
    // Check form has proper accessible name
    const formLabel = await form.getAttribute('aria-label');
    const formRole = await form.getAttribute('role');
    expect(formLabel || formRole).toBeTruthy();
    
    // Check required field indicators
    const requiredFields = page.locator('input[required], textarea[required]');
    const requiredCount = await requiredFields.count();
    
    for (let i = 0; i < requiredCount; i++) {
      const field = requiredFields.nth(i);
      const ariaRequired = await field.getAttribute('aria-required');
      const label = await page.locator(`label[for="${await field.getAttribute('id')}"]`).textContent();
      
      // Should have aria-required or visual indicator
      expect(ariaRequired === 'true' || label?.includes('*') || label?.toLowerCase().includes('required')).toBe(true);
    }
    
    // Test error state accessibility
    await page.click('button[type="submit"]'); // Submit empty form
    await page.waitForTimeout(1000);
    
    const errorFields = page.locator('[aria-invalid="true"], .error, .field-error');
    const errorCount = await errorFields.count();
    
    if (errorCount > 0) {
      // Error fields should have proper descriptions
      for (let i = 0; i < errorCount; i++) {
        const errorField = errorFields.nth(i);
        const describedBy = await errorField.getAttribute('aria-describedby');
        
        if (describedBy) {
          const errorMessage = page.locator(`#${describedBy}`);
          const hasErrorMessage = await errorMessage.count() > 0;
          expect(hasErrorMessage).toBe(true);
        }
      }
    }
  });

  test('image accessibility validation', async ({ page, accessibilityHelper }) => {
    const pages = ['/', '/portfolio', '/services'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      const imageCheck = await accessibilityHelper.checkImageAccessibility();
      expect(imageCheck.valid).toBe(true);
      
      if (!imageCheck.valid) {
        console.log(`Image accessibility issues on ${pagePath}:`, imageCheck.issues);
      }
      
      // Additional manual checks
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        const ariaLabel = await img.getAttribute('aria-label');
        const role = await img.getAttribute('role');
        const ariaHidden = await img.getAttribute('aria-hidden');
        
        // Decorative images should have empty alt or be hidden
        if (role === 'presentation' || ariaHidden === 'true') {
          continue; // OK for decorative images
        }
        
        // Content images need alt text
        expect(alt !== null || ariaLabel !== null).toBe(true);
        
        // Alt text should be meaningful
        if (alt && alt.length > 0) {
          expect(alt.toLowerCase()).not.toContain('image of');
          expect(alt.toLowerCase()).not.toContain('picture of');
          expect(alt.toLowerCase()).not.toContain('photo of');
        }
      }
    }
  });

  test('link accessibility validation', async ({ page, accessibilityHelper }) => {
    const pages = ['/', '/contact', '/services', '/portfolio'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      const linkCheck = await accessibilityHelper.checkLinkAccessibility();
      expect(linkCheck.valid).toBe(true);
      
      if (!linkCheck.valid) {
        console.log(`Link accessibility issues on ${pagePath}:`, linkCheck.issues);
      }
    }
  });

  test('ARIA usage validation', async ({ page, accessibilityHelper }) => {
    const pages = ['/', '/contact', '/services', '/portfolio'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      const ariaCheck = await accessibilityHelper.checkARIAUsage();
      expect(ariaCheck.valid).toBe(true);
      
      if (!ariaCheck.valid) {
        console.log(`ARIA usage issues on ${pagePath}:`, ariaCheck.issues);
      }
    }
  });

  test('mobile accessibility validation', async ({ page, accessibilityHelper }) => {
    // Test mobile viewport accessibility
    await page.setViewportSize({ width: 375, height: 667 });
    
    const pages = ['/', '/contact'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // Run accessibility audit on mobile
      const audit = await accessibilityHelper.runFullAccessibilityAudit();
      expect(audit.violations).toHaveNoAccessibilityViolations();
      
      // Check touch targets size
      const touchTargets = page.locator('button, a, input, [role="button"], [tabindex="0"]');
      const targetCount = await touchTargets.count();
      
      for (let i = 0; i < Math.min(targetCount, 10); i++) {
        const target = touchTargets.nth(i);
        const box = await target.boundingBox();
        
        if (box) {
          // Touch targets should be at least 44x44 pixels
          expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(44);
        }
      }
      
      // Test mobile navigation accessibility
      const mobileNav = page.locator('[role="navigation"], nav');
      if (await mobileNav.count() > 0) {
        const mobileMenu = page.locator('button[aria-label*="menu" i], .hamburger, .menu-toggle');
        
        if (await mobileMenu.count() > 0) {
          const menuButton = mobileMenu.first();
          
          // Menu button should have proper labeling
          const ariaLabel = await menuButton.getAttribute('aria-label');
          const ariaExpanded = await menuButton.getAttribute('aria-expanded');
          
          expect(ariaLabel || await menuButton.textContent()).toBeTruthy();
          
          // Test menu interaction
          await menuButton.click();
          await page.waitForTimeout(500);
          
          // Menu should be announced as expanded
          const expandedState = await menuButton.getAttribute('aria-expanded');
          expect(expandedState).toBe('true');
        }
      }
    }
  });

  test('focus management validation', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForSelector('form');
    
    // Test focus indicators are visible
    const focusableElements = page.locator('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
    const elementCount = await focusableElements.count();
    
    for (let i = 0; i < Math.min(elementCount, 5); i++) {
      const element = focusableElements.nth(i);
      await element.focus();
      
      // Check if focus is visible (has outline or focus styles)
      const styles = await element.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          outline: computed.outline,
          outlineWidth: computed.outlineWidth,
          boxShadow: computed.boxShadow,
          borderColor: computed.borderColor
        };
      });
      
      // Should have some form of focus indicator
      const hasFocusIndicator = 
        styles.outline !== 'none' ||
        styles.outlineWidth !== '0px' ||
        styles.boxShadow !== 'none' ||
        styles.borderColor !== 'initial';
      
      expect(hasFocusIndicator).toBe(true);
    }
  });

  test('semantic markup validation', async ({ page }) => {
    const pages = ['/', '/contact', '/services', '/portfolio'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // Check for semantic HTML5 elements
      const semanticElements = await page.evaluate(() => {
        const semanticTags = ['main', 'nav', 'header', 'footer', 'section', 'article', 'aside'];
        return semanticTags.map(tag => ({
          tag,
          count: document.querySelectorAll(tag).length
        }));
      });
      
      // Should use semantic elements appropriately
      const hasMain = semanticElements.find(el => el.tag === 'main')?.count || 0;
      expect(hasMain).toBe(1); // Should have exactly one main element
      
      // Check for proper use of headings
      const headings = await page.evaluate(() => {
        const headingTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
        return headingTags.map(tag => ({
          tag,
          count: document.querySelectorAll(tag).length
        }));
      });
      
      const h1Count = headings.find(h => h.tag === 'h1')?.count || 0;
      expect(h1Count).toBe(1); // Should have exactly one h1
      
      // Check for lists where appropriate
      const lists = await page.evaluate(() => {
        return {
          ul: document.querySelectorAll('ul').length,
          ol: document.querySelectorAll('ol').length,
          dl: document.querySelectorAll('dl').length
        };
      });
      
      // Navigation should use lists
      const navLists = await page.evaluate(() => {
        const navs = document.querySelectorAll('nav');
        let hasLists = false;
        navs.forEach(nav => {
          if (nav.querySelector('ul, ol')) {
            hasLists = true;
          }
        });
        return hasLists;
      });
      
      if (lists.ul > 0 || lists.ol > 0) {
        expect(navLists).toBe(true);
      }
    }
  });
});

test.describe('Accessibility - Advanced @accessibility', () => {
  test('skip links validation', async ({ page }) => {
    await page.goto('/');
    
    // Check for skip links
    const skipLinks = page.locator('a[href="#main"], a[href="#content"], .skip-link');
    const skipLinkCount = await skipLinks.count();
    
    if (skipLinkCount > 0) {
      const firstSkipLink = skipLinks.first();
      
      // Skip link should be focusable
      await firstSkipLink.focus();
      await expect(firstSkipLink).toBeFocused();
      
      // Skip link should be visible when focused
      const isVisible = await firstSkipLink.isVisible();
      expect(isVisible).toBe(true);
      
      // Test skip link functionality
      await firstSkipLink.click();
      
      const targetId = await firstSkipLink.getAttribute('href');
      if (targetId?.startsWith('#')) {
        const target = page.locator(targetId);
        await expect(target).toBeFocused();
      }
    }
  });

  test('live regions validation', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForSelector('form');
    
    // Submit form to test live region announcements
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    
    // Check for live regions
    const liveRegions = page.locator('[aria-live], [role="alert"], [role="status"]');
    const liveRegionCount = await liveRegions.count();
    
    if (liveRegionCount > 0) {
      // Live regions should have content when errors occur
      for (let i = 0; i < liveRegionCount; i++) {
        const liveRegion = liveRegions.nth(i);
        const content = await liveRegion.textContent();
        const ariaLive = await liveRegion.getAttribute('aria-live');
        
        if (content && content.trim()) {
          expect(ariaLive === 'polite' || ariaLive === 'assertive').toBe(true);
        }
      }
    }
  });

  test('reduced motion support', async ({ page }) => {
    // Test with reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that animations are reduced or disabled
    const animatedElements = page.locator('[class*="animate"], [class*="transition"], [style*="animation"]');
    const animatedCount = await animatedElements.count();
    
    if (animatedCount > 0) {
      for (let i = 0; i < animatedCount; i++) {
        const element = animatedElements.nth(i);
        const styles = await element.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            animationDuration: computed.animationDuration,
            transitionDuration: computed.transitionDuration
          };
        });
        
        // Animations should be significantly reduced or disabled
        const isReduced = 
          styles.animationDuration === '0s' ||
          styles.transitionDuration === '0s' ||
          parseFloat(styles.animationDuration) <= 0.01 ||
          parseFloat(styles.transitionDuration) <= 0.01;
        
        expect(isReduced).toBe(true);
      }
    }
  });
});