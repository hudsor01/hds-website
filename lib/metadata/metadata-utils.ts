import type { Metadata } from 'next'
import { cache } from 'react'

/**
 * Metadata utilities for consistent SEO and social sharing
 * Implements Next.js 15 metadata best practices
 */

// Base metadata configuration
export const siteConfig = {
  name: 'Hudson Digital Solutions',
  title: 'Hudson Digital Solutions - Revenue Operations & Business Growth',
  description: 'Expert revenue operations, data analytics, and web development services for businesses looking to optimize their sales processes and drive growth.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://hudsondigitalsolutions.com',
  ogImage: '/og-image.png',
  creator: '@hudsondigital',
  publisher: 'Hudson Digital Solutions',
  keywords: [
    'revenue operations',
    'data analytics',
    'web development',
    'business growth',
    'sales optimization',
    'CRM consulting',
    'business intelligence',
    'digital transformation',
  ],
}

// Cached function to avoid duplicate metadata generation
export const generateSiteMetadata = cache((options: {
  title?: string
  description?: string
  image?: string
  keywords?: string[]
  noIndex?: boolean
  canonicalUrl?: string
  type?: 'website' | 'article' | 'service'
} = {}): Metadata => {
  const {
    title = siteConfig.title,
    description = siteConfig.description,
    image = siteConfig.ogImage,
    keywords = siteConfig.keywords,
    noIndex = false,
    canonicalUrl,
    type = 'website',
  } = options

  // Construct full title
  const fullTitle = title === siteConfig.title 
    ? title 
    : `${title} | ${siteConfig.name}`

  // Construct absolute image URL
  const imageUrl = image.startsWith('http') 
    ? image 
    : `${siteConfig.url}${image}`

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    
    // Author and publisher information
    authors: [{ name: siteConfig.creator }],
    creator: siteConfig.creator,
    publisher: siteConfig.publisher,
    
    // Robots and indexing
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Open Graph
    openGraph: {
      type: type === 'service' ? 'website' : type,
      locale: 'en_US',
      url: canonicalUrl || siteConfig.url,
      title: fullTitle,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },

    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      creator: siteConfig.creator,
      images: [imageUrl],
    },

    // Additional metadata
    category: 'business',
    classification: 'Business Services',
    
    // Canonical URL
    ...(canonicalUrl && {
      alternates: {
        canonical: canonicalUrl,
      },
    }),

    // Verification tags
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
      yahoo: process.env.YAHOO_VERIFICATION,
    },

    // Additional meta tags
    other: {
      'business:contact_data:street_address': '123 Business Ave',
      'business:contact_data:locality': 'Business City',
      'business:contact_data:region': 'TX',
      'business:contact_data:postal_code': '75001',
      'business:contact_data:country_name': 'United States',
    },
  }
})

// Service-specific metadata generator
export const generateServiceMetadata = cache((service: {
  name: string
  description: string
  benefits: string[]
  slug: string
}): Metadata => generateSiteMetadata({
    title: service.name,
    description: service.description,
    keywords: [
      ...siteConfig.keywords,
      service.name.toLowerCase(),
      ...service.benefits.map(b => b.toLowerCase()),
    ],
    canonicalUrl: `${siteConfig.url}/services/${service.slug}`,
    type: 'service',
  }))

// Blog post metadata generator
export const generateBlogMetadata = cache((post: {
  title: string
  description: string
  slug: string
  publishedAt: Date
  tags: string[]
  author: string
  image?: string
}): Metadata => generateSiteMetadata({
    title: post.title,
    description: post.description,
    image: post.image,
    keywords: [...siteConfig.keywords, ...post.tags],
    canonicalUrl: `${siteConfig.url}/blog/${post.slug}`,
    type: 'article',
  }))

// Case study metadata generator
export const generateCaseStudyMetadata = cache((caseStudy: {
  title: string
  description: string
  slug: string
  client: string
  industry: string
  results: string[]
  image?: string
}): Metadata => generateSiteMetadata({
    title: `${caseStudy.title} - Case Study`,
    description: caseStudy.description,
    image: caseStudy.image,
    keywords: [
      ...siteConfig.keywords,
      caseStudy.industry.toLowerCase(),
      'case study',
      'success story',
      ...caseStudy.results.map(r => r.toLowerCase()),
    ],
    canonicalUrl: `${siteConfig.url}/case-studies/${caseStudy.slug}`,
    type: 'article',
  }))

// Structured data generators
export const generateOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteConfig.name,
  url: siteConfig.url,
  logo: `${siteConfig.url}/logo.png`,
  description: siteConfig.description,
  address: {
    '@type': 'PostalAddress',
    streetAddress: '123 Business Ave',
    addressLocality: 'Business City',
    addressRegion: 'TX',
    postalCode: '75001',
    addressCountry: 'US',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-555-123-4567',
    contactType: 'customer service',
    email: 'hello@hudsondigitalsolutions.com',
  },
  sameAs: [
    'https://twitter.com/hudsondigital',
    'https://linkedin.com/company/hudson-digital-solutions',
  ],
})

export const generateWebsiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  publisher: {
    '@type': 'Organization',
    name: siteConfig.name,
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: `${siteConfig.url}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
})

export const generateServiceSchema = (service: {
  name: string
  description: string
  provider: string
  areaServed: string[]
  serviceType: string
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: service.name,
  description: service.description,
  provider: {
    '@type': 'Organization',
    name: service.provider,
  },
  areaServed: service.areaServed.map(area => ({
    '@type': 'Place',
    name: area,
  })),
  serviceType: service.serviceType,
  url: `${siteConfig.url}/services`,
})