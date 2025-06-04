/**
 * CORS (Cross-Origin Resource Sharing) Configuration
 * 
 * Production-ready CORS setup for Next.js API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/env'

// CORS configuration type
interface CorsOptions {
  origin: string | string[] | ((origin: string | undefined) => boolean)
  methods?: string[]
  allowedHeaders?: string[]
  exposedHeaders?: string[]
  credentials?: boolean
  maxAge?: number
  preflightContinue?: boolean
  optionsSuccessStatus?: number
}

// Default CORS configuration
const DEFAULT_CORS_OPTIONS: CorsOptions = {
  origin: [],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token',
    'X-API-Key',
  ],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  credentials: true,
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204,
}

/**
 * Get allowed origins based on environment
 */
function getAllowedOrigins(): string[] {
  const origins: string[] = []
  
  // Always allow the main app URL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (appUrl) {
    origins.push(appUrl)
  }
  
  // Development origins
  if (env.NODE_ENV === 'development') {
    origins.push(
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    )
  }
  
  // Production origins
  if (env.NODE_ENV === 'production') {
    // Add your production domains
    const productionOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []
    origins.push(...productionOrigins)
    
    // Add common variations
    if (appUrl) {
      const url = new URL(appUrl)
      origins.push(
        `https://${url.hostname}`,
        `https://www.${url.hostname}`,
      )
    }
  }
  
  // Remove duplicates
  return [...new Set(origins)]
}

/**
 * Check if origin is allowed
 */
function isOriginAllowed(origin: string | undefined, allowedOrigins: string[]): boolean {
  if (!origin) return false
  
  // Check exact match
  if (allowedOrigins.includes(origin)) return true
  
  // Check wildcard subdomains (e.g., *.example.com)
  return allowedOrigins.some(allowed => {
    if (allowed.startsWith('*.')) {
      const domain = allowed.slice(2)
      return origin.endsWith(domain) || origin === `https://${domain}` || origin === `http://${domain}`
    }
    return false
  })
}

/**
 * CORS middleware for API routes
 */
export function corsMiddleware(options: Partial<CorsOptions> = {}) {
  const config: CorsOptions = { ...DEFAULT_CORS_OPTIONS, ...options }
  const allowedOrigins = getAllowedOrigins()
  
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const origin = request.headers.get('origin')
    const method = request.method
    
    // Determine if origin is allowed
    let isAllowed = false
    
    if (typeof config.origin === 'function') {
      isAllowed = config.origin(origin || undefined)
    } else if (Array.isArray(config.origin)) {
      isAllowed = isOriginAllowed(origin, [...config.origin, ...allowedOrigins])
    } else if (typeof config.origin === 'string') {
      isAllowed = origin === config.origin || config.origin === '*'
    } else {
      isAllowed = isOriginAllowed(origin, allowedOrigins)
    }
    
    // Handle preflight requests
    if (method === 'OPTIONS') {
      const response = new NextResponse(null, { 
        status: config.optionsSuccessStatus || 204, 
      })
      
      if (isAllowed && origin) {
        response.headers.set('Access-Control-Allow-Origin', origin)
      }
      
      response.headers.set(
        'Access-Control-Allow-Methods',
        config.methods?.join(', ') || DEFAULT_CORS_OPTIONS.methods!.join(', '),
      )
      
      response.headers.set(
        'Access-Control-Allow-Headers',
        config.allowedHeaders?.join(', ') || DEFAULT_CORS_OPTIONS.allowedHeaders!.join(', '),
      )
      
      if (config.exposedHeaders?.length) {
        response.headers.set(
          'Access-Control-Expose-Headers',
          config.exposedHeaders.join(', '),
        )
      }
      
      if (config.credentials) {
        response.headers.set('Access-Control-Allow-Credentials', 'true')
      }
      
      if (config.maxAge) {
        response.headers.set('Access-Control-Max-Age', config.maxAge.toString())
      }
      
      return response
    }
    
    // For non-preflight requests, return null to continue processing
    // Headers will be added in the response
    return null
  }
}

/**
 * Add CORS headers to response
 */
export function addCorsHeaders(
  response: NextResponse,
  request: NextRequest,
  options: Partial<CorsOptions> = {},
): NextResponse {
  const config: CorsOptions = { ...DEFAULT_CORS_OPTIONS, ...options }
  const allowedOrigins = getAllowedOrigins()
  const origin = request.headers.get('origin')
  
  // Determine if origin is allowed
  let isAllowed = false
  
  if (typeof config.origin === 'function') {
    isAllowed = config.origin(origin || undefined)
  } else if (Array.isArray(config.origin)) {
    isAllowed = isOriginAllowed(origin, [...config.origin, ...allowedOrigins])
  } else if (typeof config.origin === 'string') {
    isAllowed = origin === config.origin || config.origin === '*'
  } else {
    isAllowed = isOriginAllowed(origin, allowedOrigins)
  }
  
  // Set CORS headers
  if (isAllowed && origin) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }
  
  if (config.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }
  
  if (config.exposedHeaders?.length) {
    response.headers.set(
      'Access-Control-Expose-Headers',
      config.exposedHeaders.join(', '),
    )
  }
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  return response
}

/**
 * Create CORS-enabled API route handler
 */
export function withCors<T extends (request: NextRequest, ...args: unknown[]) => unknown>(
  handler: T,
  options: Partial<CorsOptions> = {},
): T {
  return (async (request: NextRequest, ...args: unknown[]) => {
    // Handle preflight
    const corsResponse = await corsMiddleware(options)(request)
    if (corsResponse) return corsResponse
    
    // Execute handler
    const response = await handler(request, ...args)
    
    // Add CORS headers to response
    if (response instanceof NextResponse) {
      return addCorsHeaders(response, request, options)
    }
    
    // If not NextResponse, create one and add headers
    const nextResponse = NextResponse.json(response)
    return addCorsHeaders(nextResponse, request, options)
  }) as T
}

/**
 * CORS configuration presets
 */
export const corsPresets = {
  /**
   * Public API - allows all origins
   */
  public: {
    origin: '*' as const,
    credentials: false,
  },
  
  /**
   * Private API - only allows same origin
   */
  private: {
    origin: (origin: string | undefined) => {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL
      return origin === appUrl
    },
    credentials: true,
  },
  
  /**
   * Partner API - allows specific domains
   */
  partner: (domains: string[]) => ({
    origin: domains,
    credentials: true,
  }),
  
  /**
   * Development - allows localhost
   */
  development: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  },
}

/**
 * Example usage in API route:
 * 
 * export const GET = withCors(async (request) => {
 *   // Your API logic here
 *   return NextResponse.json({ data: 'Hello' })
 * }, corsPresets.public)
 */
