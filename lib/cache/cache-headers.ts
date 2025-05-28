import { NextResponse } from 'next/server'

/**
 * Cache control configurations for different types of content
 */
export const CACHE_CONFIGS = {
  // Static assets (images, fonts, etc.)
  STATIC_ASSETS: {
    maxAge: 31536000, // 1 year
    staleWhileRevalidate: 86400, // 1 day
    mustRevalidate: false,
  },
  
  // API responses that change infrequently
  API_STABLE: {
    maxAge: 3600, // 1 hour
    staleWhileRevalidate: 300, // 5 minutes
    mustRevalidate: true,
  },
  
  // API responses that change frequently
  API_DYNAMIC: {
    maxAge: 300, // 5 minutes
    staleWhileRevalidate: 60, // 1 minute
    mustRevalidate: true,
  },
  
  // HTML pages
  PAGES: {
    maxAge: 3600, // 1 hour
    staleWhileRevalidate: 300, // 5 minutes
    mustRevalidate: false,
  },
  
  // Never cache (for auth, user-specific content)
  NO_CACHE: {
    maxAge: 0,
    staleWhileRevalidate: 0,
    mustRevalidate: true,
  },
} as const

export type CacheConfig = keyof typeof CACHE_CONFIGS

/**
 * Generate cache control header value
 */
export function generateCacheControl(config: CacheConfig): string {
  const settings = CACHE_CONFIGS[config]
  
  const directives: string[] = []
  
  if (settings.maxAge === 0) {
    directives.push('no-cache', 'no-store', 'must-revalidate')
  } else {
    directives.push(`max-age=${settings.maxAge}`)
    
    if (settings.staleWhileRevalidate > 0) {
      directives.push(`s-maxage=${settings.maxAge}`)
      directives.push(`stale-while-revalidate=${settings.staleWhileRevalidate}`)
    }
    
    if (settings.mustRevalidate) {
      directives.push('must-revalidate')
    }
    
    // Add public for cacheable content
    directives.push('public')
  }
  
  return directives.join(', ')
}

/**
 * Add cache headers to a response
 */
export function addCacheHeaders(response: NextResponse, config: CacheConfig): NextResponse {
  const cacheControl = generateCacheControl(config)
  
  response.headers.set('Cache-Control', cacheControl)
  
  // Add additional caching headers
  if (config !== 'NO_CACHE') {
    // Add ETag for cache validation
    const etag = `'${Date.now()}'`
    response.headers.set('ETag', etag)
    
    // Add Vary header for content negotiation
    response.headers.set('Vary', 'Accept-Encoding, Accept')
  }
  
  return response
}

/**
 * Set cache headers for API responses
 */
export function setCacheHeaders(headers: Headers, config: CacheConfig): void {
  const cacheControl = generateCacheControl(config)
  headers.set('Cache-Control', cacheControl)
  
  if (config !== 'NO_CACHE') {
    const etag = `'${Date.now()}'`
    headers.set('ETag', etag)
    headers.set('Vary', 'Accept-Encoding, Accept')
  }
}

/**
 * Cache strategy for different file types
 */
export function getCacheConfigForPath(pathname: string): CacheConfig {
  // Static assets
  if (pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|otf|eot)$/i)) {
    return 'STATIC_ASSETS'
  }
  
  // CSS and JS files
  if (pathname.match(/\.(css|js)$/i)) {
    return 'STATIC_ASSETS'
  }
  
  // API routes
  if (pathname.startsWith('/api/')) {
    // Authentication endpoints should not be cached
    if (pathname.includes('/auth/') || pathname.includes('/contact/') || pathname.includes('/newsletter/')) {
      return 'NO_CACHE'
    }
    
    // Analytics and lead magnet downloads can be cached briefly
    if (pathname.includes('/analytics/') || pathname.includes('/lead-magnet/')) {
      return 'API_DYNAMIC'
    }
    
    // Other API endpoints
    return 'API_STABLE'
  }
  
  // Regular pages
  return 'PAGES'
}

/**
 * Check if content should be cached based on request headers
 */
export function shouldCache(request: Request): boolean {
  // Don't cache authenticated requests
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    return false
  }
  
  // Don't cache POST, PUT, DELETE requests
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return false
  }
  
  // Don't cache requests with cache-control: no-cache
  const cacheControl = request.headers.get('cache-control')
  if (cacheControl?.includes('no-cache')) {
    return false
  }
  
  return true
}