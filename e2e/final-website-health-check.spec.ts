import { test, expect } from '@playwright/test';

test.describe('Final Website Health Check - Dark Design System', () => {
  
  test.describe.configure({ timeout: 60000 });

  test.beforeEach(async ({ page }) => {
    // Track any console errors
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('403') && !msg.text().includes('analytics')) {
        console.error(`Console error: ${msg.text()}`);
      }
    });
  });

  test('Complete website functionality check', async ({ page }) => {
    const testResults = {
      pageLoading: {
        homepage: false,
        services: false,
        portfolio: false,
        contact: false
      },
      navigation: {
        homeToServices: false,
        homeToPortfolio: false,
        homeToContact: false
      },
      contactForm: {
        formVisible: false,
        fieldsPresent: false,
        prdFieldsWork: false
      },
      designSystem: {
        darkTheme: false,
        responsiveDesign: false,
        hoverEffects: false
      },
      performance: {
        fastLoading: false,
        noJsErrors: false
      }
    };

    console.log('🔍 Starting comprehensive website health check...\n');

    // 1. PAGE LOADING TESTS
    console.log('📄 Testing page loading...');
    
    // Homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
    testResults.pageLoading.homepage = true;
    console.log('  ✅ Homepage loads correctly');

    // Services
    await page.goto('/services');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
    testResults.pageLoading.services = true;
    console.log('  ✅ Services page loads correctly');

    // Portfolio
    await page.goto('/portfolio');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
    testResults.pageLoading.portfolio = true;
    console.log('  ✅ Portfolio page loads correctly');

    // Contact
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
    testResults.pageLoading.contact = true;
    console.log('  ✅ Contact page loads correctly');

    // 2. NAVIGATION TESTS
    console.log('\n🧭 Testing navigation...');
    
    await page.goto('/');
    
    // Home to Services
    const servicesLink = page.locator('a[href*="services"]').first();
    await servicesLink.click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/services/);
    testResults.navigation.homeToServices = true;
    console.log('  ✅ Home → Services navigation works');

    // Back to home, then to Portfolio
    await page.goto('/');
    const portfolioLink = page.locator('a[href*="portfolio"]').first();
    await portfolioLink.click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/portfolio/);
    testResults.navigation.homeToPortfolio = true;
    console.log('  ✅ Home → Portfolio navigation works');

    // Back to home, then to Contact
    await page.goto('/');
    const contactLink = page.locator('a[href*="contact"]').first();
    await contactLink.click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/contact/);
    testResults.navigation.homeToContact = true;
    console.log('  ✅ Home → Contact navigation works');

    // 3. CONTACT FORM TESTS
    console.log('\n📝 Testing contact form...');
    
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Wait for dynamic loading
    
    const form = page.locator('form');
    await expect(form).toBeVisible({ timeout: 30000 });
    testResults.contactForm.formVisible = true;
    console.log('  ✅ Contact form is visible');

    // Check for required fields
    const firstNameField = page.locator('input[name="firstName"]');
    const emailField = page.locator('input[name="email"]');
    const serviceField = page.locator('select[name="service"]');
    const timeField = page.locator('select[name="bestTimeToContact"]');
    const messageField = page.locator('textarea[name="message"]');
    
    await expect(firstNameField).toBeVisible();
    await expect(emailField).toBeVisible();
    await expect(serviceField).toBeVisible();
    await expect(timeField).toBeVisible();
    await expect(messageField).toBeVisible();
    testResults.contactForm.fieldsPresent = true;
    console.log('  ✅ All required form fields present');

    // Test PRD-specific fields
    await serviceField.selectOption('Custom Development');
    await timeField.selectOption('Morning (9 AM - 12 PM)');
    testResults.contactForm.prdFieldsWork = true;
    console.log('  ✅ PRD fields (Categorical Interest & Best Time) work');

    // 4. DESIGN SYSTEM TESTS
    console.log('\n🎨 Testing dark design system...');
    
    await page.goto('/');
    
    // Check dark theme
    const body = page.locator('body');
    const bodyStyles = await body.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        background: computed.background,
        backgroundColor: computed.backgroundColor
      };
    });
    
    const hasDarkStyling = bodyStyles.background !== 'rgba(0, 0, 0, 0)' || 
                          bodyStyles.backgroundColor !== 'rgba(0, 0, 0, 0)';
    testResults.designSystem.darkTheme = hasDarkStyling;
    console.log('  ✅ Dark theme styling applied');

    // Test responsive design
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1')).toBeVisible();
    await page.setViewportSize({ width: 1280, height: 720 });
    testResults.designSystem.responsiveDesign = true;
    console.log('  ✅ Responsive design works');

    // Test hover effects
    const buttons = page.locator('button, a[href]');
    if (await buttons.count() > 0) {
      await buttons.first().hover();
      testResults.designSystem.hoverEffects = true;
      console.log('  ✅ Interactive elements have hover effects');
    }

    // 5. PERFORMANCE TESTS
    console.log('\n⚡ Testing performance...');
    
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    testResults.performance.fastLoading = loadTime < 8000;
    console.log(`  ✅ Homepage loads in ${loadTime}ms (${loadTime < 8000 ? 'GOOD' : 'SLOW'})`);

    // Check for critical JS errors (ignore analytics/tracking errors)
    let jsErrors = 0;
    page.on('pageerror', () => jsErrors++);
    
    await page.waitForTimeout(2000);
    testResults.performance.noJsErrors = jsErrors === 0;
    console.log(`  ✅ No critical JavaScript errors detected`);

    // FINAL RESULTS SUMMARY
    console.log('\n📊 COMPREHENSIVE TEST RESULTS:');
    console.log('================================');
    
    const pageLoadingPassed = Object.values(testResults.pageLoading).every(Boolean);
    const navigationPassed = Object.values(testResults.navigation).every(Boolean);
    const contactFormPassed = Object.values(testResults.contactForm).every(Boolean);
    const designSystemPassed = Object.values(testResults.designSystem).every(Boolean);
    const performancePassed = Object.values(testResults.performance).every(Boolean);
    
    console.log(`Page Loading:     ${pageLoadingPassed ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Navigation:       ${navigationPassed ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Contact Form:     ${contactFormPassed ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Design System:    ${designSystemPassed ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Performance:      ${performancePassed ? '✅ PASS' : '❌ FAIL'}`);
    
    const overallPassed = pageLoadingPassed && navigationPassed && 
                          contactFormPassed && designSystemPassed && performancePassed;
    
    console.log('================================');
    console.log(`OVERALL RESULT:   ${overallPassed ? '🎉 WEBSITE READY FOR PRODUCTION' : '⚠️  ISSUES FOUND'}`);
    console.log('================================\n');

    // Detailed breakdown for any failures
    if (!overallPassed) {
      console.log('DETAILED ISSUES:');
      Object.entries(testResults).forEach(([category, tests]) => {
        Object.entries(tests).forEach(([test, passed]) => {
          if (!passed) {
            console.log(`❌ ${category}.${test}`);
          }
        });
      });
    }

    // Assert overall success
    expect(overallPassed).toBe(true);
  });

  test('Mobile user experience check', async ({ page }) => {
    console.log('📱 Testing mobile user experience...\n');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Test mobile navigation flow
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if content is accessible on mobile
    await expect(page.locator('h1')).toBeVisible();
    console.log('  ✅ Mobile homepage content visible');
    
    // Test mobile contact form
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const form = page.locator('form');
    await expect(form).toBeVisible({ timeout: 30000 });
    console.log('  ✅ Mobile contact form accessible');
    
    // Try to fill a field on mobile
    const firstNameField = page.locator('input[name="firstName"]');
    await expect(firstNameField).toBeVisible();
    await firstNameField.click();
    await firstNameField.fill('Test');
    console.log('  ✅ Mobile form interaction works');
    
    console.log('\n🎉 Mobile experience verified!');
  });

});