import { Page, Request, Response } from '@playwright/test';
import type { NetworkRequest } from '@/types/test';

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  
  // Loading metrics
  ttfb: number; // Time to First Byte
  fcp: number;  // First Contentful Paint
  si: number;   // Speed Index
  
  // Resource metrics
  loadTime: number;
  domContentLoaded: number;
  resourceCount: number;
  totalResourceSize: number;
  
  // Memory metrics
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  
  // Network metrics
  requestCount: number;
  failedRequests: number;
  slowRequests: number;
}

export interface ResourceMetrics {
  url: string;
  type: string;
  size: number;
  loadTime: number;
  cached: boolean;
}

export class PerformanceMonitor {
  private page: Page;
  private isMonitoring: boolean = false;
  private startTime: number = 0;
  private metrics: Partial<PerformanceMetrics> = {};
  private resources: ResourceMetrics[] = [];
  private networkRequests: NetworkRequest[] = [];

  constructor(page: Page) {
    this.page = page;
  }

  async startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.startTime = Date.now();
    this.metrics = {};
    this.resources = [];
    this.networkRequests = [];

    // Monitor network requests
    this.page.on('request', this.handleRequest.bind(this));
    this.page.on('response', this.handleResponse.bind(this));
    this.page.on('requestfailed', this.handleRequestFailed.bind(this));

    // Inject performance monitoring script
    await this.injectPerformanceScript();
  }

  async stopMonitoring(): Promise<PerformanceMetrics> {
    if (!this.isMonitoring) {
      return this.getEmptyMetrics();
    }

    this.isMonitoring = false;
    
    // Remove event listeners
    this.page.off('request', this.handleRequest);
    this.page.off('response', this.handleResponse);
    this.page.off('requestfailed', this.handleRequestFailed);

    // Collect final metrics
    await this.collectCoreWebVitals();
    await this.collectLoadingMetrics();
    await this.collectMemoryMetrics();
    await this.calculateNetworkMetrics();

    return this.metrics as PerformanceMetrics;
  }

  private async injectPerformanceScript() {
    await this.page.addInitScript(() => {
      // Store performance entries for later collection
      window.performanceEntries = [];
      
      // Observer for Core Web Vitals
      if ('PerformanceObserver' in window) {
        // LCP Observer
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            window.performanceEntries.push({
              name: 'lcp',
              value: entry.startTime,
              timestamp: Date.now()
            });
          });
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // FID Observer
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            window.performanceEntries.push({
              name: 'fid',
              value: entry.processingStart - entry.startTime,
              timestamp: Date.now()
            });
          });
        }).observe({ entryTypes: ['first-input'] });

        // CLS Observer
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          window.performanceEntries.push({
            name: 'cls',
            value: clsValue,
            timestamp: Date.now()
          });
        }).observe({ entryTypes: ['layout-shift'] });

        // Paint timing
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.name === 'first-contentful-paint') {
              window.performanceEntries.push({
                name: 'fcp',
                value: entry.startTime,
                timestamp: Date.now()
              });
            }
          });
        }).observe({ entryTypes: ['paint'] });

        // Navigation timing
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            window.performanceEntries.push({
              name: 'navigation',
              value: entry,
              timestamp: Date.now()
            });
          });
        }).observe({ entryTypes: ['navigation'] });

        // Resource timing
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            window.performanceEntries.push({
              name: 'resource',
              value: {
                name: entry.name,
                duration: entry.duration,
                transferSize: entry.transferSize,
                initiatorType: entry.initiatorType
              },
              timestamp: Date.now()
            });
          });
        }).observe({ entryTypes: ['resource'] });
      }
    });
  }

  private async collectCoreWebVitals() {
    try {
      const webVitals = await this.page.evaluate(() => {
        const entries = window.performanceEntries || [];
        const result = {
          lcp: 0,
          fid: 0,
          cls: 0,
          fcp: 0
        };

        // Get latest values for each metric
        entries.forEach(entry => {
          if (entry.name === 'lcp') result.lcp = entry.value;
          if (entry.name === 'fid') result.fid = entry.value;
          if (entry.name === 'cls') result.cls = entry.value;
          if (entry.name === 'fcp') result.fcp = entry.value;
        });

        return result;
      });

      Object.assign(this.metrics, webVitals);
    } catch (error) {
      console.warn('Failed to collect Core Web Vitals:', error);
    }
  }

  private async collectLoadingMetrics() {
    try {
      const loadingMetrics = await this.page.evaluate(() => {
        const timing = performance.timing;
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        return {
          ttfb: navigation ? navigation.responseStart - navigation.requestStart : timing.responseStart - timing.requestStart,
          loadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : timing.loadEventEnd - timing.navigationStart,
          domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.fetchStart : timing.domContentLoadedEventEnd - timing.navigationStart,
          resourceCount: performance.getEntriesByType('resource').length
        };
      });

      Object.assign(this.metrics, loadingMetrics);
    } catch (error) {
      console.warn('Failed to collect loading metrics:', error);
    }
  }

  private async collectMemoryMetrics() {
    try {
      const memoryMetrics = await this.page.evaluate(() => {
        if ('memory' in performance) {
          return {
            usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
            totalJSHeapSize: (performance as any).memory.totalJSHeapSize
          };
        }
        return {};
      });

      Object.assign(this.metrics, memoryMetrics);
    } catch (error) {
      console.warn('Failed to collect memory metrics:', error);
    }
  }

  private calculateNetworkMetrics() {
    const requestCount = this.networkRequests.length;
    const failedRequests = this.networkRequests.filter(req => req.failed).length;
    const slowRequests = this.networkRequests.filter(req => req.duration > 3000).length;
    const totalResourceSize = this.resources.reduce((total, resource) => total + resource.size, 0);

    Object.assign(this.metrics, {
      requestCount,
      failedRequests,
      slowRequests,
      totalResourceSize
    });
  }

  private handleRequest(request: Request) {
    if (!this.isMonitoring) return;

    const requestData = {
      url: request.url(),
      method: request.method(),
      startTime: Date.now(),
      failed: false,
      duration: 0
    };

    this.networkRequests.push(requestData);
  }

  private handleResponse(response: Response) {
    if (!this.isMonitoring) return;

    const request = this.networkRequests.find(req => req.url === response.url());
    if (request) {
      request.duration = Date.now() - request.startTime;
      
      // Collect resource metrics
      this.resources.push({
        url: response.url(),
        type: response.request().resourceType(),
        size: parseInt(response.headers()['content-length'] || '0'),
        loadTime: request.duration,
        cached: response.fromCache()
      });
    }
  }

  private handleRequestFailed(request: Request) {
    if (!this.isMonitoring) return;

    const requestData = this.networkRequests.find(req => req.url === request.url());
    if (requestData) {
      requestData.failed = true;
      requestData.duration = Date.now() - requestData.startTime;
    }
  }

  // Public methods for specific metric collection
  async measurePageLoadTime(): Promise<number> {
    const startTime = Date.now();
    await this.page.waitForLoadState('networkidle');
    return Date.now() - startTime;
  }

  async measureLCP(): Promise<number> {
    return await this.page.evaluate(() => {
      return new Promise((resolve) => {
        if ('PerformanceObserver' in window) {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry.startTime);
          }).observe({ entryTypes: ['largest-contentful-paint'] });
        }
        
        setTimeout(() => resolve(0), 10000);
      });
    });
  }

  async measureCLS(): Promise<number> {
    return await this.page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;
        
        if ('PerformanceObserver' in window) {
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
              }
            }
          }).observe({ entryTypes: ['layout-shift'] });
        }
        
        setTimeout(() => resolve(clsValue), 5000);
      });
    });
  }

  async measureFID(): Promise<number> {
    return await this.page.evaluate(() => {
      return new Promise((resolve) => {
        if ('PerformanceObserver' in window) {
          new PerformanceObserver((list) => {
            const firstEntry = list.getEntries()[0];
            resolve((firstEntry as any).processingStart - firstEntry.startTime);
          }).observe({ entryTypes: ['first-input'] });
        }
        
        setTimeout(() => resolve(0), 10000);
      });
    });
  }

  async getResourceMetrics(): Promise<ResourceMetrics[]> {
    return [...this.resources];
  }

  async getNetworkRequests(): Promise<any[]> {
    return [...this.networkRequests];
  }

  // Performance assertions
  assertCoreWebVitals(metrics: PerformanceMetrics) {
    const issues: string[] = [];

    if (metrics.lcp > 2500) {
      issues.push(`LCP too slow: ${metrics.lcp}ms (should be < 2500ms)`);
    }

    if (metrics.fid > 100) {
      issues.push(`FID too slow: ${metrics.fid}ms (should be < 100ms)`);
    }

    if (metrics.cls > 0.1) {
      issues.push(`CLS too high: ${metrics.cls} (should be < 0.1)`);
    }

    if (issues.length > 0) {
      throw new Error(`Core Web Vitals issues: ${issues.join(', ')}`);
    }
  }

  assertLoadingPerformance(metrics: PerformanceMetrics) {
    const issues: string[] = [];

    if (metrics.ttfb > 800) {
      issues.push(`TTFB too slow: ${metrics.ttfb}ms (should be < 800ms)`);
    }

    if (metrics.fcp > 1800) {
      issues.push(`FCP too slow: ${metrics.fcp}ms (should be < 1800ms)`);
    }

    if (metrics.loadTime > 5000) {
      issues.push(`Load time too slow: ${metrics.loadTime}ms (should be < 5000ms)`);
    }

    if (issues.length > 0) {
      throw new Error(`Loading performance issues: ${issues.join(', ')}`);
    }
  }

  assertResourceEfficiency(metrics: PerformanceMetrics) {
    const issues: string[] = [];

    if (metrics.requestCount > 100) {
      issues.push(`Too many requests: ${metrics.requestCount} (should be < 100)`);
    }

    if (metrics.totalResourceSize > 3000000) { // 3MB
      issues.push(`Total resource size too large: ${Math.round(metrics.totalResourceSize / 1024 / 1024)}MB (should be < 3MB)`);
    }

    if (metrics.failedRequests > 0) {
      issues.push(`Failed requests detected: ${metrics.failedRequests}`);
    }

    if (issues.length > 0) {
      throw new Error(`Resource efficiency issues: ${issues.join(', ')}`);
    }
  }

  // Utility methods
  private getEmptyMetrics(): PerformanceMetrics {
    return {
      lcp: 0,
      fid: 0,
      cls: 0,
      ttfb: 0,
      fcp: 0,
      si: 0,
      loadTime: 0,
      domContentLoaded: 0,
      resourceCount: 0,
      totalResourceSize: 0,
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      requestCount: 0,
      failedRequests: 0,
      slowRequests: 0
    };
  }

  async generatePerformanceReport(): Promise<string> {
    const metrics = await this.stopMonitoring();
    
    return `
Performance Report
==================
Core Web Vitals:
- LCP: ${metrics.lcp}ms
- FID: ${metrics.fid}ms
- CLS: ${metrics.cls}

Loading Metrics:
- TTFB: ${metrics.ttfb}ms
- FCP: ${metrics.fcp}ms
- Load Time: ${metrics.loadTime}ms
- DOM Content Loaded: ${metrics.domContentLoaded}ms

Resource Metrics:
- Request Count: ${metrics.requestCount}
- Failed Requests: ${metrics.failedRequests}
- Total Resource Size: ${Math.round(metrics.totalResourceSize / 1024)}KB
- Memory Used: ${Math.round(metrics.usedJSHeapSize / 1024 / 1024)}MB

Top Issues:
${this.getPerformanceIssues(metrics).join('\n')}
    `.trim();
  }

  private getPerformanceIssues(metrics: PerformanceMetrics): string[] {
    const issues: string[] = [];

    if (metrics.lcp > 2500) issues.push('- LCP exceeds recommended threshold');
    if (metrics.fid > 100) issues.push('- FID exceeds recommended threshold');
    if (metrics.cls > 0.1) issues.push('- CLS exceeds recommended threshold');
    if (metrics.ttfb > 800) issues.push('- TTFB is slower than optimal');
    if (metrics.requestCount > 50) issues.push('- High number of network requests');
    if (metrics.failedRequests > 0) issues.push('- Network request failures detected');

    return issues.length > 0 ? issues : ['- No performance issues detected'];
  }
}