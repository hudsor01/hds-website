// Centralized security headers configuration
// Used by next.config.ts, middleware.ts, and security middleware

export const SECURITY_HEADERS = {
  // Core security headers
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff', 
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-DNS-Prefetch-Control': 'on',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
} as const;

// Additional headers for HTTPS/production
export const PRODUCTION_SECURITY_HEADERS = {
  ...SECURITY_HEADERS,
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
} as const;

// Convert to Next.js headers format
export function getNextjsHeaders(includeProduction = false) {
  const headers = includeProduction ? PRODUCTION_SECURITY_HEADERS : SECURITY_HEADERS;
  
  return Object.entries(headers).map(([key, value]) => ({
    key,
    value,
  }));
}

// Apply headers to NextResponse
export function applySecurityHeaders(response: Response, includeProduction = false) {
  const headers = includeProduction ? PRODUCTION_SECURITY_HEADERS : SECURITY_HEADERS;
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

// For validation in tests
export const EXPECTED_SECURITY_HEADERS = SECURITY_HEADERS;