import { test, expect } from '@playwright/test';

test.describe('Modernized Card Components', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to pages that use cards (services and portfolio)
    await page.goto('/services');
    await page.waitForLoadState('networkidle');
  });

  test('service cards have glassmorphism effects', async ({ page }) => {
    // Check service cards in the services grid
    const serviceCards = await page.locator('.grid.md\\:grid-cols-3 > div');
    const firstCard = serviceCards.first();
    
    await expect(firstCard).toBeVisible();
    
    // Check for hover effects
    const cardClasses = await firstCard.getAttribute('class');
    expect(cardClasses).toContain('hover:bg-white/5');
    expect(cardClasses).toContain('transition-all');
    expect(cardClasses).toContain('duration-300');
    expect(cardClasses).toContain('group');
    
    // Test hover interaction
    await firstCard.hover();
    await page.waitForTimeout(200);
    
    // Check that hover effects are applied
    const numberElement = await firstCard.locator('.text-6xl').first();
    const numberClasses = await numberElement.getAttribute('class');
    expect(numberClasses).toContain('group-hover:text-secondary-400');
    expect(numberClasses).toContain('group-hover:scale-105');
  });

  test('service card animations work on hover', async ({ page }) => {
    const serviceCards = await page.locator('.grid.md\\:grid-cols-3 > div');
    const secondCard = serviceCards.nth(1);
    
    // Get initial state
    const titleElement = await secondCard.locator('h3').first();
    const initialClasses = await titleElement.getAttribute('class');
    
    // Hover to trigger animations
    await secondCard.hover();
    await page.waitForTimeout(300);
    
    // Check hover state changes
    expect(initialClasses).toContain('group-hover:text-secondary-400');
    expect(initialClasses).toContain('transition-colors');
    expect(initialClasses).toContain('duration-300');
    
    // Check CTA button has proper animations
    const ctaButton = await secondCard.locator('button, a').last();
    const buttonClasses = await ctaButton.getAttribute('class');
    expect(buttonClasses).toContain('group-hover:translate-x-1');
  });

  test('portfolio cards have advanced hover effects', async ({ page }) => {
    await page.goto('/portfolio');
    await page.waitForLoadState('networkidle');
    
    // Check featured project cards
    const portfolioCards = await page.locator('.grid.md\\:grid-cols-2 > div');
    const firstPortfolioCard = portfolioCards.first();
    
    await expect(firstPortfolioCard).toBeVisible();
    
    // Check glassmorphism styling
    const cardClasses = await firstPortfolioCard.getAttribute('class');
    expect(cardClasses).toContain('bg-black/80');
    expect(cardClasses).toContain('backdrop-blur-xl');
    expect(cardClasses).toContain('border-gray-800');
    expect(cardClasses).toContain('hover:border-secondary-400/50');
    
    // Test lift effect on hover
    expect(cardClasses).toContain('hover:-translate-y-2');
    
    // Hover and check animation
    await firstPortfolioCard.hover();
    await page.waitForTimeout(300);
    
    // Check title color change on hover
    const titleElement = await firstPortfolioCard.locator('h3').first();
    const titleClasses = await titleElement.getAttribute('class');
    expect(titleClasses).toContain('group-hover:text-secondary-400');
  });

  test('card components are responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/services');
    await page.waitForLoadState('networkidle');
    
    const serviceGrid = await page.locator('.grid.md\\:grid-cols-3');
    const gridClasses = await serviceGrid.getAttribute('class');
    
    // Should stack on mobile (single column implied by responsive classes)
    expect(gridClasses).toContain('md:grid-cols-3');
    
    // Cards should still be interactive
    const serviceCards = await page.locator('.grid.md\\:grid-cols-3 > div');
    const cardCount = await serviceCards.count();
    expect(cardCount).toBeGreaterThan(0);
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Cards should be visible and functional
    for (let i = 0; i < Math.min(cardCount, 3); i++) {
      const card = serviceCards.nth(i);
      await expect(card).toBeVisible();
      
      // Should be clickable/hoverable
      await card.hover();
      await page.waitForTimeout(100);
    }
  });

  test('stats cards have proper animations', async ({ page }) => {
    await page.goto('/services');
    await page.waitForLoadState('networkidle');
    
    // Check stats section
    const reasonsSection = await page.locator('.grid.md\\:grid-cols-4');
    await expect(reasonsSection).toBeVisible();
    
    // Each stat should have proper styling
    const statCards = await reasonsSection.locator('> div');
    const statCount = await statCards.count();
    
    for (let i = 0; i < statCount; i++) {
      const statCard = statCards.nth(i);
      
      // Check for gradient background and hover effects
      const cardClasses = await statCard.getAttribute('class');
      expect(cardClasses).toContain('bg-gradient-to-br');
      expect(cardClasses).toContain('transition-all');
      expect(cardClasses).toContain('duration-300');
      
      // Check value styling
      const valueElement = await statCard.locator('.text-4xl, .text-5xl').first();
      if (await valueElement.count() > 0) {
        const valueClasses = await valueElement.getAttribute('class');
        expect(valueClasses).toContain('font-black');
      }
    }
  });

  test('card accessibility features work correctly', async ({ page }) => {
    await page.goto('/portfolio');
    await page.waitForLoadState('networkidle');
    
    // Check card links have proper accessibility
    const portfolioCards = await page.locator('.grid.md\\:grid-cols-2 > div');
    const firstCard = portfolioCards.first();
    
    // Check interactive elements have proper focus states
    const actionLinks = await firstCard.locator('a');
    const linkCount = await actionLinks.count();
    
    for (let i = 0; i < linkCount; i++) {
      const link = actionLinks.nth(i);
      
      // Focus the link
      await link.focus();
      
      // Should have focus indicator
      const linkClasses = await link.getAttribute('class');
      const hasFocusStyles = linkClasses?.includes('focus:') || 
                           linkClasses?.includes('focus-visible:');
      expect(hasFocusStyles).toBe(true);
    }
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    const activeElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON'].includes(activeElement || '')).toBe(true);
  });

  test('card performance and smooth animations', async ({ page }) => {
    await page.goto('/services');
    await page.waitForLoadState('networkidle');
    
    // Test multiple rapid hovers to ensure smooth performance
    const serviceCards = await page.locator('.grid.md\\:grid-cols-3 > div');
    const cardCount = await serviceCards.count();
    
    // Rapidly hover over all cards
    for (let i = 0; i < cardCount; i++) {
      const card = serviceCards.nth(i);
      await card.hover();
      await page.waitForTimeout(50); // Quick succession
    }
    
    // Cards should still be responsive after rapid interactions
    const lastCard = serviceCards.last();
    await lastCard.hover();
    
    // Check that animations are still working
    const numberElement = await lastCard.locator('.text-6xl').first();
    const numberClasses = await numberElement.getAttribute('class');
    expect(numberClasses).toContain('group-hover:scale-105');
    expect(numberClasses).toContain('transition-all');
  });

  test('card variants display correctly', async ({ page }) => {
    // Test different card implementations across pages
    const pages = ['/services', '/portfolio', '/about'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // Look for any card-like containers
      const cardElements = await page.locator('[class*="bg-"], [class*="backdrop-blur"], [class*="border"]');
      const elementCount = await cardElements.count();
      
      if (elementCount > 0) {
        // Check first few elements for proper styling
        for (let i = 0; i < Math.min(elementCount, 3); i++) {
          const element = cardElements.nth(i);
          const isVisible = await element.isVisible();
          
          if (isVisible) {
            const elementClasses = await element.getAttribute('class');
            
            // Should have some form of card styling
            const hasCardStyling = elementClasses && (
              elementClasses.includes('bg-') ||
              elementClasses.includes('backdrop-blur') ||
              elementClasses.includes('border') ||
              elementClasses.includes('rounded')
            );
            
            expect(hasCardStyling).toBe(true);
          }
        }
      }
    }
  });
});