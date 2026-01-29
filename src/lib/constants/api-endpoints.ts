/**
 * API endpoints
 * Type-safe constants for all API calls
 *
 * Usage:
 *   import { API_ENDPOINTS } from '@/lib/constants';
 *   const response = await fetch(API_ENDPOINTS.CONTACT, { ... });
 */

/** Public API endpoints */
export const API_ENDPOINTS = {
  // Contact and forms
  CONTACT: '/api/contact',
  TESTIMONIALS_SUBMIT: '/api/testimonials/submit',
  NEWSLETTER_SUBSCRIBE: '/api/newsletter/subscribe',
  LEAD_MAGNET: '/api/lead-magnet',

  // Tool generators
  PAYSTUB: '/api/paystub',
  CONTRACT: '/api/contract',
  INVOICE: '/api/invoice',
  PROPOSAL: '/api/proposal',

  // TTL Calculator
  TTL_CALCULATE: '/api/ttl/calculate',
  TTL_SAVE: '/api/ttl/save',
  TTL_LOAD: '/api/ttl/load',
  TTL_EMAIL: '/api/ttl/email',

  // Data fetching
  TESTIMONIALS: '/api/testimonials',
  CASE_STUDIES: '/api/case-studies',
  PORTFOLIO: '/api/portfolio',
  BLOG_POSTS: '/api/blog',

  // RSS feeds
  RSS_FEED: '/api/rss/feed',

  // Analytics
  ANALYTICS_PROCESSING: '/api/analytics/processing',
} as const;

/** Admin API endpoints (service role required) */
export const ADMIN_API_ENDPOINTS = {
  USERS: '/api/admin/users',
  ANALYTICS: '/api/admin/analytics',
} as const;

/** Internal API endpoints (server-side only) */
export const INTERNAL_API_ENDPOINTS = {
  SCHEDULED_EMAILS_PROCESS: '/api/scheduled-emails/process',
  WEBHOOKS_SUPABASE: '/api/webhooks/supabase',
  WEBHOOKS_N8N: '/api/webhooks/n8n',
} as const;

/**
 * Helper function for query parameters
 *
 * @example
 * buildApiUrl(API_ENDPOINTS.TTL_LOAD, { code: 'abc123' })
 * // Returns: '/api/ttl/load?code=abc123'
 */
export function buildApiUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
  if (!params || Object.keys(params).length === 0) {
    return endpoint;
  }

  const queryString = new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)])
  ).toString();

  return `${endpoint}?${queryString}`;
}

// Type exports
export type ApiEndpoint = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS];
export type AdminApiEndpoint = typeof ADMIN_API_ENDPOINTS[keyof typeof ADMIN_API_ENDPOINTS];
export type InternalApiEndpoint = typeof INTERNAL_API_ENDPOINTS[keyof typeof INTERNAL_API_ENDPOINTS];
