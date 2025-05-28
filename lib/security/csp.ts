// Next.js 15 Content Security Policy with enhanced security patterns
// Following official Next.js 15 CSP documentation and React 19 security best practices

import { env } from '@/lib/env'

/**
 * Generate cryptographically secure nonce for CSP (Next.js 15 pattern)
 * Uses Web Crypto API for Edge Runtime compatibility
 */
export function generateNonce(): string {
  try {
    // Use crypto.randomUUID() for better entropy (supported in modern browsers/Node.js)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return Buffer.from(crypto.randomUUID()).toString('base64')
    }
    
    // Fallback for older environments
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    return btoa(String.fromCharCode(...array))
  } catch (error) {
    console.error('Failed to generate CSP nonce:', error)
    // Fallback nonce - should not happen in production
    return Buffer.from(Date.now().toString()).toString('base64')
  }
}

/**
 * Advanced CSP configuration for Next.js 15 with React 19 security patterns
 */
export function getCSPHeader(nonce: string): string {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isProduction = process.env.NODE_ENV === 'production'
  const appUrl = env.NEXT_PUBLIC_APP_URL
  
  // Base domain for trusted sources
  const baseDomain = new URL(appUrl).origin
  
  const cspDirectives = [
    // Default source - restrict to self only
    "default-src 'self'",
    
    // Script sources with nonce-based security (React 19/Next.js 15 pattern)
    `script-src 'self' 'nonce-${nonce}' ${baseDomain}` +
    (isDevelopment ? " 'unsafe-eval'" : '') + // Only allow eval in development
    ' https://challenges.cloudflare.com' + // Cloudflare Turnstile
    ' https://cdnjs.cloudflare.com' + // CDN for libraries
    ' https://vercel.live', // Vercel Analytics
    
    // Style sources with nonce (Next.js 15 CSS security)
    `style-src 'self' 'nonce-${nonce}' ${baseDomain}` +
    ' https://fonts.googleapis.com' + // Google Fonts
    (isDevelopment ? " 'unsafe-inline'" : ''), // Only allow inline styles in development
    
    // Font sources
    "font-src 'self' https://fonts.gstatic.com data:",
    
    // Image sources with comprehensive allowed domains
    "img-src 'self' data: blob: https:" +
    ' https://images.unsplash.com' + // Stock photos
    ' https://avatars.githubusercontent.com' + // GitHub avatars
    ' https://lh3.googleusercontent.com' + // Google user avatars
    ' https://vercel.com', // Vercel branding
    
    // Connect sources for API calls and external services
    "connect-src 'self' " + baseDomain +
    ' https://api.resend.com' + // Email service
    ' https://challenges.cloudflare.com' + // Cloudflare Turnstile
    ' https://vitals.vercel-insights.com' + // Vercel Analytics
    ' wss:' + // WebSocket connections
    (isDevelopment ? ' ws: http://localhost:*' : ''), // Hot reloading in development
    
    // Worker sources (for service workers)
    "worker-src 'self' blob:",
    
    // Child/frame sources
    'child-src https://challenges.cloudflare.com', // Cloudflare Turnstile
    'frame-src https://challenges.cloudflare.com' + // Cloudflare Turnstile
    ' https://cal.com' + // Cal.com booking widget
    ' https://calendly.com', // Calendly widget
    
    // Media sources
    "media-src 'self' data: blob:",
    
    // Object sources - completely disabled for security
    "object-src 'none'",
    
    // Base URI restriction
    "base-uri 'self'",
    
    // Form action restriction
    "form-action 'self' " + baseDomain,
    
    // Frame ancestors - prevent embedding (clickjacking protection)
    "frame-ancestors 'none'",
    
    // Manifest source for PWA
    "manifest-src 'self'",
    
    // Prefetch sources
    "prefetch-src 'self' " + baseDomain,
    
    // Additional security directives for production
    ...(isProduction ? [
      'upgrade-insecure-requests', // Force HTTPS
      'block-all-mixed-content', // Block mixed content
    ] : []),
  ]

  return cspDirectives.join('; ')
}

/**
 * Enhanced security headers following Next.js 15 best practices
 */
export const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), magnetometer=(), gyroscope=(), accelerometer=(), ambient-light-sensor=(), autoplay=(), encrypted-media=(), fullscreen=(), picture-in-picture=()',
  },
  {
    key: 'Cross-Origin-Embedder-Policy',
    value: 'require-corp',
  },
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin',
  },
  {
    key: 'Cross-Origin-Resource-Policy',
    value: 'same-origin',
  },
]

/**
 * Rate limiting configuration for different endpoints
 */
export const rateLimitConfig = {
  // Authentication endpoints - stricter limits
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per window
    skipSuccessfulRequests: true,
  },
  
  // API endpoints - moderate limits
  api: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
    skipSuccessfulRequests: false,
  },
  
  // Contact form - prevent spam
  contact: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 3, // 3 submissions per window
    skipSuccessfulRequests: true,
  },
  
  // General - very permissive
  general: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 1000, // 1000 requests per minute
    skipSuccessfulRequests: false,
  },
}

/**
 * Get rate limit configuration for a specific path (Next.js 15 pattern)
 */
export function getRateLimitConfig(pathname: string) {
  if (pathname.includes('/api/auth') || pathname.includes('/admin')) {
    return rateLimitConfig.auth
  }
  
  if (pathname.includes('/api/contact') || pathname.includes('/api/lead-magnet')) {
    return rateLimitConfig.contact
  }
  
  if (pathname.startsWith('/api/')) {
    return rateLimitConfig.api
  }
  
  return rateLimitConfig.general
}

/**
 * Security headers for API routes (Next.js 15 App Router pattern)
 */
export function getAPISecurityHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}
  
  securityHeaders.forEach(header => {
    headers[header.key] = header.value
  })
  
  // Additional headers for API routes
  headers['Cache-Control'] = 'no-store, max-age=0'
  headers['Pragma'] = 'no-cache'
  
  return headers
}

/**
 * Validate CSP configuration at startup
 */
export function validateCSPConfig(): boolean {
  try {
    const testNonce = generateNonce()
    const cspHeader = getCSPHeader(testNonce)
    
    // Basic validation
    if (!cspHeader.includes('default-src')) {
      throw new Error('CSP missing default-src directive')
    }
    
    if (!cspHeader.includes(`nonce-${testNonce}`)) {
      throw new Error('CSP nonce not properly included')
    }
    
    if (process.env.NODE_ENV === 'production' && cspHeader.includes('unsafe-eval')) {
      throw new Error('CSP contains unsafe-eval in production')
    }
    
    return true
  } catch (error) {
    console.error('CSP configuration validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return false
  }
}

/**
 * Helper to get nonce from request headers (for React components)
 */
export function getNonceFromHeaders(headers: Headers): string | null {
  return headers.get('x-nonce')
}

/**
 * Create nonce-aware script tag for inline scripts (React 19 pattern)
 */
export function createNonceScript(content: string, nonce: string): string {
  return `<script nonce="${nonce}">${content}</script>`
}

/**
 * Create nonce-aware style tag for inline styles (React 19 pattern)
 */
export function createNonceStyle(content: string, nonce: string): string {
  return `<style nonce="${nonce}">${content}</style>`
}