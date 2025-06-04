/**
 * Lazy Loading Configuration
 * 
 * Central configuration for lazy loading behavior across the application
 */

export const LAZY_LOADING_CONFIG = {
  // Default intersection observer options
  DEFAULT_OPTIONS: {
    threshold: 0.1,
    rootMargin: '50px',
    freezeOnceVisible: true,
  },

  // Specific options for different component types
  COMPONENT_OPTIONS: {
    // Animated components - load earlier for smoother UX
    ANIMATED: {
      threshold: 0.2,
      rootMargin: '100px',
      freezeOnceVisible: true,
    },

    // Form components - load immediately when approaching
    FORMS: {
      threshold: 0.1,
      rootMargin: '25px',
      freezeOnceVisible: true,
    },

    // Heavy sections - load with more margin for better performance
    SECTIONS: {
      threshold: 0.05,
      rootMargin: '150px',
      freezeOnceVisible: true,
    },

    // Images - preload when close
    IMAGES: {
      threshold: 0,
      rootMargin: '200px',
      freezeOnceVisible: true,
    },

    // Carousels and interactive components
    INTERACTIVE: {
      threshold: 0.1,
      rootMargin: '75px',
      freezeOnceVisible: true,
    },
  },

  // Bundle size thresholds (in KB) to determine if component should be lazy loaded
  BUNDLE_THRESHOLDS: {
    SMALL: 10,   // Components under 10KB - maybe lazy load
    MEDIUM: 50,  // Components 10-50KB - should lazy load
    LARGE: 100,  // Components over 50KB - must lazy load
  },

  // Performance budgets
  PERFORMANCE: {
    // Maximum initial bundle size (KB)
    MAX_INITIAL_BUNDLE: 200,
    
    // Maximum number of components to load simultaneously
    MAX_CONCURRENT_LOADS: 3,
    
    // Delay between loading multiple components (ms)
    LOAD_DELAY: 100,
  },

  // Component priority levels
  PRIORITY: {
    CRITICAL: 1,    // Load immediately (above fold)
    HIGH: 2,        // Load when approaching viewport
    MEDIUM: 3,      // Load when in viewport
    LOW: 4,         // Load when well into viewport
    DEFER: 5,       // Load only when specifically needed
  },

  // Component categorization for lazy loading strategy
  COMPONENT_CATEGORIES: {
    // Critical components that should NOT be lazy loaded
    CRITICAL: [
      'Header',
      'Hero',
      'Navigation',
      'ErrorBoundary',
    ],

    // High priority - lazy load with minimal delay
    HIGH_PRIORITY: [
      'ContactForm',
      'NewsletterForm',
      'CTASections',
    ],

    // Medium priority - standard lazy loading
    MEDIUM_PRIORITY: [
      'ServicesSection',
      'TestimonialsSection',
      'PricingSection',
    ],

    // Low priority - aggressive lazy loading
    LOW_PRIORITY: [
      'AnimatedComponents',
      'DecorativeElements',
      'FloatingElements',
    ],

    // Deferred - load only when needed
    DEFERRED: [
      'AdminComponents',
      'Analytics',
      'ServiceWorker',
    ],
  },
} as const

/**
 * Get lazy loading options for a specific component type
 */
export function getLazyLoadingOptions(componentType: keyof typeof LAZY_LOADING_CONFIG.COMPONENT_OPTIONS) {
  return LAZY_LOADING_CONFIG.COMPONENT_OPTIONS[componentType] || LAZY_LOADING_CONFIG.DEFAULT_OPTIONS
}

/**
 * Determine if a component should be lazy loaded based on its category
 */
export function shouldLazyLoad(componentName: string): boolean {
  const { COMPONENT_CATEGORIES } = LAZY_LOADING_CONFIG
  
  // Critical components should never be lazy loaded
  if ((COMPONENT_CATEGORIES.CRITICAL as readonly string[]).includes(componentName)) {
    return false
  }

  // All other components should be lazy loaded
  return true
}

/**
 * Get the priority level for a component
 */
export function getComponentPriority(componentName: string): number {
  const { COMPONENT_CATEGORIES, PRIORITY } = LAZY_LOADING_CONFIG

  if ((COMPONENT_CATEGORIES.CRITICAL as readonly string[]).includes(componentName)) {
    return PRIORITY.CRITICAL
  }
  
  if ((COMPONENT_CATEGORIES.HIGH_PRIORITY as readonly string[]).includes(componentName)) {
    return PRIORITY.HIGH
  }
  
  if ((COMPONENT_CATEGORIES.MEDIUM_PRIORITY as readonly string[]).includes(componentName)) {
    return PRIORITY.MEDIUM
  }
  
  if ((COMPONENT_CATEGORIES.LOW_PRIORITY as readonly string[]).includes(componentName)) {
    return PRIORITY.LOW
  }
  
  if ((COMPONENT_CATEGORIES.DEFERRED as readonly string[]).includes(componentName)) {
    return PRIORITY.DEFER
  }

  // Default to medium priority
  return PRIORITY.MEDIUM
}

/**
 * Performance monitoring for lazy loading
 */
export class LazyLoadingPerformanceMonitor {
  private loadTimes: Map<string, number> = new Map()
  private loadStartTimes: Map<string, number> = new Map()

  startLoad(componentName: string): void {
    this.loadStartTimes.set(componentName, performance.now())
  }

  endLoad(componentName: string): void {
    const startTime = this.loadStartTimes.get(componentName)
    if (startTime) {
      const loadTime = performance.now() - startTime
      this.loadTimes.set(componentName, loadTime)
      this.loadStartTimes.delete(componentName)
      
      // Log slow loads
      if (loadTime > 1000) {
        console.warn(`Slow lazy load detected: ${componentName} took ${loadTime.toFixed(2)}ms`)
      }
    }
  }

  getLoadTime(componentName: string): number | undefined {
    return this.loadTimes.get(componentName)
  }

  getAverageLoadTime(): number {
    const times = Array.from(this.loadTimes.values())
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0
  }

  getSlowComponents(threshold = 500): string[] {
    return Array.from(this.loadTimes.entries())
      .filter(([_, time]) => time > threshold)
      .map(([name]) => name)
  }

  reset(): void {
    this.loadTimes.clear()
    this.loadStartTimes.clear()
  }
}

// Global performance monitor instance
export const lazyLoadingMonitor = new LazyLoadingPerformanceMonitor()