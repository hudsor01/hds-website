// Centralized SEO configuration for Next.js App Router
import type { SEOMetaData } from '@/types/seo'

/**
 * SEO_CONFIG provides static metadata and structured data for each route.
 * Use this in your page's generateMetadata and Head exports.
 */
export const SEO_CONFIG: Record<string, SEOMetaData> = {
  home: {
    title:
      'Hudson Digital Solutions - Professional Web Development & Business Growth Strategy 2025',
    description:
      'Transform your business with Hudson Digital Solutions. Expert web development, conversion optimization, and digital dominance strategies. 340% average ROI, $5K+ projects. Get your free consultation today.',
    keywords:
      'web development 2025, business website development, conversion rate optimization, website ROI optimization, Next.js development, React development, TypeScript applications, digital marketing strategy, small business website, professional web design, business growth website',
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
      'Professional Web Development Services 2025 - Custom Business Solutions | Hudson Digital',
    description:
      'Professional web development services: Next.js & React apps, conversion optimization, custom software, and performance optimization. Starting at $5K with 340% average ROI.',
    keywords:
      'web development services 2025, professional website development, conversion rate optimization services, Next.js development, React development, small business web development, custom software development, website performance optimization, business growth website, digital marketing integration',
    ogTitle: 'Professional Web Development Services 2025 | Hudson Digital',
    ogDescription:
      'Expert web development: Next.js, React, conversion optimization, custom software solutions. 340% average ROI, proven results. Starting at $5K.',
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
    title: 'About Hudson Digital Solutions - Expert Web Development & Growth Strategy Team',
    description:
      'Meet the Hudson Digital team. Experienced web developers specializing in Next.js, React, conversion optimization, and business growth strategies. 150+ successful projects, 340% average ROI.',
    keywords:
      'about Hudson Digital, web development team, Next.js experts, React developers, conversion optimization specialists, business growth strategists, professional web development team',
    ogTitle: 'About Hudson Digital Solutions - Expert Development & Growth Team',
    ogDescription:
      'Experienced web development team specializing in Next.js, React, conversion optimization, and business growth strategies. 150+ projects, 340% average ROI.',
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
    title: 'Contact Hudson Digital Solutions - Get Your Free Strategy Consultation',
    description:
      'Ready to dominate your market? Contact Hudson Digital Solutions for a free strategy consultation. Response within 4 hours. Transform your business with proven results. Email: hello@hudsondigitalsolutions.com',
    keywords:
      'contact Hudson Digital, free consultation, web development quote, business strategy consultation, conversion optimization quote, professional web development consultation, project inquiry, business growth strategy',
    ogTitle: 'Contact Hudson Digital - Free Strategy Consultation Available',
    ogDescription:
      'Get your free strategy consultation today. Response within 4 hours. Transform your business with expert web development and growth strategies.',
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
