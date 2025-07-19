// Centralized SEO configuration for Next.js App Router
import type { SEOMetaData } from '@/types/seo'

/**
 * SEO_CONFIG provides static metadata and structured data for each route.
 * Use this in your page's generateMetadata and Head exports.
 */
export const SEO_CONFIG: Record<string, SEOMetaData> = {
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
