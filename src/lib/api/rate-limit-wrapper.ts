/**
 * Rate Limiting Wrapper for API Routes
 * Higher-order function that wraps route handlers with rate limiting
 */

import { getClientIp, unifiedRateLimiter } from '@/lib/rate-limiter';
import { createServerLogger } from '@/lib/logger';
import { errorResponse } from '@/lib/api/responses';
import type { NextRequest } from 'next/server';

/**
 * Rate limit keys corresponding to different rate limiting tiers
 * - api: Standard API endpoints (60 requests/min)
 * - readOnlyApi: Read-only endpoints (100 requests/min)
 * - contactFormApi: Contact form submissions (stricter limits)
 * - newsletter: Newsletter signups (3 requests/min)
 * - testimonials: Testimonial submissions
 */
type RateLimitKey = 
  | 'api' 
  | 'readOnlyApi' 
  | 'contactFormApi'
  | 'contactForm'
  | 'newsletter'
  | 'default';

/**
 * Wraps a route handler with rate limiting middleware
 * 
 * @param handler - The route handler function to wrap
 * @param limitKey - The rate limit tier to apply
 * @returns A wrapped handler with rate limiting applied
 * 
 * @example
 * ```typescript
 * // Simple route
 * async function handleContact(request: NextRequest) {
 *   // Handler logic
 * }
 * export const POST = withRateLimit(handleContact, 'contactFormApi');
 * 
 * // Route with params
 * async function handleUpdate(request: NextRequest, context: { params: Promise<{ id: string }> }) {
 *   const { id } = await context.params;
 *   // Handler logic
 * }
 * export const PATCH = withRateLimitParams(handleUpdate, 'contactFormApi');
 * ```
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<Response>,
  limitKey: RateLimitKey = 'api'
) {
  const logger = createServerLogger('rate-limit-wrapper');
  
  return async (request: NextRequest): Promise<Response> => {
    const clientIp = getClientIp(request);
    const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, limitKey);

    if (!isAllowed) {
      logger.warn(`Rate limit exceeded for ${limitKey}`, {
        ip: clientIp,
        endpoint: request.nextUrl.pathname
      });
      return errorResponse(
        'Too many requests. Please try again later.',
        429
      );
    }

    return handler(request);
  };
}

/**
 * Wraps a route handler with params with rate limiting middleware
 * Use this for dynamic routes like /api/items/[id]
 * 
 * @param handler - The route handler function with params to wrap
 * @param limitKey - The rate limit tier to apply
 * @returns A wrapped handler with rate limiting applied
 */
export function withRateLimitParams<T>(
  handler: (request: NextRequest, context: T) => Promise<Response>,
  limitKey: RateLimitKey = 'api'
) {
  const logger = createServerLogger('rate-limit-wrapper');
  
  return async (request: NextRequest, context: T): Promise<Response> => {
    const clientIp = getClientIp(request);
    const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, limitKey);

    if (!isAllowed) {
      logger.warn(`Rate limit exceeded for ${limitKey}`, {
        ip: clientIp,
        endpoint: request.nextUrl.pathname
      });
      return errorResponse(
        'Too many requests. Please try again later.',
        429
      );
    }

    return handler(request, context);
  };
}
