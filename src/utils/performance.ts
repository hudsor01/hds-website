// Performance optimization utilities
import type { CLSEntry } from '@/types/performance'

// Lazy loading for images
export function setupLazyLoading() {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          img.src = img.dataset.src || ''
          img.classList.remove('lazy')
          observer.unobserve(img)
        }
      })
    })

    document.querySelectorAll('img[data-src]').forEach((img) => {
      imageObserver.observe(img)
    })
  }
}

// Critical resource hints
export function addResourceHints() {
  const head = document.head

  // Preload critical fonts
  const fontPreload = document.createElement('link')
  fontPreload.rel = 'preload'
  fontPreload.href =
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap'
  fontPreload.as = 'style'
  fontPreload.crossOrigin = 'anonymous'
  head.appendChild(fontPreload)

  // DNS prefetch for external resources
  const dnsPrefetches = [
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ]

  dnsPrefetches.forEach((domain) => {
    const link = document.createElement('link')
    link.rel = 'dns-prefetch'
    link.href = domain
    head.appendChild(link)
  })
}

// Note: Service Worker registration is handled by ServiceWorkerRegistration.tsx component

// Web Vitals tracking
let _clsValue = 0 // Track cumulative layout shift - used in CLS observer

export function trackWebVitals() {
  // Core Web Vitals tracking would go here
  // This is a placeholder for actual implementation
  if ('PerformanceObserver' in window) {
    // Track LCP
    new PerformanceObserver(() => {
      // Track LCP entry for performance monitoring
      // LCP tracking would be implemented here
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // Track FID
    new PerformanceObserver(() => {
      // Track FID entry for performance monitoring
      // FID tracking would be implemented here
    }).observe({ entryTypes: ['first-input'] })

    // Track CLS
    new PerformanceObserver((entryList) => {
      // Track CLS value for performance monitoring
      const entries = entryList.getEntries()
      entries.forEach((entry) => {
        const clsEntry = entry as CLSEntry
        if (!clsEntry.hadRecentInput) {
          _clsValue += clsEntry.value
        }
      })
      // Log current CLS value for monitoring
      console.debug('Current CLS value:', _clsValue)
    }).observe({ entryTypes: ['layout-shift'] })
  }
}

// Simple image helpers - use Next.js Image component instead of complex optimization
export function createOptimizedImage(
  src: string,
  alt: string,
  className?: string,
) {
  // Simple image element - Next.js Image component handles optimization automatically
  const img = document.createElement('img')
  img.alt = alt
  img.loading = 'lazy'
  img.decoding = 'async'
  img.src = src
  if (className) img.className = className

  return img
}

// Preload critical routes
export function preloadCriticalRoutes() {
  const routes = ['/services', '/contact']

  routes.forEach((route) => {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = route
    document.head.appendChild(link)
  })
}

// Initialize all performance optimizations
export function initPerformanceOptimizations() {
  setupLazyLoading()
  addResourceHints()
  trackWebVitals()
  preloadCriticalRoutes()
  // registerServiceWorker() // Uncomment when SW is implemented
}
