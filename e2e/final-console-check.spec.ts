import { test } from '@playwright/test';

test('Check console errors on all pages', async ({ page }) => {
  const pages = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
  ];

  console.log('\n=== CONSOLE ERROR CHECK RESULTS ===\n');
  
  for (const { name, path } of pages) {
    const errors: string[] = [];
    
    // Capture console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Filter out PostHog and other external API errors
        if (!text.includes('PostHog') && 
            !text.includes('posthog') && 
            !text.includes('Failed to load resource') &&
            !text.includes('404') &&
            !text.includes('401') &&
            !text.includes('403') &&
            !text.includes('429')) {
          errors.push(text);
        }
      }
    });
    
    // Navigate to page
    await page.goto(`http://localhost:3000${path}`, {
      waitUntil: 'domcontentloaded'
    });
    
    // Wait for any delayed errors
    await page.waitForTimeout(1000);
    
    // Report results
    if (errors.length === 0) {
      console.log(`✅ ${name} page (${path}): No console errors`);
    } else {
      console.log(`❌ ${name} page (${path}): Found ${errors.length} error(s)`);
      errors.forEach((err, i) => {
        // Only show first 150 chars of error
        const truncated = err.length > 150 ? err.substring(0, 150) + '...' : err;
        console.log(`   ${i + 1}. ${truncated}`);
      });
    }
  }
  
  console.log('\n=== END OF CONSOLE ERROR CHECK ===\n');
});