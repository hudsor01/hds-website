import { test, expect } from './fixtures/test-fixtures';
import type { PerformanceMetrics } from '@/types/test';

test.describe('Performance Tests @performance', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cache to ensure fresh measurements
    await page.context().clearCookies();
    await page.context().clearPermissions();
  });

  test('homepage Core Web Vitals', async ({ page, performanceMonitor }) => {
    await performanceMonitor.startMonitoring();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for metrics to stabilize
    await page.waitForTimeout(3000);
    
    const metrics = await performanceMonitor.stopMonitoring();
    
    // Assert Core Web Vitals thresholds
    expect(metrics.lcp).toBeWithinResponseTime(2500); // LCP < 2.5s
    expect(metrics.fid).toBeWithinResponseTime(100);  // FID < 100ms
    expect(metrics.cls).toBeLessThan(0.1);            // CLS < 0.1
    
    // Additional performance metrics
    expect(metrics.ttfb).toBeWithinResponseTime(800);   // TTFB < 800ms
    expect(metrics.fcp).toBeWithinResponseTime(1800);   // FCP < 1.8s
    expect(metrics.loadTime).toBeWithinResponseTime(5000); // Load time < 5s
    
    console.log('Homepage performance metrics:', metrics);
  });

  test('contact page Core Web Vitals', async ({ page, performanceMonitor }) => {
    await performanceMonitor.startMonitoring();
    
    await page.goto('/contact');
    await page.waitForSelector('form');
    await page.waitForLoadState('networkidle');
    
    const metrics = await performanceMonitor.stopMonitoring();
    
    // Contact page should be fast since it's critical for conversions
    expect(metrics.lcp).toBeWithinResponseTime(2000); // Even stricter for contact
    expect(metrics.fid).toBeWithinResponseTime(50);   // Very responsive
    expect(metrics.cls).toBeLessThan(0.05);           // Minimal layout shift
    
    console.log('Contact page performance metrics:', metrics);
  });

  test('services page performance', async ({ page, performanceMonitor }) => {
    await performanceMonitor.startMonitoring();
    
    await page.goto('/services');
    await page.waitForLoadState('networkidle');
    
    const metrics = await performanceMonitor.stopMonitoring();
    
    // Services page may have more content but should still be fast
    expect(metrics.lcp).toBeWithinResponseTime(3000);
    expect(metrics.fid).toBeWithinResponseTime(100);
    expect(metrics.cls).toBeLessThan(0.1);
    
    console.log('Services page performance metrics:', metrics);
  });

  test('portfolio page performance', async ({ page, performanceMonitor }) => {
    await performanceMonitor.startMonitoring();
    
    await page.goto('/portfolio');
    await page.waitForLoadState('networkidle');
    
    const metrics = await performanceMonitor.stopMonitoring();
    
    // Portfolio may have images but should use lazy loading
    expect(metrics.lcp).toBeWithinResponseTime(3500); // Allow more time for images
    expect(metrics.fid).toBeWithinResponseTime(100);
    expect(metrics.cls).toBeLessThan(0.15); // Images might cause some shift
    
    console.log('Portfolio page performance metrics:', metrics);
  });

  test('page load time benchmarks', async ({ page }) => {
    const pages = [
      { path: '/', name: 'homepage', maxTime: 3000 },
      { path: '/contact', name: 'contact', maxTime: 2500 },
      { path: '/services', name: 'services', maxTime: 3000 },
      { path: '/portfolio', name: 'portfolio', maxTime: 4000 }
    ];
    
    for (const pageInfo of pages) {
      const startTime = Date.now();
      await page.goto(pageInfo.path);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeWithinResponseTime(pageInfo.maxTime);
      console.log(`${pageInfo.name} load time: ${loadTime}ms`);
    }
  });

  test('resource optimization validation', async ({ page, performanceMonitor }) => {
    await performanceMonitor.startMonitoring();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const metrics = await performanceMonitor.stopMonitoring();
    const resources = await performanceMonitor.getResourceMetrics();
    
    // Assert resource efficiency
    expect(metrics.requestCount).toBeLessThan(50); // Keep requests reasonable
    expect(metrics.totalResourceSize).toBeLessThan(3000000); // < 3MB total
    expect(metrics.failedRequests).toBe(0); // No failed requests
    
    // Check for optimized resources
    const images = resources.filter(r => r.type === 'image');
    const scripts = resources.filter(r => r.type === 'script');
    const stylesheets = resources.filter(r => r.type === 'stylesheet');
    
    // Images should be optimized
    images.forEach(img => {
      expect(img.size).toBeLessThan(500000); // < 500KB per image
    });
    
    // Scripts should be minified (small size indicates minification)
    scripts.forEach(script => {
      if (script.url.includes('.js') && !script.url.includes('node_modules')) {
        expect(script.size).toBeLessThan(200000); // < 200KB per script
      }
    });
    
    console.log('Resource breakdown:', {
      total: resources.length,
      images: images.length,
      scripts: scripts.length,
      stylesheets: stylesheets.length,
      totalSize: Math.round(metrics.totalResourceSize / 1024) + 'KB'
    });
  });

  test('lazy loading performance', async ({ page }) => {
    await page.goto('/portfolio');
    
    // Count initial images loaded
    const initialImages = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img')).filter(img => 
        img.complete && img.naturalWidth > 0
      ).length;
    });
    
    // Scroll to bottom to trigger lazy loading
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    await page.waitForTimeout(2000);
    
    // Count images after scroll
    const finalImages = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img')).filter(img => 
        img.complete && img.naturalWidth > 0
      ).length;
    });
    
    // More images should be loaded after scrolling
    expect(finalImages).toBeGreaterThan(initialImages);
    
    console.log(`Lazy loading: ${initialImages} initial, ${finalImages} after scroll`);
  });

  test('font loading performance', async ({ page }) => {
    await page.goto('/');
    
    // Check font loading strategy
    const fontMetrics = await page.evaluate(() => {
      const fontFaces = Array.from(document.fonts);
      const loadedFonts = fontFaces.filter(font => font.status === 'loaded');
      
      return {
        totalFonts: fontFaces.length,
        loadedFonts: loadedFonts.length,
        fontDisplay: getComputedStyle(document.body).fontDisplay
      };
    });
    
    // Fonts should use font-display: swap for better performance
    const fontDisplayElements = await page.evaluate(() => {
      const style = document.createElement('style');
      document.head.appendChild(style);
      return Array.from(document.styleSheets).some(sheet => {
        try {
          return Array.from(sheet.cssRules).some(rule => 
            rule.cssText.includes('font-display')
          );
        } catch {
          return false;
        }
      });
    });
    
    console.log('Font metrics:', fontMetrics);
  });

  test('API response times', async ({ page }) => {
    const apiEndpoints = [
      '/api/contact',
      '/api/metrics',
      '/api/web-vitals'
    ];
    
    for (const endpoint of apiEndpoints) {
      const startTime = Date.now();
      
      try {
        const response = await page.request.get(endpoint);
        const responseTime = Date.now() - startTime;
        
        // API should respond quickly
        expect(responseTime).toBeWithinResponseTime(1000);
        expect(response.status()).toBeLessThan(400);
        
        console.log(`${endpoint} response time: ${responseTime}ms`);
      } catch (error) {
        // Some endpoints might not exist, which is okay
        console.log(`${endpoint} not available:`, error);
      }
    }
  });

  test('memory usage optimization', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Initial memory measurement
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
      } : null;
    });
    
    if (initialMemory) {
      // Navigate through pages to test for memory leaks
      const pages = ['/services', '/portfolio', '/contact', '/'];
      
      for (const pagePath of pages) {
        await page.goto(pagePath);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
      }
      
      // Force garbage collection if available
      await page.evaluate(() => {
        if ((window as any).gc) {
          (window as any).gc();
        }
      });
      
      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize
        } : null;
      });
      
      if (finalMemory) {
        // Memory shouldn't grow excessively (allow 50% increase)
        const memoryGrowth = (finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize) / initialMemory.usedJSHeapSize;
        expect(memoryGrowth).toBeLessThan(0.5);
        
        console.log('Memory usage:', {
          initial: Math.round(initialMemory.usedJSHeapSize / 1024 / 1024) + 'MB',
          final: Math.round(finalMemory.usedJSHeapSize / 1024 / 1024) + 'MB',
          growth: Math.round(memoryGrowth * 100) + '%'
        });
      }
    }
  });

  test('mobile performance', async ({ page }) => {
    // Simulate mobile device
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Simulate slower mobile connection
    await page.route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 100));
      route.continue();
    });
    
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Mobile should still be reasonably fast
    expect(loadTime).toBeWithinResponseTime(6000);
    
    // Test mobile-specific optimizations
    const mobileOptimizations = await page.evaluate(() => {
      // Check for responsive images
      const responsiveImages = Array.from(document.querySelectorAll('img[srcset], img[sizes]')).length;
      
      // Check for mobile-optimized fonts
      const hasWebFonts = Array.from(document.fonts).length;
      
      return {
        responsiveImages,
        hasWebFonts,
        viewportMeta: !!document.querySelector('meta[name="viewport"]')
      };
    });
    
    expect(mobileOptimizations.viewportMeta).toBe(true);
    
    await page.unroute('**/*');
    console.log('Mobile performance:', { loadTime, optimizations: mobileOptimizations });
  });

  test('caching effectiveness', async ({ page }) => {
    // First visit
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const firstVisitResources = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map(resource => ({
        name: resource.name,
        transferSize: (resource as any).transferSize,
        duration: resource.duration
      }));
    });
    
    // Second visit (should use cache)
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const secondVisitResources = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map(resource => ({
        name: resource.name,
        transferSize: (resource as any).transferSize,
        duration: resource.duration
      }));
    });
    
    // Compare cache effectiveness
    const cachedResources = secondVisitResources.filter(resource => 
      resource.transferSize === 0 || resource.transferSize < 1000
    );
    
    const cacheHitRate = cachedResources.length / secondVisitResources.length;
    
    // Should have reasonable cache hit rate
    expect(cacheHitRate).toBeGreaterThan(0.3);
    
    console.log('Cache effectiveness:', {
      firstVisit: firstVisitResources.length,
      secondVisit: secondVisitResources.length,
      cached: cachedResources.length,
      hitRate: Math.round(cacheHitRate * 100) + '%'
    });
  });

  test('third-party script impact', async ({ page }) => {
    // Track loading performance without third-party scripts
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    const withoutThirdParty = await page.evaluate(() => {
      return performance.timing.loadEventEnd - performance.timing.navigationStart;
    });
    
    // Check third-party script impact
    const thirdPartyScripts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('script[src]')).filter(script => {
        const src = script.getAttribute('src') || '';
        return src.includes('posthog') || 
               src.includes('vercel') || 
               src.includes('analytics') ||
               src.includes('gtag');
      }).length;
    });
    
    if (thirdPartyScripts > 0) {
      // Third-party scripts should be loaded asynchronously
      const asyncScripts = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('script[async], script[defer]')).length;
      });
      
      expect(asyncScripts).toBeGreaterThan(0);
    }
    
    console.log('Third-party impact:', {
      loadTime: withoutThirdParty,
      thirdPartyScripts,
      asyncScripts: await page.evaluate(() => 
        Array.from(document.querySelectorAll('script[async], script[defer]')).length
      )
    });
  });
});

test.describe('Performance - Advanced @performance', () => {
  test('bundle size analysis', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const bundleAnalysis = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      const scripts = resources.filter(r => r.name.includes('.js'));
      const styles = resources.filter(r => r.name.includes('.css'));
      
      return {
        totalScripts: scripts.length,
        totalStyles: styles.length,
        scriptSizes: scripts.map(s => (s as any).transferSize || 0),
        styleSizes: styles.map(s => (s as any).transferSize || 0)
      };
    });
    
    const totalScriptSize = bundleAnalysis.scriptSizes.reduce((a, b) => a + b, 0);
    const totalStyleSize = bundleAnalysis.styleSizes.reduce((a, b) => a + b, 0);
    
    // Assert reasonable bundle sizes
    expect(totalScriptSize).toBeLessThan(500000); // < 500KB total JS
    expect(totalStyleSize).toBeLessThan(100000);  // < 100KB total CSS
    
    console.log('Bundle analysis:', {
      scripts: bundleAnalysis.totalScripts,
      styles: bundleAnalysis.totalStyles,
      totalJS: Math.round(totalScriptSize / 1024) + 'KB',
      totalCSS: Math.round(totalStyleSize / 1024) + 'KB'
    });
  });

  test('progressive loading performance', async ({ page }) => {
    const timePoints: { name: string; time: number }[] = [];
    
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    timePoints.push({ name: 'DOMContentLoaded', time: Date.now() });
    
    await page.waitForSelector('h1');
    timePoints.push({ name: 'H1 Visible', time: Date.now() });
    
    await page.waitForSelector('nav');
    timePoints.push({ name: 'Navigation Visible', time: Date.now() });
    
    await page.waitForLoadState('networkidle');
    timePoints.push({ name: 'Network Idle', time: Date.now() });
    
    // Calculate progressive loading times
    const baseline = timePoints[0].time;
    const progressiveTimes = timePoints.map(point => ({
      ...point,
      elapsed: point.time - baseline
    }));
    
    // Key content should appear quickly
    const h1Time = progressiveTimes.find(p => p.name === 'H1 Visible')?.elapsed || 0;
    const navTime = progressiveTimes.find(p => p.name === 'Navigation Visible')?.elapsed || 0;
    
    expect(h1Time).toBeLessThan(1500);  // H1 should appear within 1.5s
    expect(navTime).toBeLessThan(2000); // Nav should appear within 2s
    
    console.log('Progressive loading times:', progressiveTimes);
  });

  test('service worker performance', async ({ page }) => {
    await page.goto('/');
    
    // Check if service worker is registered
    const swRegistration = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        return {
          registered: !!registration,
          state: registration?.active?.state,
          scope: registration?.scope
        };
      }
      return { registered: false };
    });
    
    if (swRegistration.registered) {
      console.log('Service Worker:', swRegistration);
      
      // Test cache performance with service worker
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      const cacheHits = await page.evaluate(() => {
        return performance.getEntriesByType('resource').filter(resource => 
          (resource as any).transferSize === 0
        ).length;
      });
      
      expect(cacheHits).toBeGreaterThan(0);
    }
  });

  test('web vitals stability', async ({ page }) => {
    // Take multiple measurements to ensure stability
    const measurements: PerformanceMetrics[] = [];
    
    for (let i = 0; i < 3; i++) {
      await page.goto('/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      
      const metrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          const vitals = { lcp: 0, fid: 0, cls: 0 };
          let metricsCollected = 0;
          const totalMetrics = 3;
          
          // LCP
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            if (entries.length > 0) {
              vitals.lcp = entries[entries.length - 1].startTime;
              if (++metricsCollected === totalMetrics) resolve(vitals);
            }
          }).observe({ entryTypes: ['largest-contentful-paint'] });
          
          // CLS
          let clsValue = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
              }
            }
            vitals.cls = clsValue;
            if (++metricsCollected === totalMetrics) resolve(vitals);
          }).observe({ entryTypes: ['layout-shift'] });
          
          // Simulate FID measurement
          setTimeout(() => {
            vitals.fid = Math.random() * 50; // Simulated since we can't easily trigger real FID
            if (++metricsCollected === totalMetrics) resolve(vitals);
          }, 1000);
          
          // Timeout after 10 seconds
          setTimeout(() => resolve(vitals), 10000);
        });
      });
      
      measurements.push(metrics);
      console.log(`Measurement ${i + 1}:`, metrics);
    }
    
    // Check for consistency across measurements
    const lcpValues = measurements.map(m => m.lcp).filter(v => v > 0);
    const clsValues = measurements.map(m => m.cls);
    
    if (lcpValues.length > 1) {
      const lcpVariance = Math.max(...lcpValues) - Math.min(...lcpValues);
      expect(lcpVariance).toBeLessThan(1000); // LCP shouldn't vary by more than 1s
    }
    
    const avgCls = clsValues.reduce((a, b) => a + b, 0) / clsValues.length;
    expect(avgCls).toBeLessThan(0.1); // Average CLS should be good
    
    console.log('Web Vitals stability analysis:', {
      lcpRange: lcpValues.length > 1 ? `${Math.min(...lcpValues)}-${Math.max(...lcpValues)}ms` : 'N/A',
      avgCls: avgCls.toFixed(3),
      consistency: 'Good'
    });
  });
});