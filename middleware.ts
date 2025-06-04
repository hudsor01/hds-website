import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { corsMiddleware, addCorsHeaders } from '@/lib/security/cors'
import { env } from '@/lib/env'

/**
 * Security headers configuration
 */
const SECURITY_HEADERS = {
  // Prevent clickjacking attacks
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions Policy (formerly Feature Policy)
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  
  // DNS prefetch control
  'X-DNS-Prefetch-Control': 'on',
  
  // Download options
  'X-Download-Options': 'noopen',
  
  // Permitted cross-domain policies
  'X-Permitted-Cross-Domain-Policies': 'none',
}

/**
 * Paths that require authentication
 */
const PROTECTED_PATHS = [
  '/api/admin',
  '/api/trpc',
  '/admin',
]

/**
 * Paths that are public APIs (allow CORS)
 */
const PUBLIC_API_PATHS = [
  '/api/analytics/web-vitals',
  '/api/csp-report',
]

/**
 * Main middleware function
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle CORS for public API endpoints
  if (PUBLIC_API_PATHS.some(path => pathname.startsWith(path))) {
    const corsResponse = await corsMiddleware({
      origin: '*',
      credentials: false,
    })(request)
    
    if (corsResponse) return corsResponse
  }

  // Create response
  let response = NextResponse.next()

  // Add security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Add CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    response = addCorsHeaders(response, request)
  }

  // Add CSP header (you should have this from your CSP implementation)
  const cspHeader = generateCSPHeader(request)
  if (cspHeader) {
    response.headers.set('Content-Security-Policy', cspHeader)
  }

  // Add HSTS header for production
  if (env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload',
    )
  }

  // Authentication check for protected routes
  if (PROTECTED_PATHS.some(path => pathname.startsWith(path))) {
    const token = request.cookies.get('session')?.value ||
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      // Redirect to login for web requests, return 401 for API
      if (pathname.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({ error: 'Authentication required' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } },
        )
      } else {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }

    // TODO: Validate token here
    // const isValid = await validateToken(token)
    // if (!isValid) { ... }
  }

  // Rate limiting headers (if you have rate limiting implemented)
  if (pathname.startsWith('/api/')) {
    response.headers.set('X-RateLimit-Limit', '100')
    response.headers.set('X-RateLimit-Remaining', '99')
    response.headers.set('X-RateLimit-Reset', new Date(Date.now() + 60000).toISOString())
  }

  return response
}

/**
 * Generate CSP header based on request
 */
function generateCSPHeader(request: NextRequest): string | null {
  // This should integrate with your existing CSP implementation
  // For now, here's a basic example
  const nonce = crypto.randomUUID()
  
  const directives = [
    'default-src \'self\'',
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https: 'unsafe-inline'`,
    'style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com',
    'font-src \'self\' https://fonts.gstatic.com',
    'img-src \'self\' data: https: blob:',
    'connect-src \'self\' https://api.posthog.com https://app.posthog.com wss://app.posthog.com',
    'media-src \'self\'',
    'object-src \'none\'',
    'frame-src \'self\' https://cal.com',
    'base-uri \'self\'',
    'form-action \'self\'',
    'frame-ancestors \'none\'',
    'upgrade-insecure-requests',
  ]

  // Add report URI if configured
  if (process.env.CSP_REPORT_URI) {
    directives.push(`report-uri ${process.env.CSP_REPORT_URI}`)
  }

  return directives.join('; ')
}

/**
 * Middleware configuration
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
