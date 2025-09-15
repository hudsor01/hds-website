// Comprehensive security headers for production deployment
export const SECURITY_HEADERS = {
  // Prevent clickjacking attacks
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Enable XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // Enforce HTTPS (HSTS)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Content Security Policy - Hardened for production
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' https://vercel.live https://va.vercel-scripts.com https://app.posthog.com https://us.i.posthog.com https://fonts.googleapis.com 'nonce-{nonce}' 'unsafe-eval'",
    "style-src 'self' https://fonts.googleapis.com 'nonce-{nonce}' 'unsafe-inline'",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "media-src 'self' https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "connect-src 'self' https://vercel.live https://app.posthog.com https://us.i.posthog.com https://vitals.vercel-insights.com wss://app.posthog.com",
    "worker-src 'self' blob:",
    "child-src 'none'",
    "manifest-src 'self'",
    "upgrade-insecure-requests"
  ].join('; '),
  
  // Cross-origin policies
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'credentialless',
  'Cross-Origin-Resource-Policy': 'cross-origin',
  
  // Permissions policy (formerly feature policy)
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()',
    'payment=()',
    'usb=()',
    'bluetooth=()',
    'magnetometer=()',
    'accelerometer=()',
    'gyroscope=()',
    'fullscreen=(self)'
  ].join(', ')
} as const

// Apply headers to NextResponse with nonce support
export function applySecurityHeaders(response: Response, nonce?: string) {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    // Replace nonce placeholder if CSP header and nonce provided
    if (key === 'Content-Security-Policy' && nonce) {
      value = value.replace(/{nonce}/g, nonce);
    }
    response.headers.set(key, value);
  });

  return response;
}