/**
 * Enhanced Middleware with Comprehensive CSP Implementation
 * 
 * Following Next.js 15 official CSP documentation patterns with:
 * - Dynamic nonce generation for each request
 * - Environment-specific CSP policies
 * - Security headers management
 * - Request filtering and optimization
 * - CSP violation handling preparation
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateNonce, generateSecurityHeaders, cspUtils } from './lib/security/csp-enhanced'

/**
 * Enhanced middleware with comprehensive CSP and security headers
 * Implements Next.js 15 best practices for Content Security Policy
 */
export function middleware(request: NextRequest) {
  // Skip middleware for static assets and API routes that don't need CSP
  if (shouldSkipCSP(request)) {
    return NextResponse.next()
  }

  try {
    // Generate fresh nonce for each request
    const nonceData = generateNonce()
    const nonce = nonceData.value

    // Get environment-appropriate CSP configuration
    const cspConfig = cspUtils.getPresetForEnvironment()
    
    // Generate security headers including CSP with nonce
    const securityHeaders = generateSecurityHeaders(nonce, cspConfig)

    // Create request headers with nonce for server components
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-nonce', nonce)
    requestHeaders.set('x-request-id', nonceData.requestId || crypto.randomUUID())
    requestHeaders.set('x-csp-timestamp', nonceData.timestamp.toString())

    // Set CSP header on request for server components
    if (securityHeaders['Content-Security-Policy']) {
      requestHeaders.set('Content-Security-Policy', securityHeaders['Content-Security-Policy'])
    }

    // Create response with enhanced security headers
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

    // Apply all security headers to response
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    // Additional security enhancements
    response.headers.set('X-Robots-Tag', 'index, follow')
    response.headers.set('X-Request-ID', nonceData.requestId || crypto.randomUUID())

    // Environment-specific headers
    if (process.env.NODE_ENV === 'development') {
      response.headers.set('X-Development-Mode', 'true')
    }

    // CORS headers for API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
      response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
      response.headers.set('Access-Control-Max-Age', '86400')
    }

    return response
  } catch (error) {
    console.error('Middleware CSP error:', error)
    
    // Fallback to basic security headers if CSP generation fails
    const response = NextResponse.next()
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    
    return response
  }
}

/**
 * Determine if CSP should be skipped for this request
 * Based on Next.js documentation recommendations
 */
function shouldSkipCSP(request: NextRequest): boolean {
  const { pathname } = request.nextUrl

  // Skip CSP for static assets
  if (
    pathname.startsWith('/_next/static/') ||
    pathname.startsWith('/_next/image/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml') ||
    pathname.endsWith('.xml') ||
    pathname.endsWith('.txt') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.gif') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.webp') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.json')
  ) {
    return true
  }

  // Skip for API routes that handle CSP violations
  if (pathname === '/api/csp-report') {
    return true
  }

  // Skip for health check endpoints
  if (pathname === '/api/health') {
    return true
  }

  // Skip for prefetch requests (following Next.js documentation)
  const purpose = request.headers.get('purpose')
  const routerPrefetch = request.headers.get('next-router-prefetch')
  
  if (purpose === 'prefetch' || routerPrefetch) {
    return true
  }

  return false
}

/**
 * Middleware configuration following Next.js patterns
 * Matches all requests except those that don't need CSP
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/csp-report (CSP violation reporting)
     * - api/health (health checks)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, sitemap.xml (static files)
     * And exclude prefetch requests
     */
    {
      source: '/((?!api/csp-report|api/health|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}

/*
  Alternative configuration for stricter matching:
  
  export const config = {
    matcher: [
      // Match all paths
      '/(.*)',
    ],
    // But exclude in the middleware function itself
  }
*/

/*
  For debugging CSP in development, you can use this config:
  
  export const config = {
    matcher: [
      // Only match specific paths for testing
      '/',
      '/about',
      '/contact',
      '/services/:path*',
    ],
  }
*/