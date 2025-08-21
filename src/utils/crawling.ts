// Search engine crawling optimization utilities

// Google Search Console indexing optimization
export function optimizeForCrawling() {
  // Add schema.org markup for better understanding
  addWebsiteSchema()

  // Optimize images for crawlers
  optimizeImagesForCrawlers()

  // Add hreflang for international SEO
  addHreflangTags()

  // Ensure proper internal linking
  optimizeInternalLinking()
}

// Add comprehensive website schema
function addWebsiteSchema() {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Hudson Digital Solutions',
    url: 'https://hudsondigitalsolutions.com',
    description: 'Premium web development and digital strategy services',
    inLanguage: 'en-US',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://hudsondigitalsolutions.com/?s={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Hudson Digital Solutions',
      url: 'https://hudsondigitalsolutions.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://hudsondigitalsolutions.com/HDS-Logo.jpeg',
      },
    },
  }

  addStructuredDataScript(websiteSchema)
}

// Add structured data script to head
function addStructuredDataScript(data: object) {
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(data)
  document.head.appendChild(script)
}

// Optimize images for search engine crawlers
function optimizeImagesForCrawlers() {
  const images = document.querySelectorAll('img')

  images.forEach((img) => {
    // Ensure all images have alt text
    if (!img.alt) {
      img.alt = generateAltTextFromSrc(img.src)
    }

    // Add loading attributes for better crawling
    if (!img.loading) {
      img.loading = 'lazy'
    }

    // Add width and height if missing (helps with CLS)
    if (!img.width && !img.height) {
      img.style.width = 'auto'
      img.style.height = 'auto'
    }
  })
}

// Generate meaningful alt text from image source
function generateAltTextFromSrc(src: string): string {
  const filename = src.split('/').pop()?.split('.')[0] || ''
  return filename
    .replace(/[-_]/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase())
}

// Add hreflang tags for international SEO
function addHreflangTags() {
  const baseUrl = 'https://hudsondigitalsolutions.com'
  const currentPath = window.location.pathname

  // Add hreflang for English (default)
  addHreflangTag('en', `${baseUrl}${currentPath}`)
  addHreflangTag('x-default', `${baseUrl}${currentPath}`)
}

function addHreflangTag(lang: string, url: string) {
  const link = document.createElement('link')
  link.rel = 'alternate'
  link.hreflang = lang
  link.href = url
  document.head.appendChild(link)
}

// Optimize internal linking structure
function optimizeInternalLinking() {
  const links = document.querySelectorAll('a[href]')

  links.forEach((link) => {
    const href = link.getAttribute('href')

    if (href?.startsWith('/')) {
      // Internal link - ensure proper attributes
      if (!link.getAttribute('title')) {
        link.setAttribute('title', link.textContent || '')
      }

      // Add rel attributes for better crawling
      if (href.includes('/contact')) {
        link.setAttribute('rel', 'contact')
      }
    } else if (
      href?.startsWith('http') &&
      !href.includes('hudsondigitalsolutions.com')
    ) {
      // External link - add proper attributes
      if (!link.getAttribute('rel')) {
        link.setAttribute('rel', 'noopener noreferrer')
      }

      if (!link.getAttribute('target')) {
        link.setAttribute('target', '_blank')
      }
    }
  })
}

// Submit URL to Google for indexing (requires Search Console API)
export function requestGoogleIndexing(_url: string) {
  // This would require proper Google Search Console API integration
  // Request indexing for URL implementation would go here

  // In production, implement Google Indexing API:
  // https://developers.google.com/search/apis/indexing-api/v3/quickstart
}

// Generate sitemap entry for dynamic pages
export function generateSitemapEntry(page: {
  url: string
  lastmod?: string
  changefreq?:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never'
  priority?: number
}) {
  return {
    loc: page.url,
    lastmod: page.lastmod || new Date().toISOString().split('T')[0],
    changefreq: page.changefreq || 'monthly',
    priority: page.priority || 0.5,
  }
}

// Check if page is ready for indexing
export function isPageReadyForIndexing(): boolean {
  const checks = [
    document.title && document.title.length > 0,
    document.querySelector('meta[name="description"]')?.getAttribute('content'),
    document.querySelector('h1'),
    document.querySelector('main, [role="main"]'),
    document.querySelector('link[rel="canonical"]'),
    !document.querySelector('meta[name="robots"][content*="noindex"]'),
  ]

  return checks.every((check) => Boolean(check))
}

// Monitor Core Web Vitals for SEO
export function trackCoreWebVitalsForSEO() {
  // Track metrics that affect search rankings
  if ('PerformanceObserver' in window) {
    // Monitor LCP (Largest Contentful Paint)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      const lastEntry = entries[entries.length - 1]

      if (lastEntry.startTime > 2500) {
        // LCP is poor for SEO - should be optimized
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // Monitor CLS (Cumulative Layout Shift)
    new PerformanceObserver((entryList) => {
      let clsValue = 0
      const entries = entryList.getEntries()

      entries.forEach((entry) => {
        const layoutShiftEntry = entry as PerformanceEntry & {
          hadRecentInput: boolean
          value: number
        }
        if (!layoutShiftEntry.hadRecentInput) {
          clsValue += layoutShiftEntry.value
        }
      })

      if (clsValue > 0.1) {
        // CLS is poor for SEO - should be optimized
      }
    }).observe({ entryTypes: ['layout-shift'] })
  }
}

// Initialize all crawling optimizations
export function initCrawlingOptimizations() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', optimizeForCrawling)
  } else {
    optimizeForCrawling()
  }

  // Track Core Web Vitals
  trackCoreWebVitalsForSEO()
}
