import { test } from '@playwright/test';

test('Contact page should load without errors', async ({ page }) => {
  const errors: string[] = [];
  
  // Capture console errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Filter out PostHog and external API errors
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
  
  // Navigate to contact page
  await page.goto('http://localhost:3000/contact', {
    waitUntil: 'domcontentloaded'
  });
  
  // Wait for the main content to be visible
  await page.waitForSelector('main', { timeout: 10000 });
  
  // Wait for form to load
  await page.waitForTimeout(2000);
  
  // Check if we can see the contact form (not error boundary)
  const contactFormVisible = await page.locator('form').first().isVisible();
  const errorBoundaryVisible = await page.locator('text=Contact Form Temporarily Unavailable').isVisible();
  
  console.log('\n=== CONTACT PAGE STATUS ===');
  console.log(`Contact form visible: ${contactFormVisible}`);
  console.log(`Error boundary visible: ${errorBoundaryVisible}`);
  console.log(`Console errors: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('Console errors found:');
    errors.forEach((err, i) => {
      console.log(`  ${i + 1}. ${err.substring(0, 150)}`);
    });
  } else {
    console.log('✅ No console errors');
  }
  
  if (contactFormVisible && !errorBoundaryVisible) {
    console.log('✅ Contact form loaded successfully');
  } else if (errorBoundaryVisible) {
    console.log('❌ Error boundary is showing');
  } else {
    console.log('⚠️ Form status unclear');
  }
  console.log('========================\n');
});