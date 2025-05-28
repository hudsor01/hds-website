/**
 * SEO & Metadata Types
 * 
 * Type definitions for search engine optimization, metadata, and structured data.
 */

// ============= Meta Tags & SEO =============

/**
 * SEO metadata for pages
 */
export interface SEOMetadata {
  title: string
  description: string
  keywords?: string[]
  canonicalUrl?: string
  noIndex?: boolean
  noFollow?: boolean
  robots?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType?: 'website' | 'article' | 'product' | 'profile'
  ogUrl?: string
  ogSiteName?: string
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
  twitterSite?: string
  twitterCreator?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  alternateLanguages?: AlternateLanguage[]
  structuredData?: StructuredData[]
}

/**
 * Alternate language definition for hreflang
 */
export interface AlternateLanguage {
  hreflang: string
  href: string
}

/**
 * Open Graph metadata
 */
export interface OpenGraphData {
  title: string
  description: string
  image: string
  url: string
  type: 'website' | 'article' | 'product' | 'profile'
  siteName: string
  locale?: string
  alternateLocales?: string[]
  article?: {
    author?: string
    publishedTime?: string
    modifiedTime?: string
    section?: string
    tags?: string[]
  }
  product?: {
    price?: string
    currency?: string
    availability?: 'in stock' | 'out of stock' | 'preorder'
    condition?: 'new' | 'used' | 'refurbished'
  }
}

/**
 * Twitter Card metadata
 */
export interface TwitterCardData {
  card: 'summary' | 'summary_large_image' | 'app' | 'player'
  site?: string
  creator?: string
  title: string
  description: string
  image?: string
  imageAlt?: string
  app?: {
    name: {
      iphone?: string
      ipad?: string
      googleplay?: string
    }
    id: {
      iphone?: string
      ipad?: string
      googleplay?: string
    }
    url: {
      iphone?: string
      ipad?: string
      googleplay?: string
    }
  }
  player?: {
    url: string
    width: number
    height: number
    stream?: string
  }
}

// ============= Structured Data =============

/**
 * Schema.org structured data
 */
export interface StructuredData {
  '@context': 'https://schema.org'
  '@type': string
  [key: string]: any
}

/**
 * Local business structured data
 */
export interface LocalBusinessSchema extends StructuredData {
  '@type': 'LocalBusiness'
  name: string
  description: string
  url: string
  telephone: string
  email: string
  address: PostalAddress
  geo: GeoCoordinates
  openingHours: string[]
  priceRange: string
  image: string[]
  logo: string
  sameAs: string[]
  aggregateRating?: AggregateRating
  review?: Review[]
  hasOfferCatalog?: OfferCatalog
}

/**
 * Organization structured data
 */
export interface OrganizationSchema extends StructuredData {
  '@type': 'Organization'
  name: string
  description: string
  url: string
  logo: string
  email: string
  telephone: string
  address: PostalAddress
  sameAs: string[]
  founder?: Person
  foundingDate?: string
  numberOfEmployees?: string
  contactPoint?: ContactPoint[]
}

/**
 * Service structured data
 */
export interface ServiceSchema extends StructuredData {
  '@type': 'Service'
  name: string
  description: string
  provider: Organization
  serviceType: string
  areaServed: string | Place[]
  hasOfferCatalog?: OfferCatalog
  offers?: Offer[]
  aggregateRating?: AggregateRating
  review?: Review[]
}

/**
 * Article structured data
 */
export interface ArticleSchema extends StructuredData {
  '@type': 'Article'
  headline: string
  description: string
  image: string[]
  author: Person | Organization
  publisher: Organization
  datePublished: string
  dateModified: string
  mainEntityOfPage: string
  articleSection?: string
  wordCount?: number
  keywords?: string[]
}

/**
 * Product structured data
 */
export interface ProductSchema extends StructuredData {
  '@type': 'Product'
  name: string
  description: string
  image: string[]
  brand: Brand
  offers: Offer[]
  aggregateRating?: AggregateRating
  review?: Review[]
  sku?: string
  mpn?: string
  gtin?: string
  category?: string
}

/**
 * FAQ structured data
 */
export interface FAQSchema extends StructuredData {
  '@type': 'FAQPage'
  mainEntity: Question[]
}

/**
 * Supporting schema types
 */
export interface PostalAddress {
  '@type': 'PostalAddress'
  streetAddress: string
  addressLocality: string
  addressRegion: string
  postalCode: string
  addressCountry: string
}

export interface GeoCoordinates {
  '@type': 'GeoCoordinates'
  latitude: number
  longitude: number
}

export interface Person {
  '@type': 'Person'
  name: string
  url?: string
  image?: string
  sameAs?: string[]
}

export interface Organization {
  '@type': 'Organization'
  name: string
  url?: string
  logo?: string
  sameAs?: string[]
}

export interface Brand {
  '@type': 'Brand'
  name: string
  logo?: string
}

export interface Place {
  '@type': 'Place'
  name: string
  address?: PostalAddress
  geo?: GeoCoordinates
}

export interface AggregateRating {
  '@type': 'AggregateRating'
  ratingValue: number
  reviewCount: number
  bestRating?: number
  worstRating?: number
}

export interface Review {
  '@type': 'Review'
  author: Person
  datePublished: string
  description: string
  name: string
  reviewRating: Rating
}

export interface Rating {
  '@type': 'Rating'
  ratingValue: number
  bestRating?: number
  worstRating?: number
}

export interface Offer {
  '@type': 'Offer'
  price: string
  priceCurrency: string
  availability: string
  url?: string
  validFrom?: string
  validThrough?: string
  seller?: Organization
}

export interface OfferCatalog {
  '@type': 'OfferCatalog'
  name: string
  itemListElement: Offer[]
}

export interface ContactPoint {
  '@type': 'ContactPoint'
  telephone: string
  contactType: string
  email?: string
  availableLanguage?: string[]
  hoursAvailable?: OpeningHoursSpecification[]
}

export interface OpeningHoursSpecification {
  '@type': 'OpeningHoursSpecification'
  dayOfWeek: string[]
  opens: string
  closes: string
}

export interface Question {
  '@type': 'Question'
  name: string
  acceptedAnswer: Answer
}

export interface Answer {
  '@type': 'Answer'
  text: string
}

// ============= Sitemap & Navigation =============

/**
 * Sitemap URL entry
 */
export interface SitemapUrl {
  url: string
  lastModified?: Date
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
  alternateLanguages?: AlternateLanguage[]
  images?: SitemapImage[]
  videos?: SitemapVideo[]
}

/**
 * Sitemap image information
 */
export interface SitemapImage {
  url: string
  caption?: string
  title?: string
  geoLocation?: string
  license?: string
}

/**
 * Sitemap video information
 */
export interface SitemapVideo {
  thumbnailUrl: string
  title: string
  description: string
  contentUrl?: string
  playerUrl?: string
  duration?: number
  expirationDate?: Date
  rating?: number
  viewCount?: number
  publicationDate?: Date
  familyFriendly?: boolean
  tags?: string[]
  category?: string
}

// ============= Analytics & Tracking =============

/**
 * Google Analytics configuration
 */
export interface GoogleAnalyticsConfig {
  measurementId: string
  trackingEnabled: boolean
  anonymizeIp: boolean
  cookieConsent: boolean
  customDimensions?: CustomDimension[]
  customMetrics?: CustomMetric[]
  ecommerce?: boolean
  enhancedEcommerce?: boolean
}

/**
 * Custom dimension for analytics
 */
export interface CustomDimension {
  index: number
  name: string
  scope: 'hit' | 'session' | 'user' | 'product'
  active: boolean
}

/**
 * Custom metric for analytics
 */
export interface CustomMetric {
  index: number
  name: string
  type: 'integer' | 'currency' | 'time'
  active: boolean
}

/**
 * Google Search Console verification
 */
export interface SearchConsoleVerification {
  method: 'meta' | 'html' | 'dns' | 'google-analytics' | 'google-tag-manager'
  value: string
}

// ============= Performance & Technical SEO =============

/**
 * Core Web Vitals metrics
 */
export interface CoreWebVitals {
  largestContentfulPaint: number // LCP in milliseconds
  firstInputDelay: number // FID in milliseconds
  cumulativeLayoutShift: number // CLS score
  firstContentfulPaint: number // FCP in milliseconds
  timeToInteractive: number // TTI in milliseconds
  totalBlockingTime: number // TBT in milliseconds
  speedIndex: number
}

/**
 * Technical SEO audit results
 */
export interface TechnicalSEOAudit {
  url: string
  timestamp: Date
  performance: {
    score: number
    metrics: CoreWebVitals
    opportunities: SEOOpportunity[]
  }
  seo: {
    score: number
    issues: SEOIssue[]
    recommendations: SEORecommendation[]
  }
  accessibility: {
    score: number
    issues: AccessibilityIssue[]
  }
  bestPractices: {
    score: number
    issues: BestPracticeIssue[]
  }
}

/**
 * SEO opportunity for improvement
 */
export interface SEOOpportunity {
  id: string
  title: string
  description: string
  impact: 'low' | 'medium' | 'high'
  effort: 'low' | 'medium' | 'high'
  category: 'performance' | 'content' | 'technical' | 'mobile'
  metrics?: {
    current: number
    potential: number
    unit: string
  }
}

/**
 * SEO issue found in audit
 */
export interface SEOIssue {
  id: string
  severity: 'error' | 'warning' | 'info'
  title: string
  description: string
  element?: string
  line?: number
  category: 'meta' | 'headings' | 'images' | 'links' | 'structured-data' | 'mobile'
}

/**
 * SEO recommendation
 */
export interface SEORecommendation {
  id: string
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  actionItems: string[]
  estimatedImpact: string
  difficulty: 'easy' | 'medium' | 'hard'
}

/**
 * Accessibility issue
 */
export interface AccessibilityIssue {
  id: string
  severity: 'error' | 'warning'
  title: string
  description: string
  element: string
  wcagLevel: 'A' | 'AA' | 'AAA'
  wcagCriterion: string
}

/**
 * Best practice issue
 */
export interface BestPracticeIssue {
  id: string
  severity: 'error' | 'warning' | 'info'
  title: string
  description: string
  category: 'security' | 'performance' | 'pwa' | 'general'
}