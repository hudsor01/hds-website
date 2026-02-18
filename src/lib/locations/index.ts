/**
 * Location Data
 * Dynamic location pages for SEO and local marketing across the US
 */

import { BUSINESS_INFO } from '../constants/business';

import { ARIZONA_LOCATIONS } from './arizona';
import { ARKANSAS_LOCATIONS } from './arkansas';
import { COLORADO_LOCATIONS } from './colorado';
import { FLORIDA_LOCATIONS } from './florida';
import { GEORGIA_LOCATIONS } from './georgia';
import { LOUISIANA_LOCATIONS } from './louisiana';
import { NEW_MEXICO_LOCATIONS } from './new-mexico';
import { NORTH_CAROLINA_LOCATIONS } from './north-carolina';
import { OKLAHOMA_LOCATIONS } from './oklahoma';
import { TENNESSEE_LOCATIONS } from './tennessee';
import { TEXAS_LOCATIONS } from './texas';

export type { LocationData, LocationFeature, LocationStats } from './types';
import type { LocationData } from './types';

export const LOCATIONS: LocationData[] = [
  ...TEXAS_LOCATIONS,
  ...LOUISIANA_LOCATIONS,
  ...OKLAHOMA_LOCATIONS,
  ...ARIZONA_LOCATIONS,
  ...NEW_MEXICO_LOCATIONS,
  ...ARKANSAS_LOCATIONS,
  ...GEORGIA_LOCATIONS,
  ...COLORADO_LOCATIONS,
  ...TENNESSEE_LOCATIONS,
  ...NORTH_CAROLINA_LOCATIONS,
  ...FLORIDA_LOCATIONS,
];

/**
 * Get all location slugs for static generation
 */
export function getAllLocationSlugs(): string[] {
  return LOCATIONS.map((location) => location.slug);
}

/**
 * Get location data by slug
 */
export function getLocationBySlug(slug: string): LocationData | undefined {
  return LOCATIONS.find((location) => location.slug === slug);
}

/**
 * Get all locations grouped by state name
 */
export function getLocationsByState(): Record<string, LocationData[]> {
  return LOCATIONS.reduce((acc, location) => {
    const state = location.state;
    if (!acc[state]) {
      acc[state] = [];
    }
    acc[state].push(location);
    return acc;
  }, {} as Record<string, LocationData[]>);
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
    email: BUSINESS_INFO.email,
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
