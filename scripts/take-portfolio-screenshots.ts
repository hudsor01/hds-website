import { chromium, Browser, Page } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

interface ScreenshotConfig {
  url: string;
  name: string;
  pages: Array<{
    path: string;
    name: string;
    waitFor?: string;
  }>;
}

const sites: ScreenshotConfig[] = [
  {
    url: 'https://ink37tattoos.com',
    name: 'ink37tattoos',
    pages: [
      { path: '/', name: 'hero' },
      { path: '/booking', name: 'booking' },
      { path: '/gallery', name: 'gallery' },
      { path: '/artists', name: 'artists' }
    ]
  },
  {
    url: 'https://tenantflow.app',
    name: 'tenantflow',
    pages: [
      { path: '/', name: 'hero' },
      { path: '/features', name: 'features' },
      { path: '/pricing', name: 'pricing' },
      { path: '/login', name: 'login' }
    ]
  }
];

const viewports = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'mobile', width: 375, height: 667 }
];

async function takeScreenshots() {
  const browser: Browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const outputDir = '/Users/richard/Developer/business-website/public/portfolio';
  
  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  for (const site of sites) {
    console.log(`📸 Taking screenshots for ${site.name}...`);
    
    for (const viewport of viewports) {
      console.log(`  📱 ${viewport.name} viewport (${viewport.width}x${viewport.height})`);
      
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        userAgent: viewport.name === 'mobile' 
          ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
          : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });
      
      const page: Page = await context.newPage();
      
      try {
        for (const pageConfig of site.pages) {
          const fullUrl = `${site.url}${pageConfig.path}`;
          console.log(`    🌐 ${fullUrl}`);
          
          try {
            // Navigate to the page
            await page.goto(fullUrl, { 
              waitUntil: 'networkidle', 
              timeout: 30000 
            });
            
            // Wait for any specific elements if specified
            if (pageConfig.waitFor) {
              await page.waitForSelector(pageConfig.waitFor, { timeout: 10000 });
            }
            
            // Wait a bit more for animations and lazy loading
            await page.waitForTimeout(2000);
            
            // Hide cookie banners, chat widgets, and other overlays
            await page.addStyleTag({
              content: `
                [class*="cookie"], [id*="cookie"],
                [class*="chat"], [id*="chat"],
                [class*="popup"], [id*="popup"],
                [class*="banner"], [id*="banner"],
                [class*="modal"], [id*="modal"],
                .fixed.bottom-0, .fixed.top-0,
                [style*="position: fixed"] {
                  display: none !important;
                }
              `
            });
            
            // Take screenshot
            const filename = `${site.name}-${pageConfig.name}-${viewport.name}.png`;
            const filepath = path.join(outputDir, filename);
            
            await page.screenshot({
              path: filepath,
              fullPage: true
            });
            
            console.log(`    ✅ Saved: ${filename}`);
            
          } catch (pageError) {
            console.log(`    ⚠️  Failed to screenshot ${pageConfig.path}: ${pageError.message}`);
            
            // Try to take a screenshot of whatever loaded
            try {
              const filename = `${site.name}-${pageConfig.name}-${viewport.name}-partial.png`;
              const filepath = path.join(outputDir, filename);
              await page.screenshot({
                path: filepath,
                fullPage: true
              });
              console.log(`    📷 Partial screenshot saved: ${filename}`);
            } catch (screenshotError) {
              console.log(`    ❌ Could not take any screenshot: ${screenshotError.message}`);
            }
          }
        }
        
      } catch (siteError) {
        console.log(`  ❌ Failed to access ${site.url}: ${siteError.message}`);
      }
      
      await context.close();
    }
  }
  
  await browser.close();
  console.log('🎉 Screenshot capture complete!');
}

// Run the script
takeScreenshots().catch(console.error);