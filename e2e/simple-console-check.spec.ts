import { test } from '@playwright/test';

const pages = [
  { name: 'Home', path: '/' },
  { name: 'Services', path: '/services' },
  { name: 'Portfolio', path: '/portfolio' },
  { name: 'Blog', path: '/blog' },
  { name: 'Contact', path: '/contact' },
];

test.describe('Console Error Check', () => {
  for (const { name, path } of pages) {
    test(`${name} page`, async ({ page }) => {
      const errors: string[] = [];
      
      // Capture console errors
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          const text = msg.text();
          // Filter out PostHog errors as those are from missing API key
          if (!text.includes('PostHog') && !text.includes('posthog')) {
            errors.push(text);
          }
        }
      });
      
      // Navigate to page
      await page.goto(`http://localhost:3000${path}`, {
        waitUntil: 'domcontentloaded'
      });
      
      // Wait a bit
      await page.waitForTimeout(1000);
      
      // Report errors
      console.log(`\n${name} page (${path}):`);
      if (errors.length === 0) {
        console.log('  ✅ No console errors (excluding PostHog)');
      } else {
        console.log('  ❌ Console errors found:');
        errors.forEach(err => {
          console.log(`    - ${err.substring(0, 200)}`);
        });
      }
    });
  }
});