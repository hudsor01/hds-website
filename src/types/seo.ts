// SEO-related type definitions
export interface SEOMetaData {
  title: string
  description: string
  keywords?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  canonical?: string
  noindex?: boolean
  structuredData?: object
}

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
  noindex?: boolean;
  structuredData?: object;
  additionalKeywords?: string[];
}

export interface StructuredData {
  '@context': string
  '@type': string
  [key: string]: string | number | boolean | object | string[] | null | undefined
}

export interface LocalBusinessSchema extends StructuredData {
  '@type': 'LocalBusiness'
  name: string
  description: string
  url: string
  telephone?: string
  email?: string
  address?: {
    '@type': 'PostalAddress'
    streetAddress?: string
    addressLocality?: string
    addressRegion?: string
    postalCode?: string
    addressCountry?: string
  }
  sameAs?: string[]
}

export interface WebsiteSchema extends StructuredData {
  '@type': 'WebSite'
  name: string
  url: string
  potentialAction?: {
    '@type': 'SearchAction'
    target: string
    'query-input': string
  }
}

export interface OrganizationSchema extends StructuredData {
  '@type': 'Organization'
  name: string
  url: string
  logo?: {
    '@type': 'ImageObject'
    url: string
  }
  contactPoint?: {
    '@type': 'ContactPoint'
    telephone?: string
    contactType?: string
  }
  sameAs?: string[]
}
