/**
 * Enhanced Content Security Policy (CSP) Configuration for Next.js 15
 * 
 * Comprehensive CSP implementation following Next.js official documentation with:
 * - Dynamic nonce generation for security
 * - Environment-specific policies (development vs production)
 * - Third-party service integration support
 * - Comprehensive security headers
 * - Violation reporting and monitoring
 * - CSP validation and testing utilities
 */

export interface CSPConfig {
  enableNonce?: boolean
  enableReporting?: boolean
  reportUri?: string
  allowInlineStyles?: boolean
  allowInlineScripts?: boolean
  strictDynamic?: boolean
  upgradeInsecureRequests?: boolean
  trustedDomains?: {
    scripts?: string[]
    styles?: string[]
    images?: string[]
    fonts?: string[]
    connect?: string[]
    media?: string[]
    frames?: string[]
    objects?: string[]
  }
  development?: {
    allowUnsafeEval?: boolean
    allowUnsafeInline?: boolean
    disableCSP?: boolean
  }
}

export interface CSPNonce {
  value: string
  timestamp: number
  requestId?: string
}

export interface CSPViolation {
  'csp-report': {
    'document-uri': string
    'violated-directive': string
    'blocked-uri': string
    'line-number'?: number
    'column-number'?: number
    'source-file'?: string
    'status-code'?: number
    referrer?: string
    'script-sample'?: string
  }
}

// Default CSP configuration following Next.js best practices
export const defaultCSPConfig: CSPConfig = {
  enableNonce: true,
  enableReporting: true,
  reportUri: '/api/csp-report',
  allowInlineStyles: false,
  allowInlineScripts: false,
  strictDynamic: true,
  upgradeInsecureRequests: true,
  trustedDomains: {
    scripts: [
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      'https://challenges.cloudflare.com',
      'https://static.cloudflareinsights.com',
      'https://cdnjs.cloudflare.com',
    ],
    styles: [
      'https://fonts.googleapis.com',
      'https://cdn.jsdelivr.net',
      'https://cdnjs.cloudflare.com',
    ],
    images: [
      'https://images.unsplash.com',
      'https://img.youtube.com',
      'https://i.vimeocdn.com',
      'https://res.cloudinary.com',
      'https://via.placeholder.com',
      'data:',
      'blob:',
    ],
    fonts: [
      'https://fonts.gstatic.com',
      'https://cdn.jsdelivr.net',
    ],
    connect: [
      'https://www.google-analytics.com',
      'https://challenges.cloudflare.com',
      'https://cloudflareinsights.com',
      'https://api.resend.com',
      'https://vitals.vercel-insights.com',
    ],
    media: [
      'https://www.youtube.com',
      'https://player.vimeo.com',
      'blob:',
      'data:',
    ],
    frames: [
      'https://www.youtube.com',
      'https://www.youtube-nocookie.com',
      'https://player.vimeo.com',
      'https://challenges.cloudflare.com',
    ],
    objects: [], // Empty array means 'none'
  },
  development: {
    allowUnsafeEval: true,
    allowUnsafeInline: true,
    disableCSP: false,
  },
}

/**
 * Generate a cryptographically secure nonce for CSP
 * Compatible with Edge Runtime and follows Next.js recommendations
 */
export function generateNonce(): CSPNonce {
  // Use Web Crypto API for Edge Runtime compatibility
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  
  // Convert to base64 without using Buffer (Edge Runtime compatible)
  const nonce = btoa(String.fromCharCode(...array))
  
  return {
    value: nonce,
    timestamp: Date.now(),
    requestId: crypto.randomUUID(),
  }
}

/**
 * Generate CSP header value with comprehensive security policies
 */
export function generateCSPHeader(
  nonce?: string,
  config: CSPConfig = defaultCSPConfig,
): string {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  // Skip CSP in development if disabled
  if (isDevelopment && config.development?.disableCSP) {
    return ''
  }

  const directives: string[] = []

  // Default source - strict self-only policy
  directives.push("default-src 'self'")

  // Script source policy with nonce and strict-dynamic
  const scriptSources = ["'self'"]
  if (nonce && config.enableNonce) {
    scriptSources.push(`'nonce-${nonce}'`)
  }
  if (config.strictDynamic) {
    scriptSources.push("'strict-dynamic'")
  }
  if (config.allowInlineScripts || (isDevelopment && config.development?.allowUnsafeInline)) {
    scriptSources.push("'unsafe-inline'")
  }
  if (isDevelopment && config.development?.allowUnsafeEval) {
    scriptSources.push("'unsafe-eval'")
  }
  // Allow Next.js development scripts
  if (isDevelopment) {
    scriptSources.push('http://localhost:3000', 'https://localhost:3000')
  }
  if (config.trustedDomains?.scripts) {
    scriptSources.push(...config.trustedDomains.scripts)
  }
  directives.push(`script-src ${scriptSources.join(' ')}`)

  // Style source policy
  const styleSources = ["'self'"]
  if (nonce && config.enableNonce) {
    styleSources.push(`'nonce-${nonce}'`)
  }
  if (config.allowInlineStyles || (isDevelopment && config.development?.allowUnsafeInline)) {
    styleSources.push("'unsafe-inline'")
  }
  // Allow Next.js development styles
  if (isDevelopment) {
    styleSources.push('http://localhost:3000', 'https://localhost:3000')
  }
  if (config.trustedDomains?.styles) {
    styleSources.push(...config.trustedDomains.styles)
  }
  directives.push(`style-src ${styleSources.join(' ')}`)

  // Image source policy
  const imgSources = ["'self'"]
  if (config.trustedDomains?.images) {
    imgSources.push(...config.trustedDomains.images)
  }
  directives.push(`img-src ${imgSources.join(' ')}`)

  // Font source policy
  const fontSources = ["'self'"]
  if (config.trustedDomains?.fonts) {
    fontSources.push(...config.trustedDomains.fonts)
  }
  directives.push(`font-src ${fontSources.join(' ')}`)

  // Connect source policy (for XHR, WebSocket, EventSource)
  const connectSources = ["'self'"]
  // Allow Next.js development connections (HMR, etc.)
  if (isDevelopment) {
    connectSources.push('http://localhost:3000', 'https://localhost:3000', 'ws://localhost:3000', 'wss://localhost:3000')
  }
  if (config.trustedDomains?.connect) {
    connectSources.push(...config.trustedDomains.connect)
  }
  directives.push(`connect-src ${connectSources.join(' ')}`)

  // Media source policy
  const mediaSources = ["'self'"]
  if (config.trustedDomains?.media) {
    mediaSources.push(...config.trustedDomains.media)
  }
  directives.push(`media-src ${mediaSources.join(' ')}`)

  // Frame source policy
  if (config.trustedDomains?.frames && config.trustedDomains.frames.length > 0) {
    directives.push(`frame-src ${config.trustedDomains.frames.join(' ')}`)
  } else {
    directives.push("frame-src 'none'")
  }

  // Object source policy - always none for security
  directives.push("object-src 'none'")

  // Worker source policy
  directives.push("worker-src 'self'")

  // Base URI policy
  directives.push("base-uri 'self'")

  // Form action policy
  directives.push("form-action 'self'")

  // Frame ancestors policy - prevent clickjacking
  directives.push("frame-ancestors 'none'")

  // Upgrade insecure requests in production
  if (config.upgradeInsecureRequests && !isDevelopment) {
    directives.push('upgrade-insecure-requests')
  }

  // CSP violation reporting
  if (config.enableReporting && config.reportUri) {
    directives.push(`report-uri ${config.reportUri}`)
  }

  // Join directives and clean up whitespace
  return directives.join('; ').replace(/\s{2,}/g, ' ').trim()
}

/**
 * Generate comprehensive security headers following Next.js best practices
 */
export function generateSecurityHeaders(nonce?: string, config: CSPConfig = defaultCSPConfig) {
  const headers: Record<string, string> = {}

  // Content Security Policy
  const cspValue = generateCSPHeader(nonce, config)
  if (cspValue) {
    headers['Content-Security-Policy'] = cspValue
  }

  // Strict Transport Security
  headers['Strict-Transport-Security'] = 'max-age=63072000; includeSubDomains; preload'

  // X-Frame-Options (backup for frame-ancestors CSP directive)
  headers['X-Frame-Options'] = 'DENY'

  // X-Content-Type-Options
  headers['X-Content-Type-Options'] = 'nosniff'

  // X-XSS-Protection (legacy browsers)
  headers['X-XSS-Protection'] = '1; mode=block'

  // Referrer Policy
  headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'

  // Permissions Policy (Feature Policy)
  headers['Permissions-Policy'] = [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()',
    'accelerometer=()',
    'autoplay=()',
    'clipboard-write=()',
    'encrypted-media=()',
    'fullscreen=()',
    'gyroscope=()',
    'magnetometer=()',
    'payment=()',
    'picture-in-picture=()',
    'usb=()',
  ].join(', ')

  // Cross-Origin policies
  headers['Cross-Origin-Embedder-Policy'] = 'require-corp'
  headers['Cross-Origin-Opener-Policy'] = 'same-origin'
  headers['Cross-Origin-Resource-Policy'] = 'same-origin'

  // DNS Prefetch Control
  headers['X-DNS-Prefetch-Control'] = 'on'

  return headers
}

/**
 * Validate CSP configuration for common issues
 */
export function validateCSPConfig(config: CSPConfig): { valid: boolean; warnings: string[]; errors: string[] } {
  const warnings: string[] = []
  const errors: string[] = []

  // Check for unsafe practices
  if (config.allowInlineScripts) {
    warnings.push('Allowing inline scripts reduces security. Consider using nonces instead.')
  }

  if (config.allowInlineStyles) {
    warnings.push('Allowing inline styles reduces security. Consider using nonces instead.')
  }

  // Check for development settings in production
  if (process.env.NODE_ENV === 'production') {
    if (config.development?.allowUnsafeEval) {
      errors.push('unsafe-eval should not be allowed in production')
    }
    if (config.development?.allowUnsafeInline) {
      warnings.push('unsafe-inline in production reduces security')
    }
    if (config.development?.disableCSP) {
      errors.push('CSP should not be disabled in production')
    }
  }

  // Check for required domains
  if (!config.trustedDomains?.scripts?.includes('https://www.googletagmanager.com') && 
      config.trustedDomains?.scripts?.some(src => src.includes('gtag'))) {
    warnings.push('Google Analytics domains may be incomplete')
  }

  // Check reporting configuration
  if (config.enableReporting && !config.reportUri) {
    warnings.push('CSP reporting is enabled but no report URI is configured')
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  }
}

/**
 * Parse CSP violation reports for monitoring and analysis
 */
export function parseCSPViolation(violation: CSPViolation) {
  const report = violation['csp-report']
  
  return {
    documentUri: report['document-uri'],
    violatedDirective: report['violated-directive'],
    blockedUri: report['blocked-uri'],
    lineNumber: report['line-number'],
    columnNumber: report['column-number'],
    sourceFile: report['source-file'],
    statusCode: report['status-code'],
    referrer: report.referrer,
    scriptSample: report['script-sample'],
    timestamp: new Date().toISOString(),
    severity: determineViolationSeverity(report['violated-directive']),
  }
}

function determineViolationSeverity(directive: string): 'low' | 'medium' | 'high' | 'critical' {
  if (directive.includes('script-src')) return 'critical'
  if (directive.includes('object-src') || directive.includes('frame-src')) return 'high'
  if (directive.includes('style-src') || directive.includes('img-src')) return 'medium'
  return 'low'
}

/**
 * Generate CSP for specific environments and use cases
 */
export const cspPresets = {
  /**
   * Strict CSP for maximum security (production recommended)
   */
  strict: {
    enableNonce: true,
    enableReporting: true,
    allowInlineStyles: false,
    allowInlineScripts: false,
    strictDynamic: true,
    upgradeInsecureRequests: true,
    trustedDomains: {
      scripts: ['https://www.googletagmanager.com'],
      styles: ['https://fonts.googleapis.com'],
      images: ['data:', 'blob:'],
      fonts: ['https://fonts.gstatic.com'],
      connect: ['https://www.google-analytics.com'],
      media: ['blob:'],
      frames: [],
      objects: [],
    },
  } as CSPConfig,

  /**
   * Balanced CSP for most applications
   */
  balanced: defaultCSPConfig,

  /**
   * Permissive CSP for development or legacy applications
   */
  permissive: {
    enableNonce: false,
    enableReporting: true,
    allowInlineStyles: true,
    allowInlineScripts: true,
    strictDynamic: false,
    upgradeInsecureRequests: false,
    trustedDomains: {
      scripts: ['https:', "'unsafe-inline'", "'unsafe-eval'"],
      styles: ['https:', "'unsafe-inline'"],
      images: ['https:', 'data:', 'blob:'],
      fonts: ['https:', 'data:'],
      connect: ['https:', 'wss:'],
      media: ['https:', 'blob:', 'data:'],
      frames: ['https:'],
      objects: ['https:'],
    },
    development: {
      allowUnsafeEval: true,
      allowUnsafeInline: true,
      disableCSP: false,
    },
  } as CSPConfig,

  /**
   * CSP for testing environments
   */
  testing: {
    enableNonce: false,
    enableReporting: false,
    allowInlineStyles: true,
    allowInlineScripts: true,
    strictDynamic: false,
    upgradeInsecureRequests: false,
    development: {
      allowUnsafeEval: true,
      allowUnsafeInline: true,
      disableCSP: false,
    },
  } as CSPConfig,
} as const

/**
 * Utility functions for CSP management
 */
export const cspUtils = {
  /**
   * Get appropriate CSP preset based on environment
   */
  getPresetForEnvironment: (): CSPConfig => {
    const env = process.env.NODE_ENV
    
    switch (env) {
      case 'production':
        return cspPresets.strict
      case 'development':
        return cspPresets.balanced
      case 'test':
        return cspPresets.testing
      default:
        return cspPresets.balanced
    }
  },

  /**
   * Merge CSP configurations with override support
   */
  mergeConfigs: (base: CSPConfig, override: Partial<CSPConfig>): CSPConfig => ({
      ...base,
      ...override,
      trustedDomains: {
        ...base.trustedDomains,
        ...override.trustedDomains,
      },
      development: {
        ...base.development,
        ...override.development,
      },
    }),

  /**
   * Convert CSP string back to config object (for debugging)
   */
  parseCSPHeader: (cspHeader: string): Record<string, string[]> => {
    const directives: Record<string, string[]> = {}
    
    cspHeader.split(';').forEach(directive => {
      const [name, ...values] = directive.trim().split(' ')
      if (name && values.length > 0) {
        directives[name] = values
      }
    })
    
    return directives
  },

  /**
   * Test CSP against common attack vectors
   */
  testCSP: (cspHeader: string) => {
    const tests = {
      inlineScript: cspHeader.includes("'unsafe-inline'") && cspHeader.includes('script-src'),
      inlineStyle: cspHeader.includes("'unsafe-inline'") && cspHeader.includes('style-src'),
      evalScript: cspHeader.includes("'unsafe-eval'"),
      frameAncestors: cspHeader.includes('frame-ancestors'),
      upgradeInsecure: cspHeader.includes('upgrade-insecure-requests'),
      objectSrc: cspHeader.includes("object-src 'none'"),
      baseSrc: cspHeader.includes("base-uri 'self'"),
    }
    
    return {
      ...tests,
      securityScore: Object.values(tests).filter(Boolean).length / Object.keys(tests).length,
    }
  },
}


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
  
  const securityHeaders = [
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
  
  securityHeaders.forEach(header => {
    headers[header.key] = header.value
  })
  
  // Additional headers for API routes
  headers['Cache-Control'] = 'no-store, max-age=0'
  headers['Pragma'] = 'no-cache'
  
  return headers
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

/**
 * Legacy function name for backward compatibility
 * @deprecated Use generateCSPHeader instead
 */
export function getCSPHeader(nonce: string): string {
  return generateCSPHeader(nonce)
}

/**
 * Legacy security headers export for backward compatibility
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