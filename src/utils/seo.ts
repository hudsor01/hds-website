// SEO utilities for dynamic meta tag management
import type { SEOMetaData } from '@/types/seo'

export function updateMetaTags(meta: SEOMetaData) {
  // Update document title
  document.title = meta.title

  // Update or create meta tags
  updateMetaTag('description', meta.description)

  if (meta.keywords) {
    updateMetaTag('keywords', meta.keywords)
  }

  // Open Graph tags
  updateMetaProperty('og:title', meta.ogTitle || meta.title)
  updateMetaProperty('og:description', meta.ogDescription || meta.description)
  updateMetaProperty('og:url', window.location.href)

  if (meta.ogImage) {
    updateMetaProperty('og:image', meta.ogImage)
  }

  // Twitter Card tags
  updateMetaTag('twitter:title', meta.ogTitle || meta.title)
  updateMetaTag('twitter:description', meta.ogDescription || meta.description)

  if (meta.ogImage) {
    updateMetaTag('twitter:image', meta.ogImage)
  }

  // Canonical URL
  updateCanonical(meta.canonical || window.location.href)

  // Robots meta
  if (meta.noindex) {
    updateMetaTag('robots', 'noindex, nofollow')
  } else {
    updateMetaTag(
      'robots',
      'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
    )
  }

  // Structured data
  if (meta.structuredData) {
    updateStructuredData(meta.structuredData)
  }
}

// Add breadcrumb structured data
export function addBreadcrumbStructuredData(
  breadcrumbs: Array<{ name: string; url: string }>,
) {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  updateStructuredData(breadcrumbSchema)
}

function updateMetaTag(name: string, content: string) {
  let element = document.querySelector(
    `meta[name="${name}"]`,
  ) as HTMLMetaElement

  if (!element) {
    element = document.createElement('meta')
    element.name = name
    document.head.appendChild(element)
  }

  element.content = content
}

function updateMetaProperty(property: string, content: string) {
  let element = document.querySelector(
    `meta[property="${property}"]`,
  ) as HTMLMetaElement

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute('property', property)
    document.head.appendChild(element)
  }

  element.content = content
}

function updateCanonical(href: string) {
  let element = document.querySelector(
    'link[rel="canonical"]',
  ) as HTMLLinkElement

  if (!element) {
    element = document.createElement('link')
    element.rel = 'canonical'
    document.head.appendChild(element)
  }

  element.href = href
}

function updateStructuredData(data: object) {
  // Remove existing structured data
  const existing = document.querySelector(
    'script[type="application/ld+json"][data-dynamic]',
  )
  if (existing) {
    existing.remove()
  }

  // Add new structured data
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.setAttribute('data-dynamic', 'true')
  script.textContent = JSON.stringify(data)
  document.head.appendChild(script)
}

// Predefined SEO configurations for each page
export const SEO_CONFIG = {
  home: {
    title:
      'Hudson Digital Solutions - Premium Web Development & Digital Strategy',
    description:
      'Transform your business with Hudson Digital Solutions. Expert web development, custom software, and digital strategy services. 98% success rate, $5K+ projects. Get your free consultation today.',
    keywords:
      'web development, custom software, digital strategy, Vue.js, React, TypeScript, web applications, business automation, ROI optimization, Hudson Digital',
    ogImage: 'https://hudsondigitalsolutions.com/HDS-Logo.jpeg',
    canonical: 'https://hudsondigitalsolutions.com/',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Hudson Digital Solutions',
      url: 'https://hudsondigitalsolutions.com',
      description:
        'Premium web development and digital strategy services with proven ROI results',
      publisher: {
        '@type': 'Organization',
        name: 'Hudson Digital Solutions',
        logo: 'https://hudsondigitalsolutions.com/HDS-Logo.jpeg',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target:
          'https://hudsondigitalsolutions.com/contact?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
  },

  services: {
    title:
      'Web Development Services - Custom Software & Digital Solutions | Hudson Digital',
    description:
      'Professional web development services: Vue.js & React apps, custom software, API development, and performance optimization. Starting at $5K with 98% success rate.',
    keywords:
      'web development services, custom software development, Vue.js development, React development, API development, web applications, TypeScript development',
    ogTitle: 'Professional Web Development Services | Hudson Digital',
    ogDescription:
      'Expert web development: Vue.js, React, custom software solutions. 98% success rate, proven ROI. Starting at $5K.',
    canonical: 'https://hudsondigitalsolutions.com/services',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Web Development Services',
      provider: {
        '@type': 'Organization',
        name: 'Hudson Digital Solutions',
      },
      description: 'Professional web development and custom software solutions',
      offers: {
        '@type': 'Offer',
        priceCurrency: 'USD',
        price: '5000',
        priceValidUntil: '2025-12-31',
      },
    },
  },

  about: {
    title: 'About Hudson Digital Solutions - Expert Web Development Team',
    description:
      'Meet the Hudson Digital team. Experienced web developers specializing in Vue.js, React, and custom software solutions. 5+ years experience, 50+ successful projects.',
    keywords:
      'about Hudson Digital, web development team, Vue.js experts, React developers, software engineering team',
    ogTitle: 'About Hudson Digital Solutions - Expert Development Team',
    ogDescription:
      'Experienced web development team with 5+ years expertise in Vue.js, React, and custom software solutions.',
    canonical: 'https://hudsondigitalsolutions.com/about',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'About Hudson Digital Solutions',
      description:
        'Learn about our expert web development team and our mission to transform businesses through technology',
    },
  },

  contact: {
    title: 'Contact Hudson Digital Solutions - Get Your Free Consultation',
    description:
      'Ready to transform your business? Contact Hudson Digital Solutions for a free consultation. Response within 4 hours. Email: hello@hudsondigitalsolutions.com',
    keywords:
      'contact Hudson Digital, free consultation, web development quote, custom software consultation, project inquiry',
    ogTitle: 'Contact Hudson Digital - Free Consultation Available',
    ogDescription:
      'Get your free consultation today. Response within 4 hours. Transform your business with expert web development.',
    canonical: 'https://hudsondigitalsolutions.com/contact',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Contact Hudson Digital Solutions',
      description:
        'Get in touch for your web development and digital strategy needs',
    },
  },
} as const
