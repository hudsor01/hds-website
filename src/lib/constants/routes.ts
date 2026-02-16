/**
 * Application routes
 * Type-safe constants for all app navigation
 *
 * Usage:
 *   import { ROUTES, TOOL_ROUTES } from '@/lib/constants/routes';
 *   <Link href={ROUTES.CONTACT}>Contact</Link>
 *   <Link href={TOOL_ROUTES.TTL_CALCULATOR}>TTL Calculator</Link>
 */

/** Home and main pages */
export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  SERVICES: '/services',
  PORTFOLIO: '/portfolio',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  BLOG: '/blog',
} as const;

/** Tool pages */
export const TOOL_ROUTES = {
  INDEX: '/tools',
  TTL_CALCULATOR: '/tools/ttl-calculator',
  COST_ESTIMATOR: '/tools/cost-estimator',
  ROI_CALCULATOR: '/tools/roi-calculator',
  MORTGAGE_CALCULATOR: '/tools/mortgage-calculator',
  PERFORMANCE_CALCULATOR: '/tools/performance-calculator',
  TIP_CALCULATOR: '/tools/tip-calculator',
  PAYSTUB_CALCULATOR: '/tools/paystub-calculator',
  CONTRACT_GENERATOR: '/tools/contract-generator',
  INVOICE_GENERATOR: '/tools/invoice-generator',
  PROPOSAL_GENERATOR: '/tools/proposal-generator',
  JSON_FORMATTER: '/tools/json-formatter',
} as const;

/** Dynamic routes with helper functions */
export const DYNAMIC_ROUTES = {
  /** Portfolio project detail page */
  portfolioProject: (slug: string) => `/portfolio/${slug}` as const,

  /** Blog post detail page */
  blogPost: (slug: string) => `/blog/${slug}` as const,

  /** Shared calculator results */
  sharedCalculation: (code: string) => `/tools/ttl-calculator?c=${code}` as const,
} as const;

/** All routes combined */
export const ALL_ROUTES = {
  ...ROUTES,
  TOOLS: TOOL_ROUTES,
  DYNAMIC: DYNAMIC_ROUTES,
} as const;

// Type exports for usage in components
export type Route = typeof ROUTES[keyof typeof ROUTES];
export type ToolRoute = typeof TOOL_ROUTES[keyof typeof TOOL_ROUTES];
export type DynamicRouteBuilder = typeof DYNAMIC_ROUTES[keyof typeof DYNAMIC_ROUTES];

/**
 * Check if pathname is a tool route
 */
export function isToolRoute(pathname: string): boolean {
  return pathname.startsWith('/tools');
}

/**
 * Check if pathname is a blog route
 */
export function isBlogRoute(pathname: string): boolean {
  return pathname.startsWith('/blog');
}
