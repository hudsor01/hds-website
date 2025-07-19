// Enhanced SEO utilities for maximum organic reach

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

// Base keywords that should appear across the site for SEO authority
export const BASE_KEYWORDS = [
  'web development',
  'custom software',
  'React development',
  'Next.js',
  'TypeScript',
  'JavaScript',
  'website design',
  'web applications',
  'digital solutions',
  'software engineering',
  'frontend development',
  'full stack development',
  'business automation',
  'performance optimization',
  'responsive design',
  'SEO optimization',
  'user experience',
  'conversion optimization'
];

// Location-based keywords for local SEO
export const LOCATION_KEYWORDS = [
  'web developer',
  'software developer',
  'web development company',
  'custom software development',
  'website developer',
  'React developer',
  'freelance developer',
  'consultant',
  'remote web developer',
  'USA web developer',
  'American software developer',
  'United States web development'
];

// Service-specific long-tail keywords
export const SERVICE_KEYWORDS = {
  'web-development': [
    'custom web application development',
    'responsive website design',
    'e-commerce development',
    'progressive web apps',
    'web app development',
    'modern web development',
    'scalable web solutions'
  ],
  'react-development': [
    'React application development',
    'React component library',
    'React performance optimization',
    'React hooks development',
    'Next.js development',
    'React TypeScript development'
  ],
  'performance': [
    'website speed optimization',
    'web performance audits',
    'Core Web Vitals optimization',
    'website loading speed',
    'performance monitoring',
    'SEO performance optimization'
  ],
  'consulting': [
    'web development consulting',
    'technical consulting',
    'software architecture consulting',
    'code review services',
    'development strategy consulting'
  ]
};

// Generate comprehensive schema markup
export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Hudson Digital Solutions",
    "alternateName": ["Hudson Digital", "HDS"],
    "url": "https://hudsondigitalsolutions.com",
    "description": "Professional web development and custom software solutions that drive business growth and user engagement.",
    "publisher": {
      "@type": "Organization",
      "name": "Hudson Digital Solutions",
      "url": "https://hudsondigitalsolutions.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://hudsondigitalsolutions.com/HDS-Logo.jpeg",
        "width": 200,
        "height": 200
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-234-567-890",
        "contactType": "customer service",
        "email": "hello@hudsondigitalsolutions.com",
        "availableLanguage": "English"
      },
      "sameAs": [
        "https://github.com/hudsor01",
        "https://linkedin.com/in/hudsor01"
      ]
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://hudsondigitalsolutions.com/blog?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Hudson Digital Solutions",
    "url": "https://hudsondigitalsolutions.com",
    "logo": "https://hudsondigitalsolutions.com/HDS-Logo.jpeg",
    "description": "Leading web development and custom software solutions provider specializing in React, Next.js, and modern web technologies.",
    "foundingDate": "2023",
    "founder": {
      "@type": "Person",
      "name": "Hudson Digital Solutions Team"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-234-567-890",
      "contactType": "sales",
      "email": "hello@hudsondigitalsolutions.com",
      "availableLanguage": "English"
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Remote",
      "addressCountry": "US"
    },
    "sameAs": [
      "https://github.com/hudsor01",
      "https://linkedin.com/in/hudsor01"
    ],
    "knowsAbout": [
      "Web Development",
      "React",
      "Next.js",
      "TypeScript",
      "JavaScript",
      "Custom Software Development",
      "Performance Optimization",
      "SEO",
      "User Experience Design"
    ],
    "makesOffer": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Web Application Development",
          "description": "Custom web applications built with React, Next.js, and TypeScript"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Custom Software Development",
          "description": "Bespoke software solutions tailored to business requirements"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Performance Optimization",
          "description": "Website speed and performance optimization services"
        }
      }
    ]
  };
}

export function generatePersonSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Hudson Digital Solutions Developer",
    "jobTitle": "Full Stack Web Developer",
    "description": "Experienced web developer specializing in React, Next.js, TypeScript, and modern web technologies.",
    "url": "https://hudsondigitalsolutions.com",
    "image": "https://hudsondigitalsolutions.com/HDS-Logo.jpeg",
    "sameAs": [
      "https://github.com/hudsor01",
      "https://linkedin.com/in/hudsor01"
    ],
    "knowsAbout": [
      "React Development",
      "Next.js",
      "TypeScript",
      "JavaScript",
      "Web Performance",
      "SEO Optimization",
      "Custom Software Development"
    ],
    "alumniOf": {
      "@type": "EducationalOrganization",
      "name": "Self-taught Developer"
    },
    "worksFor": {
      "@type": "Organization",
      "name": "Hudson Digital Solutions"
    }
  };
}

export function generateServiceSchema(service: {
  name: string;
  description: string;
  price?: string;
  features: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.name,
    "description": service.description,
    "provider": {
      "@type": "Organization",
      "name": "Hudson Digital Solutions",
      "url": "https://hudsondigitalsolutions.com"
    },
    "serviceType": "Web Development",
    "category": "Technology",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": `${service.name} Features`,
      "itemListElement": service.features.map((feature, index) => ({
        "@type": "Offer",
        "position": index + 1,
        "itemOffered": {
          "@type": "Service",
          "name": feature
        }
      }))
    },
    ...(service.price && {
      "offers": {
        "@type": "Offer",
        "price": service.price,
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "validThrough": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      }
    })
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

// Generate meta keywords combining base, location, and service-specific keywords
export function generateMetaKeywords(
  primaryService?: keyof typeof SERVICE_KEYWORDS,
  additionalKeywords: string[] = []
): string {
  const keywords = [
    ...BASE_KEYWORDS,
    ...LOCATION_KEYWORDS,
    ...(primaryService ? SERVICE_KEYWORDS[primaryService] : []),
    ...additionalKeywords
  ];

  // Remove duplicates and return as comma-separated string
  return [...new Set(keywords)].join(', ');
}

// Generate dynamic meta description with keywords
export function generateMetaDescription(
  baseDescription: string,
  keywords: string[] = []
): string {
  const keywordPhrase = keywords.slice(0, 3).join(', ');
  return `${baseDescription} Specializing in ${keywordPhrase} and modern web technologies.`;
}

// Generate OpenGraph optimized title
export function generateOGTitle(title: string, includeCompany = true): string {
  const suffix = includeCompany ? " | Hudson Digital Solutions" : "";
  return `${title}${suffix}`.substring(0, 60); // OG title optimal length
}

// Generate Twitter optimized description
export function generateTwitterDescription(description: string): string {
  return description.substring(0, 200); // Twitter card description limit
}

// SEO-optimized URL slug generator
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

// Generate canonical URL
export function generateCanonicalUrl(path: string): string {
  const baseUrl = 'https://hudsondigitalsolutions.com';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

// Generate LocalBusiness schema for local SEO
export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Hudson Digital Solutions",
    "description": "Professional web development and custom software solutions company serving clients globally with remote services.",
    "url": "https://hudsondigitalsolutions.com",
    "telephone": "+1-234-567-890",
    "email": "hello@hudsondigitalsolutions.com",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US",
      "addressLocality": "Remote Services Available Nationwide"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "40.7128",
      "longitude": "-74.0060"
    },
    "openingHours": "Mo-Fr 09:00-17:00",
    "priceRange": "$$",
    "paymentAccepted": ["Cash", "Credit Card", "Bank Transfer", "PayPal", "Stripe"],
    "areaServed": [
      {
        "@type": "Country",
        "name": "United States"
      },
      {
        "@type": "Country",
        "name": "Canada"
      }
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Web Development Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Custom Web Development"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "React Application Development"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Performance Optimization"
          }
        }
      ]
    }
  };
}

// Generate Review schema for trust signals (removed fake data)
export function generateReviewSchema() {
  // Note: Only add aggregate ratings when you have real customer reviews
  // This is a placeholder - replace with actual review data when available
  return null;
}

// Generate Mobile App schema for PWA
export function generateMobileAppSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    "name": "Hudson Digital Solutions",
    "operatingSystem": "Any",
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": generateReviewSchema()
  };
}

// Enhanced SEO config generator
export function createSEOConfig(config: {
  title: string;
  description: string;
  path: string;
  service?: keyof typeof SERVICE_KEYWORDS;
  additionalKeywords?: string[];
  structuredData?: object;
  includeLocalSchema?: boolean;
  includeMobileSchema?: boolean;
}): SEOConfig {
  const keywords = generateMetaKeywords(config.service, config.additionalKeywords);
  const enhancedDescription = generateMetaDescription(config.description, config.additionalKeywords);

  // Combine multiple schemas if needed
  let structuredData = config.structuredData || [generateWebsiteSchema()];
  if (config.includeLocalSchema) {
    structuredData = Array.isArray(structuredData) ? [...structuredData, generateLocalBusinessSchema()] : [structuredData, generateLocalBusinessSchema()];
  }
  if (config.includeMobileSchema) {
    structuredData = Array.isArray(structuredData) ? [...structuredData, generateMobileAppSchema()] : [structuredData, generateMobileAppSchema()];
  }

  return {
    title: config.title,
    description: enhancedDescription,
    keywords: keywords.split(', '),
    ogTitle: generateOGTitle(config.title),
    ogDescription: config.description,
    ogImage: "https://hudsondigitalsolutions.com/HDS-Logo.jpeg",
    canonical: generateCanonicalUrl(config.path),
    structuredData,
    additionalKeywords: config.additionalKeywords
  };
}