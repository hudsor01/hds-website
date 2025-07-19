#!/usr/bin/env node

/**
 * Quick Visual Testing Suite
 * Simple browser automation to capture screenshots and validate visual elements
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function runQuickVisualTest() {
  console.log('🎨 Starting Quick Visual Testing Suite...');
  
  const screenshotDir = path.join(process.cwd(), 'visual-test-screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  try {
    const page = await context.newPage();
    
    // Test pages to capture
    const pages = [
      { path: '/', name: 'home', title: 'Home Page' },
      { path: '/about', name: 'about', title: 'About Page' },
      { path: '/services', name: 'services', title: 'Services Page' },
      { path: '/contact', name: 'contact', title: 'Contact Page' },
      { path: '/blog', name: 'blog', title: 'Blog Page' }
    ];

    const results = [];

    for (const testPage of pages) {
      console.log(`📸 Testing ${testPage.title}...`);
      
      try {
        const startTime = Date.now();
        const response = await page.goto(`http://localhost:3000${testPage.path}`, {
          waitUntil: 'networkidle',
          timeout: 10000
        });
        const loadTime = Date.now() - startTime;

        if (response && response.ok()) {
          // Desktop screenshot
          await page.screenshot({ 
            path: path.join(screenshotDir, `${testPage.name}-desktop.png`),
            fullPage: true 
          });

          // Mobile screenshot
          await page.setViewportSize({ width: 375, height: 667 });
          await page.screenshot({ 
            path: path.join(screenshotDir, `${testPage.name}-mobile.png`),
            fullPage: true 
          });
          
          // Reset viewport
          await page.setViewportSize({ width: 1920, height: 1080 });

          // Check for essential elements
          const title = await page.title();
          const hasNavigation = await page.locator('nav').count() > 0;
          const hasFooter = await page.locator('footer').count() > 0;
          const hasMainContent = await page.locator('main, [id*="main"]').count() > 0;

          results.push({
            page: testPage.title,
            status: 'PASS',
            loadTime,
            title,
            hasNavigation,
            hasFooter,
            hasMainContent,
            screenshots: [
              `${testPage.name}-desktop.png`,
              `${testPage.name}-mobile.png`
            ]
          });

          console.log(`✅ ${testPage.title}: Loaded in ${loadTime}ms`);
        } else {
          results.push({
            page: testPage.title,
            status: 'FAIL',
            error: `HTTP ${response?.status() || 'No response'}`
          });
          console.log(`❌ ${testPage.title}: Failed to load`);
        }
      } catch (error) {
        results.push({
          page: testPage.title,
          status: 'FAIL',
          error: error.message
        });
        console.log(`❌ ${testPage.title}: Error - ${error.message}`);
      }
    }

    // Test contact form interaction
    console.log('📝 Testing Contact Form Interaction...');
    try {
      await page.goto('http://localhost:3000/contact');
      
      // Try to fill out form
      const firstName = page.locator('input[name="firstName"], input[placeholder*="First"]').first();
      const lastName = page.locator('input[name="lastName"], input[placeholder*="Last"]').first();
      const email = page.locator('input[name="email"], input[type="email"]').first();
      const message = page.locator('textarea[name="message"], textarea').first();

      if (await firstName.count() > 0) await firstName.fill('Test');
      if (await lastName.count() > 0) await lastName.fill('User');
      if (await email.count() > 0) await email.fill('test@example.com');
      if (await message.count() > 0) await message.fill('Test message for visual testing');

      // Screenshot with filled form
      await page.screenshot({ 
        path: path.join(screenshotDir, 'contact-form-filled.png'),
        fullPage: true 
      });

      // Try to submit
      const submitButton = page.locator('button[type="submit"], input[type="submit"]').first();
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(2000);
        
        // Screenshot after submission
        await page.screenshot({ 
          path: path.join(screenshotDir, 'contact-form-submitted.png'),
          fullPage: true 
        });
      }

      console.log('✅ Contact Form: Interaction tested');
    } catch (error) {
      console.log(`❌ Contact Form: ${error.message}`);
    }

    // Test theme toggle if available
    console.log('🌙 Testing Theme Toggle...');
    try {
      await page.goto('http://localhost:3000/');
      
      // Look for theme toggle
      const themeToggle = page.locator('button:has-text("theme"), button:has-text("dark"), button:has-text("light"), [aria-label*="theme"]').first();
      
      if (await themeToggle.count() > 0) {
        // Screenshot before theme change
        await page.screenshot({ 
          path: path.join(screenshotDir, 'theme-light.png'),
          fullPage: true 
        });

        // Toggle theme
        await themeToggle.click();
        await page.waitForTimeout(500);

        // Screenshot after theme change
        await page.screenshot({ 
          path: path.join(screenshotDir, 'theme-dark.png'),
          fullPage: true 
        });

        console.log('✅ Theme Toggle: Working');
      } else {
        console.log('⚠️ Theme Toggle: Not found');
      }
    } catch (error) {
      console.log(`❌ Theme Toggle: ${error.message}`);
    }

    // Generate summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 VISUAL TESTING SUMMARY');
    console.log('='.repeat(60));

    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;

    console.log(`Total Pages Tested: ${results.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);

    if (passed > 0) {
      console.log('\n✅ SUCCESSFUL TESTS:');
      results.filter(r => r.status === 'PASS').forEach(result => {
        console.log(`  ${result.page}: ${result.loadTime}ms (${result.title})`);
        console.log(`    Navigation: ${result.hasNavigation ? '✓' : '✗'}`);
        console.log(`    Footer: ${result.hasFooter ? '✓' : '✗'}`);
        console.log(`    Main Content: ${result.hasMainContent ? '✓' : '✗'}`);
        console.log(`    Screenshots: ${result.screenshots.join(', ')}`);
      });
    }

    if (failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      results.filter(r => r.status === 'FAIL').forEach(result => {
        console.log(`  ${result.page}: ${result.error}`);
      });
    }

    console.log(`\n📷 Screenshots saved to: ${screenshotDir}`);
    console.log('='.repeat(60));

  } finally {
    await context.close();
    await browser.close();
  }
}

// Run the test
runQuickVisualTest().catch(console.error);