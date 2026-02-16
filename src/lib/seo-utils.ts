// Native SEO utilities - logic only, no data bloat

import seoKeywords from '@/data/seo-keywords.json';
import { BUSINESS_INFO } from '@/lib/constants/business';

/**
 * Generate meta title with company branding
 */
export function generateOGTitle(title: string, includeCompany = true): string {
  return includeCompany ? `${title} - Hudson Digital Solutions` : title
}

/**
 * Generate Twitter description with character limit
 */
export function generateTwitterDescription(description: string): string {
  return description.length > 160 ? `${description.slice(0, 157)}...` : description
}

/**
 * Generate URL-friendly slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
}

/**
 * Generate canonical URL
 */
export function generateCanonicalUrl(path: string): string {
  const baseUrl = 'https://hudsondigitalsolutions.com'
  return path.startsWith('/') ? `${baseUrl}${path}` : `${baseUrl}/${path}`
}

/**
 * Get relevant keywords for a service
 */
export function getServiceKeywords(service: keyof typeof seoKeywords.services): string[] {
  return [
    ...seoKeywords.base.slice(0, 5), // Top 5 base keywords only
    ...seoKeywords.services[service] || []
  ]
}

/**
 * Generate schema markup for website
 */
export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Hudson Digital Solutions",
    "url": "https://hudsondigitalsolutions.com",
    "description": "Senior engineering team that eliminates technical bottlenecks. Ship 3x faster, 60% cheaper.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://hudsondigitalsolutions.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }
}

/**
 * Generate schema markup for organization
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Hudson Digital Solutions",
    "url": "https://hudsondigitalsolutions.com",
    "logo": "https://hudsondigitalsolutions.com/HDS-Logo.jpeg",
    "description": "Senior engineering team that eliminates technical bottlenecks.",
    "foundingDate": "2020",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "email": BUSINESS_INFO.email,
      "url": "https://hudsondigitalsolutions.com/contact"
    },
    "sameAs": [
      "https://github.com/hudsor01",
      "https://linkedin.com/company/hudson-digital-solutions"
    ]
  }
}

/**
 * Generate local business schema
 */
export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Hudson Digital Solutions",
    "url": "https://hudsondigitalsolutions.com",
    "description": "Web development and custom software solutions",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "39.8283",
      "longitude": "-98.5795"
    },
    "openingHours": "Mo-Fr 09:00-17:00",
    "telephone": "Contact via website",
    "email": BUSINESS_INFO.email
  }
}