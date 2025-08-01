// Performance optimization utilities
import type { CLSEntry, FIDEntry } from '@/types/performance'

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

// Service Worker registration for caching
// TODO: Implement service worker for production caching
export function registerServiceWorker() {
  // Service worker not yet implemented
  // Remove this function or implement proper SW at /public/sw.js
  if (process.env.NODE_ENV === 'development') {
    console.log('Service worker registration disabled - not yet implemented')
  }
}

// Web Vitals tracking
export function trackWebVitals() {
  // Core Web Vitals tracking would go here
  // This is a placeholder for actual implementation
  if ('PerformanceObserver' in window) {
    // Track LCP
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      const lastEntry = entries[entries.length - 1]
      if (process.env.NODE_ENV === 'development') {
        console.log('LCP:', lastEntry.startTime)
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // Track FID
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      entries.forEach((entry) => {
        const fidEntry = entry as FIDEntry
        if (process.env.NODE_ENV === 'development') {
          console.log('FID:', fidEntry.processingStart - fidEntry.startTime)
        }
      })
    }).observe({ entryTypes: ['first-input'] })

    // Track CLS
    new PerformanceObserver((entryList) => {
      let clsValue = 0
      const entries = entryList.getEntries()
      entries.forEach((entry) => {
        const clsEntry = entry as CLSEntry
        if (!clsEntry.hadRecentInput) {
          clsValue += clsEntry.value
        }
      })
      if (process.env.NODE_ENV === 'development') {
        console.log('CLS:', clsValue)
      }
    }).observe({ entryTypes: ['layout-shift'] })
  }
}

// Image optimization helpers
export function createOptimizedImage(
  src: string,
  alt: string,
  className?: string,
) {
  const img = document.createElement('img')
  img.alt = alt
  img.loading = 'lazy'
  img.decoding = 'async'
  if (className) img.className = className

  // Use modern formats if supported
  if (supportsWebP()) {
    img.src = src.replace(/\.(jpg|jpeg|png)$/i, '.webp')
  } else {
    img.src = src
  }

  return img
}

function supportsWebP(): boolean {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
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
