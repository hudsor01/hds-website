import { chromium, FullConfig, Page } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting Playwright global setup...');

  // Create a browser instance for setup tasks
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Wait for the server to be ready
    const baseURL = config.use?.baseURL || 'http://localhost:3000';
    console.log(`⏳ Waiting for server at ${baseURL}...`);
    
    // Try to connect to the server with retries
    let retries = 30; // 30 attempts, 2 seconds each = 60 seconds max
    while (retries > 0) {
      try {
        const response = await page.goto(baseURL, { timeout: 5000 });
        if (response && response.ok()) {
          console.log('✅ Server is ready!');
          break;
        }
      } catch (error) {
        retries--;
        if (retries === 0) {
          throw new Error(`❌ Server not ready after 60 seconds: ${error}`);
        }
        console.log(`⏳ Server not ready, retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Pre-warm critical pages to reduce test flakiness
    console.log('🔥 Pre-warming application pages...');
    const criticalPages = ['/', '/contact', '/services', '/portfolio'];
    
    for (const path of criticalPages) {
      try {
        await page.goto(`${baseURL}${path}`, { 
          waitUntil: 'networkidle',
          timeout: 15000 
        });
        console.log(`✅ Pre-warmed: ${path}`);
      } catch (error) {
        console.log(`⚠️  Failed to pre-warm ${path}: ${error}`);
      }
    }

    // Set up test data if needed
    await setupTestData(page, baseURL);

    console.log('✅ Global setup completed successfully!');

  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

async function setupTestData(page: Page, baseURL: string) {
  try {
    // Clear any existing test data
    await page.evaluate(() => {
      // Clear localStorage and sessionStorage
      if (typeof window !== 'undefined') {
        window.localStorage.clear();
        window.sessionStorage.clear();
      }
    });

    // Set up test environment flags
    await page.evaluate(() => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('test-environment', 'true');
        window.localStorage.setItem('disable-analytics-in-tests', 'true');
      }
    });

    console.log('✅ Test data setup completed');
  } catch (error) {
    console.log('⚠️  Test data setup failed:', error);
  }
}

export default globalSetup;