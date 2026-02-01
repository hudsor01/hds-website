/**
 * Request Utilities
 * Centralized utilities for extracting information from Next.js requests
 */

import type { NextRequest } from 'next/server';

/**
 * Extract client IP address from Next.js request headers
 *
 * Checks headers in priority order:
 * 1. x-forwarded-for (standard proxy header)
 * 2. x-real-ip (alternative proxy header)
 * 3. Falls back to localhost
 *
 * @param request - Next.js request object
 * @returns Client IP address
 *
 * @example
 * ```ts
 * export async function POST(request: NextRequest) {
 *   const clientIp = getClientIp(request);
 *   console.log('Request from:', clientIp);
 * }
 * ```
 */
export function getClientIp(request: NextRequest): string {
  // Check x-forwarded-for header (standard for proxies/load balancers)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs (client, proxy1, proxy2, ...)
    // The first IP is the original client
    const firstIp = forwardedFor.split(',')[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }

  // Check x-real-ip header (alternative used by some proxies)
  const realIp = request.headers.get('x-real-ip');
  if (realIp?.trim()) {
    return realIp.trim();
  }

  // Fallback to localhost (development/testing)
  return '127.0.0.1';
}

/**
 * Extract client IP from raw headers object
 * Used in Server Actions where NextRequest is not available
 *
 * @param headers - Headers object (from next/headers)
 * @returns Client IP address
 *
 * @example
 * ```ts
 * 'use server'
 * import { headers } from 'next/headers';
 *
 * export async function submitForm() {
 *   const headersList = await headers();
 *   const clientIp = getClientIpFromHeaders(headersList);
 * }
 * ```
 */
export function getClientIpFromHeaders(headers: Headers): string {
  // Check x-forwarded-for header
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }

  // Check x-real-ip header
  const realIp = headers.get('x-real-ip');
  if (realIp?.trim()) {
    return realIp.trim();
  }

  // Fallback to localhost
  return '127.0.0.1';
}
