import { test, expect } from '@playwright/test';
import type { PerformanceMetrics, NetworkRequest } from '@/types/test';

test.describe('Dark Design System - Performance Testing', () => {
  
  test.describe.configure({ timeout: 120000 });

  test.describe('Core Web Vitals & Performance', () => {
    
    test('Homepage performance metrics', async ({ page }) => {
      // Enable performance monitoring
      const performanceMetrics: NetworkRequest[] = [];
      
      page.on('response', response => {
        performanceMetrics.push({
          url: response.url(),
          status: response.status(),
          size: response.headers()['content-length'] || 0
        });
      });
      
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Performance expectations
      expect(loadTime).toBeLessThan(8000); // 8 second max load time
      
      // Get Web Vitals using JavaScript
      const webVitals = await page.evaluate(() => {
        return new Promise((resolve) => {
          const vitals: Partial<PerformanceMetrics> = {};
          
          // First Contentful Paint
          const paintEntries = performance.getEntriesByType('paint');
          const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
          if (fcp) vitals.fcp = fcp.startTime;
          
          // Largest Contentful Paint (if available)
          if ('PerformanceObserver' in window) {
            try {
              const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                if (lastEntry) {
                  vitals.lcp = lastEntry.startTime;
                  observer.disconnect();
                  resolve(vitals);
                }
              });
              observer.observe({ entryTypes: ['largest-contentful-paint'] });
              
              // Fallback timeout
              setTimeout(() => resolve(vitals), 3000);
            } catch (e) {
              resolve(vitals);
            }
          } else {
            resolve(vitals);
          }
        });
      });
      
      console.log(`✅ Homepage loaded in ${loadTime}ms`);
      console.log(`📊 Web Vitals:`, webVitals);
      
      // Basic performance assertions
      if (webVitals.fcp) {
        expect(webVitals.fcp).toBeLessThan(3000); // FCP < 3s
      }
      if (webVitals.lcp) {
        expect(webVitals.lcp).toBeLessThan(4000); // LCP < 4s
      }
    });

    test('Services page performance', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/services');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(6000); // 6 second max
      console.log(`✅ Services page loaded in ${loadTime}ms`);
    });

    test('Contact page performance', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(5000); // 5 second max for form page
      console.log(`✅ Contact page loaded in ${loadTime}ms`);
    });

  });

  test.describe('Bundle Size & Asset Loading', () => {
    
    test('CSS and JS bundle sizes are reasonable', async ({ page }) => {
      const resources: NetworkRequest[] = [];
      
      page.on('response', async (response) => {
        const url = response.url();
        const contentType = response.headers()['content-type'] || '';
        
        if (contentType.includes('javascript') || contentType.includes('css')) {
          try {
            const body = await response.body();
            resources.push({
              url,
              type: contentType.includes('javascript') ? 'js' : 'css',
              size: body.length,
              gzipped: response.headers()['content-encoding'] === 'gzip'
            });
          } catch (e) {
            // Ignore errors for resources we can't access
          }
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Calculate total sizes
      const totalJS = resources
        .filter(r => r.type === 'js')
        .reduce((sum, r) => sum + r.size, 0);
      
      const totalCSS = resources
        .filter(r => r.type === 'css')
        .reduce((sum, r) => sum + r.size, 0);
      
      console.log(`📦 Total JavaScript: ${(totalJS / 1024).toFixed(2)} KB`);
      console.log(`🎨 Total CSS: ${(totalCSS / 1024).toFixed(2)} KB`);
      
      // Reasonable size limits (adjust based on your requirements)
      expect(totalJS).toBeLessThan(500 * 1024); // 500KB JS
      expect(totalCSS).toBeLessThan(100 * 1024); // 100KB CSS
    });

    test('Images load efficiently', async ({ page }) => {
      const images: NetworkRequest[] = [];
      
      page.on('response', async (response) => {
        const contentType = response.headers()['content-type'] || '';
        if (contentType.includes('image')) {
          try {
            const body = await response.body();
            images.push({
              url: response.url(),
              size: body.length,
              type: contentType
            });
          } catch (e) {
            // Ignore inaccessible images
          }
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const totalImageSize = images.reduce((sum, img) => sum + img.size, 0);
      console.log(`🖼️ Total images: ${images.length}, Size: ${(totalImageSize / 1024).toFixed(2)} KB`);
      
      // Check for modern image formats
      const modernFormats = images.filter(img => 
        img.type.includes('webp') || img.type.includes('avif')
      );
      
      console.log(`✅ Modern format images: ${modernFormats.length}/${images.length}`);
    });

  });

  test.describe('Animation Performance', () => {
    
    test('Hover animations perform smoothly', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Find interactive elements
      const buttons = page.locator('button, a[href], [role="button"]');
      const buttonCount = await buttons.count();
      
      if (buttonCount > 0) {
        const firstButton = buttons.first();
        
        // Measure animation performance
        const startTime = performance.now();
        
        // Perform hover multiple times to test consistency
        for (let i = 0; i < 5; i++) {
          await firstButton.hover();
          await page.waitForTimeout(100);
          await page.mouse.move(0, 0); // Move away
          await page.waitForTimeout(100);
        }
        
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        
        // Should complete smoothly
        expect(totalTime).toBeLessThan(2000); // 2 seconds for 5 hover cycles
        
        console.log(`✅ Hover animations completed in ${totalTime.toFixed(2)}ms`);
      }
    });

    test('Scroll animations are performant', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Test scroll performance
      const startTime = performance.now();
      
      // Scroll down and up multiple times
      for (let i = 0; i < 3; i++) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(300);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(300);
      }
      
      const endTime = performance.now();
      const scrollTime = endTime - startTime;
      
      expect(scrollTime).toBeLessThan(3000); // 3 seconds for scroll tests
      
      console.log(`✅ Scroll animations completed in ${scrollTime.toFixed(2)}ms`);
    });

  });

  test.describe('Memory Usage', () => {
    
    test('Memory usage stays reasonable during navigation', async ({ page }) => {
      // Navigate through all main pages to test memory usage
      const pages = ['/', '/services', '/portfolio', '/contact'];
      
      for (const pagePath of pages) {
        await page.goto(pagePath);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        
        // Get memory info if available
        const memoryInfo = await page.evaluate(() => {
          if ('memory' in performance) {
            return (performance as any).memory;
          }
          return null;
        });
        
        if (memoryInfo) {
          console.log(`📊 ${pagePath} memory: ${(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
          
          // Basic memory assertion (adjust based on your app)
          expect(memoryInfo.usedJSHeapSize).toBeLessThan(50 * 1024 * 1024); // 50MB
        }
      }
      
      console.log('✅ Memory usage test completed');
    });

  });

  test.describe('Network Efficiency', () => {
    
    test('Minimal network requests for page loads', async ({ page }) => {
      const requests: string[] = [];
      
      page.on('request', request => {
        requests.push(request.url());
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Filter out external analytics/tracking requests
      const internalRequests = requests.filter(url => 
        !url.includes('analytics') &&
        !url.includes('posthog') &&
        !url.includes('vercel') &&
        !url.includes('google') &&
        (url.includes('localhost') || url.includes('hudsondigitalsolutions'))
      );
      
      console.log(`📡 Total requests: ${requests.length}, Internal: ${internalRequests.length}`);
      
      // Should have reasonable number of requests
      expect(internalRequests.length).toBeLessThan(30); // Adjust based on your app
    });

  });

});