/**
 * Location Data for Texas Cities
 * Dynamic location pages for SEO and local marketing
 */

import type { LocationData } from '@/types/locations';

// Re-export type for convenience
export type { LocationData };

export const TEXAS_LOCATIONS: LocationData[] = [
  {
    slug: 'dallas',
    city: 'Dallas',
    state: 'Texas',
    stateCode: 'TX',
    tagline: 'Digital Solutions for the Big D',
    description: 'From Deep Ellum startups to Uptown enterprises, we help Dallas businesses compete in the digital economy with custom web development and SaaS consulting.',
    metaDescription: 'Professional web development and SaaS consulting in Dallas, TX. Custom websites, web applications, and digital solutions for North Texas businesses.',
    neighborhoods: ['Downtown Dallas', 'Uptown', 'Deep Ellum', 'Oak Lawn', 'Highland Park', 'Plano', 'Irving', 'Richardson'],
    stats: {
      businesses: '25+',
      projects: '50+',
      satisfaction: '100%',
    },
    features: [
      {
        title: 'E-Commerce Solutions',
        description: 'High-performance online stores built for the Dallas market, from local boutiques to regional retailers.',
      },
      {
        title: 'Custom Web Applications',
        description: 'Scalable web apps for Dallas enterprises, from internal tools to customer-facing platforms.',
      },
      {
        title: 'SaaS Development',
        description: 'End-to-end SaaS consulting for Dallas tech startups and established companies.',
      },
    ],
  },
  {
    slug: 'houston',
    city: 'Houston',
    state: 'Texas',
    stateCode: 'TX',
    tagline: 'Space City Digital Excellence',
    description: 'Serving the diverse Houston business community from the Energy Corridor to the Medical Center with cutting-edge web solutions and digital strategy.',
    metaDescription: 'Expert web development and digital solutions in Houston, TX. Custom websites, SaaS applications, and digital marketing for Houston businesses.',
    neighborhoods: ['Downtown Houston', 'The Heights', 'Midtown', 'Galleria', 'Energy Corridor', 'Medical Center', 'Katy', 'Sugar Land'],
    stats: {
      businesses: '30+',
      projects: '60+',
      satisfaction: '100%',
    },
    features: [
      {
        title: 'Energy Sector Solutions',
        description: 'Custom web applications and portals for Houston energy and oil & gas companies.',
      },
      {
        title: 'Healthcare Tech',
        description: 'HIPAA-compliant web solutions for the Texas Medical Center and healthcare providers.',
      },
      {
        title: 'Business Automation',
        description: 'Streamline operations with custom software solutions tailored to Houston businesses.',
      },
    ],
  },
  {
    slug: 'austin',
    city: 'Austin',
    state: 'Texas',
    stateCode: 'TX',
    tagline: 'Keep Austin Weird, Make Your Website Great',
    description: 'In the heart of Silicon Hills, we partner with Austin tech companies and creative businesses to build innovative digital experiences.',
    metaDescription: 'Austin web development and SaaS consulting. Custom websites, web applications, and digital solutions for Texas tech companies and startups.',
    neighborhoods: ['Downtown Austin', 'South Congress', 'East Austin', 'Domain', 'Mueller', 'Round Rock', 'Cedar Park', 'Georgetown'],
    stats: {
      businesses: '40+',
      projects: '80+',
      satisfaction: '100%',
    },
    features: [
      {
        title: 'Startup MVP Development',
        description: 'Rapid MVP development for Austin startups looking to validate ideas and secure funding.',
      },
      {
        title: 'Tech Company Scale-Up',
        description: 'Scalable architecture and development for growing Austin tech companies.',
      },
      {
        title: 'Creative Agency Sites',
        description: 'Stunning websites for Austin creative agencies, musicians, and artists.',
      },
    ],
  },
  {
    slug: 'san-antonio',
    city: 'San Antonio',
    state: 'Texas',
    stateCode: 'TX',
    tagline: 'Alamo City Digital Innovation',
    description: 'From the River Walk to military contractors, we deliver modern web solutions to San Antonio businesses across every industry.',
    metaDescription: 'San Antonio web development and digital solutions. Custom websites and applications for Alamo City businesses and government contractors.',
    neighborhoods: ['Downtown', 'The Pearl', 'Alamo Heights', 'Stone Oak', 'Medical Center', 'Southtown', 'New Braunfels', 'Boerne'],
    stats: {
      businesses: '20+',
      projects: '40+',
      satisfaction: '100%',
    },
    features: [
      {
        title: 'Government & Defense',
        description: 'Secure web solutions for San Antonio military contractors and government agencies.',
      },
      {
        title: 'Tourism & Hospitality',
        description: 'Engaging websites for River Walk businesses, hotels, and tourism companies.',
      },
      {
        title: 'Healthcare Systems',
        description: 'Custom healthcare applications for San Antonio medical providers and clinics.',
      },
    ],
  },
  {
    slug: 'fort-worth',
    city: 'Fort Worth',
    state: 'Texas',
    stateCode: 'TX',
    tagline: 'Where the West Meets Web',
    description: 'Combining Fort Worth traditional business values with modern digital solutions. We help Tarrant County businesses thrive online.',
    metaDescription: 'Fort Worth web development services. Custom websites, e-commerce, and digital solutions for Tarrant County and North Texas businesses.',
    neighborhoods: ['Downtown', 'Sundance Square', 'Near Southside', 'Cultural District', 'Stockyards', 'Arlington', 'Weatherford', 'Keller'],
    stats: {
      businesses: '15+',
      projects: '30+',
      satisfaction: '100%',
    },
    features: [
      {
        title: 'Local Business Websites',
        description: 'Professional websites for Fort Worth small businesses and family-owned companies.',
      },
      {
        title: 'E-Commerce Platforms',
        description: 'Online stores for Fort Worth retailers, from Western wear to artisan goods.',
      },
      {
        title: 'Manufacturing Tech',
        description: 'Custom web applications for Fort Worth manufacturing and industrial companies.',
      },
    ],
  },
];

/**
 * Get all location slugs for static generation
 */
export function getAllLocationSlugs(): string[] {
  return TEXAS_LOCATIONS.map((location) => location.slug);
}

/**
 * Get location data by slug
 */
export function getLocationBySlug(slug: string): LocationData | undefined {
  return TEXAS_LOCATIONS.find((location) => location.slug === slug);
}

/**
 * Generate LocalBusiness schema for a location
 */
export function generateLocalBusinessSchema(location: LocationData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Hudson Digital Solutions',
    url: `https://hudsondigitalsolutions.com/locations/${location.slug}`,
    email: 'hello@hudsondigitalsolutions.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: location.city,
      addressRegion: location.stateCode,
      addressCountry: 'US',
    },
    areaServed: location.neighborhoods.map((name) => ({
      '@type': 'City',
      name,
    })),
    sameAs: [
      'https://www.linkedin.com/company/hudson-digital-solutions',
      'https://twitter.com/hudsondigital',
    ],
  };
}
