import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  generateNonce,
  getCSPHeader,
  securityHeaders,
  getRateLimitConfig,
  getAPISecurityHeaders,
} from '@/lib/security/csp'
import { getCacheConfigForPath, addCacheHeaders, shouldCache } from '@/lib/cache/cache-headers'
// Note: Edge runtime doesn't support imports with side effects, so we'll track monitoring manually

// Next.js 15 middleware with enhanced security patterns and React 19 compatibility

// In-memory rate limiting store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Clean up expired rate limit entries
 */
function cleanupRateLimitStore() {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Check rate limit for a given identifier and configuration
 */
function isRateLimited(identifier: string, config: { windowMs: number; maxRequests: number }): boolean {
  const now = Date.now()
  const windowStart = now - config.windowMs
  
  // Clean up old entries periodically
  if (Math.random() < 0.1) {
    cleanupRateLimitStore()
  }
  
  const entry = rateLimitStore.get(identifier)
  
  if (!entry || now > entry.resetTime) {
    // Create new entry
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return false
  }
  
  // Increment counter
  entry.count += 1
  
  return entry.count > config.maxRequests
}

/**
 * Get client identifier for rate limiting
 */
function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP from various headers (for proxy/CDN setups)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  // Use the first available IP or fallback to request IP
  const clientIP = forwarded?.split(',')[0]?.trim() || 
                   realIP || 
                   cfConnectingIP || 
                   request.ip || 
                   'unknown'
  
  return clientIP
}

/**
 * Enhanced middleware with Next.js 15 security patterns
 */
export function middleware(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Generate cryptographically secure nonce for CSP (Next.js 15 pattern)
    const nonce = generateNonce()
    const pathname = request.nextUrl.pathname
    
    // Rate limiting check (Next.js 15 security pattern)
    const clientIdentifier = getClientIdentifier(request)
    const rateLimitConfig = getRateLimitConfig(pathname)
    
    if (isRateLimited(clientIdentifier, rateLimitConfig)) {
      console.warn(`Rate limit exceeded for ${clientIdentifier} on ${pathname}`)
      
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': Math.ceil(rateLimitConfig.windowMs / 1000).toString(),
          'X-Rate-Limit-Limit': rateLimitConfig.maxRequests.toString(),
          'X-Rate-Limit-Remaining': '0',
          'X-Rate-Limit-Reset': new Date(Date.now() + rateLimitConfig.windowMs).toISOString(),
          ...getAPISecurityHeaders(),
        },
      })
    }
    
    // Clone request headers and add security context
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-nonce', nonce)
    requestHeaders.set('x-client-ip', clientIdentifier)
    requestHeaders.set('x-request-time', startTime.toString())
    
    // Create response with enhanced security headers
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
    
    // Content Security Policy with nonce (Next.js 15 CSP pattern)
    const cspHeader = getCSPHeader(nonce)
    response.headers.set('Content-Security-Policy', cspHeader)
    
    // Apply all security headers
    securityHeaders.forEach(header => {
      response.headers.set(header.key, header.value)
    })
    
    // Add rate limiting headers for transparency
    const remainingRequests = Math.max(0, rateLimitConfig.maxRequests - (rateLimitStore.get(clientIdentifier)?.count || 0))
    response.headers.set('X-Rate-Limit-Limit', rateLimitConfig.maxRequests.toString())
    response.headers.set('X-Rate-Limit-Remaining', remainingRequests.toString())
    response.headers.set('X-Rate-Limit-Reset', new Date(Date.now() + rateLimitConfig.windowMs).toISOString())
    
    // Add performance timing headers
    response.headers.set('X-Response-Time', (Date.now() - startTime).toString())
    
    // Enhanced caching for performance (Next.js 15 pattern)
    if (shouldCache(request)) {
      const cacheConfig = getCacheConfigForPath(pathname)
      addCacheHeaders(response, cacheConfig)
    }
    
    // Add security headers for API routes
    if (pathname.startsWith('/api/')) {
      const apiHeaders = getAPISecurityHeaders()
      Object.entries(apiHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
    }
    
    // Add development security warnings
    if (process.env.NODE_ENV === 'development') {
      response.headers.set('X-Development-Mode', 'true')
      response.headers.set('X-Security-Warning', 'Development mode - some security features may be relaxed')
    }
    
    return response
    
  } catch (error) {
    // Fallback error handling
    console.error('Middleware error:', error instanceof Error ? error.message : 'Unknown error')
    
    return new NextResponse('Internal Server Error', {
      status: 500,
      headers: getAPISecurityHeaders(),
    })
  }
}

/**
 * Next.js 15 matcher configuration with comprehensive path coverage
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (Next.js static files - handled by Next.js)
     * - _next/image (Next.js image optimization - handled by Next.js)
     * - favicon.ico (favicon)
     * - sitemap.xml, robots.txt (SEO files)
     * 
     * Include:
     * - All API routes for security headers and rate limiting
     * - All pages for CSP nonce generation
     * - All static assets for security headers
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}