import { parseAsString, parseAsStringEnum, createSearchParamsCache } from 'nuqs/server';

/**
 * Analytics Dashboard URL State Parsers
 * Uses nuqs for type-safe URL state management
 */

// Time range options
export const TIME_RANGES = ['7', '30', '90', '365'] as const;
export type TimeRange = (typeof TIME_RANGES)[number];

// Lead quality options
export const LEAD_QUALITIES = ['all', 'hot', 'warm', 'cold'] as const;
export type LeadQualityFilter = (typeof LEAD_QUALITIES)[number];

// Calculator type options
export const CALCULATOR_TYPES = ['all', 'roi-calculator', 'cost-estimator', 'performance-calculator', 'texas-ttl-calculator'] as const;
export type CalculatorTypeFilter = (typeof CALCULATOR_TYPES)[number];

// Parsers for URL state (cast to mutable arrays for nuqs compatibility)
export const analyticsSearchParams = {
  timeRange: parseAsStringEnum([...TIME_RANGES]).withDefault('30'),
  quality: parseAsStringEnum([...LEAD_QUALITIES]).withDefault('all'),
  calculator: parseAsStringEnum([...CALCULATOR_TYPES]).withDefault('all'),
  search: parseAsString.withDefault(''),
};

// Server-side cache for SSR
export const loadAnalyticsSearchParams = createSearchParamsCache(analyticsSearchParams);
