import { DefaultSeoProps } from 'next-seo';

export const defaultSEO: DefaultSeoProps = {
  defaultTitle: 'Hudson Digital Solutions',
  titleTemplate: '%s | Hudson Digital Solutions',
  description: 'Transform your business with expert web development, React applications, and custom software solutions. 98% success rate, proven ROI.',
  canonical: 'https://hudsondigitalsolutions.com',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://hudsondigitalsolutions.com',
    siteName: 'Hudson Digital Solutions',
    title: 'Hudson Digital Solutions - Premium Web Development',
    description: 'Expert web development and custom software solutions with proven ROI',
    images: [
      {
        url: 'https://hudsondigitalsolutions.com/HDS-Logo.jpeg',
        width: 1200,
        height: 630,
        alt: 'Hudson Digital Solutions',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    handle: '@hudsondigital',
    site: '@hudsondigital',
    cardType: 'summary_large_image',
  },
  additionalMetaTags: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1, maximum-scale=5',
    },
    {
      name: 'apple-mobile-web-app-capable',
      content: 'yes',
    },
    {
      name: 'apple-mobile-web-app-status-bar-style',
      content: 'black-translucent',
    },
    {
      name: 'theme-color',
      content: '#22d3ee',
    },
    {
      name: 'author',
      content: 'Hudson Digital Solutions',
    },
    {
      name: 'robots',
      content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    },
    {
      property: 'fb:app_id',
      content: process.env.NEXT_PUBLIC_FB_APP_ID || '',
    },
  ],
  additionalLinkTags: [
    {
      rel: 'icon',
      href: '/favicon.ico',
    },
    {
      rel: 'apple-touch-icon',
      href: '/HDS-Logo.jpeg',
      sizes: '180x180',
    },
    {
      rel: 'manifest',
      href: '/manifest.json',
    },
  ],
};

// Page-specific SEO configurations
export const pageSEO = {
  home: {
    title: 'Premium Web Development & Custom Software',
    description: 'Transform your business with expert web development, React applications, and custom software solutions. 98% success rate, proven ROI. Get your free consultation today.',
    openGraph: {
      title: 'Hudson Digital Solutions - Premium Web Development',
      description: 'Expert web development and custom software solutions with proven ROI',
    },
  },
  contact: {
    title: 'Contact Us - Get Your Free Consultation',
    description: 'Ready to transform your digital presence? Contact Hudson Digital Solutions for a free consultation on web development and custom software solutions.',
    openGraph: {
      title: 'Contact Hudson Digital Solutions',
      description: 'Get your free consultation for web development and custom software solutions',
    },
  },
  services: {
    title: 'Our Services - Web Development & Software Solutions',
    description: 'Explore our comprehensive web development services: React applications, Next.js development, performance optimization, and custom software solutions.',
    openGraph: {
      title: 'Services - Hudson Digital Solutions',
      description: 'Comprehensive web development and software solutions for modern businesses',
    },
  },
  about: {
    title: 'About Us - Expert Web Development Team',
    description: 'Learn about Hudson Digital Solutions - a team of expert developers specializing in React, Next.js, and custom software solutions for businesses.',
    openGraph: {
      title: 'About Hudson Digital Solutions',
      description: 'Expert web development team specializing in modern tech stacks',
    },
  },
  blog: {
    title: 'Blog - Web Development Insights & Tips',
    description: 'Stay updated with the latest web development trends, React best practices, and software engineering insights from Hudson Digital Solutions.',
    openGraph: {
      title: 'Blog - Hudson Digital Solutions',
      description: 'Web development insights and software engineering best practices',
    },
  },
};

// Structured data for organization
export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Hudson Digital Solutions',
  url: 'https://hudsondigitalsolutions.com',
  logo: 'https://hudsondigitalsolutions.com/HDS-Logo.jpeg',
  sameAs: [
    'https://twitter.com/hudsondigital',
    'https://linkedin.com/company/hudson-digital-solutions',
    'https://github.com/hudsondigitalsolutions',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-555-0123',
    contactType: 'customer service',
    email: 'hello@hudsondigitalsolutions.com',
    areaServed: 'US',
    availableLanguage: ['English'],
  },
};

// FAQ structured data
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What services does Hudson Digital Solutions offer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We offer comprehensive web development services including React applications, Next.js development, custom software solutions, performance optimization, and ongoing maintenance.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does a typical web development project take?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Project timelines vary based on complexity. A typical website takes 4-8 weeks, while custom applications can take 2-6 months. We provide detailed timelines during consultation.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you provide ongoing support after project completion?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, we offer comprehensive maintenance packages including updates, security patches, performance monitoring, and feature enhancements.',
      },
    },
  ],
};