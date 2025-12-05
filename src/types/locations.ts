/**
 * Location Domain Types
 * Types for geographic location data used in location-based pages
 */

/**
 * Location statistics for marketing display
 */
export interface LocationStats {
  businesses: string;
  projects: string;
  satisfaction: string;
}

/**
 * Location feature/benefit item
 */
export interface LocationFeature {
  title: string;
  description: string;
}

/**
 * Full location data for city/region pages
 */
export interface LocationData {
  slug: string;
  city: string;
  state: string;
  stateCode: string;
  tagline: string;
  description: string;
  metaDescription: string;
  neighborhoods: string[];
  stats: LocationStats;
  features: LocationFeature[];
}
