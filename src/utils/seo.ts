// Centralized SEO configuration for Next.js App Router
import type { SEOMetaData } from '@/types/seo';
import { BUSINESS_INFO } from '@/lib/constants/business';

/**
 * SEO_CONFIG provides static metadata and structured data for each route.
 * Use this in your page's generateMetadata and Head exports.
 */
export const SEO_CONFIG: Record<string, SEOMetaData> = {
  home: {
    title:
      'Turn Your Website Into a Revenue Machine | Proven ROI Results | Hudson Digital Solutions',
    description:
      'Stop losing revenue to technical bottlenecks. Custom web development that pays for itself with proven ROI results. Ship 3x faster, convert 2x better. Measurable revenue impact for growing businesses. Get your free ROI roadmap today.',
    keywords:
      'revenue-driven web development, high converting websites 2025, web development ROI, website revenue optimization, conversion rate optimization CRO, Next.js development services, React development agency, business automation software, SaaS development, technical debt solutions, web application development, startup web development',
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
      'Development That Pays for Itself | 90-Day ROI Guarantee | Hudson Digital Solutions',
    description:
      'Stop paying for development that sits on a shelf. Revenue-optimized web apps (40% conversion increase), business automation (save 20+ hours/week), and revenue leak audits (find $50K-$180K in lost revenue). Services generate measurable ROI within 90 days—or we keep working for free. No agencies. No junior devs. Just senior engineers who understand revenue.',
    keywords:
      'ROI-driven web development, conversion-optimized websites, business process automation, revenue operations automation, web application development, SaaS development services, technical consulting ROI, performance optimization services, revenue leak analysis, CRM integration services, marketing automation development',
    ogTitle: 'Development That Pays for Itself - 90-Day ROI Guarantee | Hudson Digital',
    ogDescription:
      'Revenue-optimized development services with 90-day ROI guarantee. Web apps with 40% conversion increases, automation saving 20+ hours/week. Find $50K-$180K in revenue leaks.',
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
    title: 'Revenue Engineers Who Happen to Write Code | Proven Impact | Hudson Digital Solutions',
    description:
      'Revenue engineers with proven impact. We forge websites that dominate, not just work. Enterprise-grade development for ambitious businesses.',
    keywords:
      'revenue operations engineering, RevOps development, enterprise web development, startup development services, ROI-focused development, conversion rate optimization experts, business automation specialists, technical revenue optimization, SaaS development experts, growth engineering team',
    ogTitle: 'Revenue Engineers Behind the Code - Proven Impact | Hudson Digital',
    ogDescription:
      'Former RevOps professionals turned engineers. Proven revenue impact with measurable ROI. We understand revenue, not just code.',
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
    title: 'Get Your Free ROI Roadmap in 30 Minutes | No Sales Pitch | Hudson Digital Solutions',
    description:
      `See exactly where your tech stack is leaking revenue—and how to fix it. Free 30-minute ROI analysis with detailed action plan. No sales pitch. No commitment. Just actionable insights you can use immediately. Response guaranteed within 2 hours. Join growing businesses with proven ROI results. Email: ${BUSINESS_INFO.email}`,
    keywords:
      'free ROI analysis, revenue leak audit, technical consultation, web development consultation, conversion optimization audit, performance audit services, free strategy session, business technology assessment, revenue operations consulting, growth engineering consultation',
    ogTitle: 'Free ROI Roadmap - Find Revenue Leaks in 30 Minutes | Hudson Digital',
    ogDescription:
      'Free 30-minute ROI analysis showing exactly where your tech leaks revenue. No sales pitch. Response in 2 hours. Actionable insights you can use immediately.',
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
