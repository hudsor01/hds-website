// performance-monitoring.ts - Utility for performance monitoring and metrics
import { logger } from '@/lib/logger';

export interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  inp?: number; // Interaction to Next Paint
  ttfb?: number; // Time to First Byte
  navigationStart?: number;
  domContentLoaded?: number;
  loadComplete?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private observer?: PerformanceObserver;
  private navigationStart: number = 0;

  constructor() {
    this.navigationStart = performance.timing.navigationStart;
    this.setupPerformanceMonitoring();
  }

  private setupPerformanceMonitoring() {
    // Measure Core Web Vitals
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'paint') {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.fcp = Math.round(entry.startTime);
              logger.info('Performance: FCP', { value: this.metrics.fcp });
            }
          } else if (entry.entryType === 'largest-contentful-paint') {
            const lcpEntry = entry as PerformanceEntry & { size?: number; element?: Element };
            this.metrics.lcp = Math.round(lcpEntry.startTime);
            logger.info('Performance: LCP', { value: this.metrics.lcp, size: lcpEntry.size });
          } else if (entry.entryType === 'layout-shift') {
            const layoutShiftEntry = entry as PerformanceEntry & {
              value?: number;
              hadRecentInput?: boolean;
            };
            if (!layoutShiftEntry.hadRecentInput) {
              this.metrics.cls = (this.metrics.cls || 0) + (layoutShiftEntry.value || 0);
              logger.info('Performance: Layout Shift', { 
                value: layoutShiftEntry.value, 
                cumulative: this.metrics.cls 
              });
            }
          } else if (entry.entryType === 'first-input') {
            const firstInputEntry = entry as PerformanceEntry & { 
              processingStart?: number; 
              startTime?: number 
            };
            if (firstInputEntry.processingStart && firstInputEntry.startTime) {
              this.metrics.fid = Math.round(
                firstInputEntry.processingStart - firstInputEntry.startTime
              );
              logger.info('Performance: FID', { value: this.metrics.fid });
            }
          }
        });
      });

      // Observe paint, LCP, layout shifts and first input
      this.observer.observe({
        entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift', 'first-input']
      });
    }

    // Navigation timing
    if ('addEventListener' in window) {
      window.addEventListener('load', () => {
        this.metrics.domContentLoaded = performance.timing.domContentLoadedEventEnd - this.navigationStart;
        this.metrics.loadComplete = performance.timing.loadEventEnd - this.navigationStart;
        this.metrics.ttfb = performance.timing.responseStart - this.navigationStart;
        
        logger.info('Performance: Navigation Timings', {
          domContentLoaded: this.metrics.domContentLoaded,
          loadComplete: this.metrics.loadComplete,
          ttfb: this.metrics.ttfb
        });
      });
    }
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public getMetric(key: keyof PerformanceMetrics): number | undefined {
    return this.metrics[key];
  }

  public addCustomMetric(name: string, value: number) {
    (this.metrics as Record<string, number>)[name] = value;
    logger.info(`Performance: Custom Metric ${name}`, { value });
  }

  public async measureWebVitals(): Promise<PerformanceMetrics> {
    // This would ideally use the web-vitals library in a real implementation
    // For now, return the collected metrics
    return this.getMetrics();
  }

  public logPerformanceSummary() {
    const metrics = this.getMetrics();
    logger.info('Performance Summary', metrics as Record<string, unknown>);
    
    // Log any metrics that are above recommended thresholds
    if (metrics.fcp && metrics.fcp > 1800) { // 1.8s
      logger.warn('Performance: FCP is above recommended threshold', { value: metrics.fcp });
    }
    
    if (metrics.lcp && metrics.lcp > 2500) { // 2.5s
      logger.warn('Performance: LCP is above recommended threshold', { value: metrics.lcp });
    }
    
    if (metrics.fid && metrics.fid > 100) { // 100ms
      logger.warn('Performance: FID is above recommended threshold', { value: metrics.fid });
    }
    
    if (metrics.cls && metrics.cls > 0.1) { // 0.1
      logger.warn('Performance: CLS is above recommended threshold', { value: metrics.cls });
    }
  }

  public destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Create a singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Utility function to measure component rendering performance
export const measureComponentRender = (componentName: string, renderFn: () => any) => {
  const start = performance.now();
  const result = renderFn();
  const end = performance.now();
  
  performanceMonitor.addCustomMetric(`render_${componentName}`, end - start);
  
  return result;
};

// Utility function to measure API call performance
export const measureApiCall = async <T>(url: string, fetchFn: () => Promise<T>): Promise<T> => {
  const start = performance.now();
  try {
    const result = await fetchFn();
    const end = performance.now();
    performanceMonitor.addCustomMetric(`api_${url.replace(/[\/\.-]/g, '_')}`, end - start);
    return result;
  } catch (error) {
    const end = performance.now();
    performanceMonitor.addCustomMetric(`api_${url.replace(/[\/\.-]/g, '_')}_error`, end - start);
    throw error;
  }
};