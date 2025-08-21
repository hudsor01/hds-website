import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { applySecurityHeaders } from '@/lib/security-headers';
// Use Web Crypto API for Edge runtime compatibility

// Run on Edge Runtime for minimal overhead
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
};

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const url = request.nextUrl;

  // Add security headers using centralized configuration
  applySecurityHeaders(response);

  // Add performance headers
  response.headers.set('X-Request-Time', Date.now().toString());

  // Force HTTPS in production
  if (process.env.NODE_ENV === 'production' && 
      request.headers.get('x-forwarded-proto') === 'http') {
    return NextResponse.redirect(
      `https://${request.headers.get('host')}${request.nextUrl.pathname}${request.nextUrl.search}`,
      { status: 301 }
    );
  }

  // Security: Block common attack patterns
  const userAgent = request.headers.get('user-agent') || '';
  const suspiciousPatterns = [
    /sqlmap/i,
    /nikto/i, 
    /nessus/i,
    /masscan/i,
    /zmap/i,
    /nmap/i,
    /gobuster/i,
    /dirb/i
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
    return new NextResponse('Blocked', { status: 403 });
  }

  // Security: Rate limiting for specific endpoints (basic protection)
  const pathname = url.pathname;
  if (pathname.startsWith('/api/contact')) {
    // Add rate limiting headers for monitoring
    response.headers.set('X-Endpoint-Type', 'contact-api');
  }

  // Security: Add nonce for CSP (if needed for inline scripts)
  // Use Web Crypto API compatible with Edge runtime
  const nonce = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  response.headers.set('X-CSP-Nonce', nonce);

  // Remove preload headers since fonts are from Google and CSS paths are dynamic

  // Implement stale-while-revalidate for static pages
  if (url.pathname.match(/^\/(about|services|pricing|privacy)$/)) {
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=3600, stale-while-revalidate=86400'
    );
  }

  // Blog pages - longer cache with stale-while-revalidate
  if (url.pathname.startsWith('/blog')) {
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=7200, stale-while-revalidate=604800'
    );
  }

  // API routes - no cache by default
  if (url.pathname.startsWith('/api')) {
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    
    // Add CORS headers for API routes
    response.headers.set('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' 
      ? 'https://hudsondigitalsolutions.com' 
      : '*'
    );
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
  }

  // A/B testing for performance optimizations
  const testGroup = Math.random() > 0.5 ? 'A' : 'B';
  response.cookies.set('perf-test-group', testGroup, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  // Add timing header for performance monitoring
  response.headers.set('Server-Timing', `middleware;dur=${Date.now() - parseInt(response.headers.get('X-Request-Time') || '0')}`);

  return response;
}