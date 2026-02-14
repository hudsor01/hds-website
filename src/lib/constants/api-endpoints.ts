/**
 * API endpoints
 * Type-safe constants for all API calls
 *
 * Usage:
 *   import { API_ENDPOINTS } from '@/lib/constants/api-endpoints';
 *   const response = await fetch(API_ENDPOINTS.NEWSLETTER_SUBSCRIBE, { ... });
 */

/** Public API endpoints */
export const API_ENDPOINTS = {
  CONTACT: '/api/contact',
  NEWSLETTER_SUBSCRIBE: '/api/newsletter/subscribe',
  TESTIMONIALS: '/api/testimonials',
  CALCULATORS_SUBMIT: '/api/calculators/submit',
  PAGESPEED: '/api/pagespeed',
  WEB_VITALS: '/api/web-vitals',
} as const;

// Type exports
export type ApiEndpoint = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS];
