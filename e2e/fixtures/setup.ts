import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../.auth/user.json');

setup('authenticate', async ({ page }) => {
  // Perform authentication steps if needed
  await page.goto('/');
  
  // Set up test environment
  await page.evaluate(() => {
    localStorage.setItem('test-environment', 'true');
    localStorage.setItem('disable-analytics-in-tests', 'true');
    sessionStorage.setItem('test-session-id', Date.now().toString());
  });

  // Pre-warm critical pages to reduce test flakiness
  const criticalPages = ['/', '/contact', '/services', '/portfolio'];
  
  for (const pagePath of criticalPages) {
    try {
      await page.goto(pagePath, { waitUntil: 'networkidle', timeout: 15000 });
      console.log(`✅ Pre-warmed: ${pagePath}`);
    } catch (error) {
      console.log(`⚠️  Failed to pre-warm ${pagePath}:`, error);
    }
  }

  // Save storage state for reuse in tests
  await page.context().storageState({ path: authFile });
});

setup('performance baseline', async ({ page }) => {
  // Establish performance baseline
  await page.goto('/');
  
  const baseline = await page.evaluate(() => {
    return {
      loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
      domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
      resources: performance.getEntriesByType('resource').length
    };
  });

  console.log('Performance baseline established:', baseline);
  
  // Store baseline for comparison in performance tests
  await page.evaluate((baseline) => {
    sessionStorage.setItem('performance-baseline', JSON.stringify(baseline));
  }, baseline);
});

setup('visual baseline', async ({ page }) => {
  // Take baseline screenshots for visual regression testing
  const pages = [
    { path: '/', name: 'homepage' },
    { path: '/contact', name: 'contact' },
    { path: '/services', name: 'services' },
    { path: '/portfolio', name: 'portfolio' }
  ];

  for (const pageInfo of pages) {
    try {
      await page.goto(pageInfo.path, { waitUntil: 'networkidle' });
      
      // Wait for any animations to complete
      await page.waitForTimeout(1000);
      
      // Take full page screenshot
      await page.screenshot({
        path: `test-results/baseline-${pageInfo.name}.png`,
        fullPage: true
      });
      
      console.log(`📸 Baseline screenshot taken: ${pageInfo.name}`);
    } catch (error) {
      console.log(`❌ Failed to take baseline for ${pageInfo.name}:`, error);
    }
  }
});