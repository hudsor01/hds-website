import { initTRPC } from '@trpc/server'
import { setCacheHeaders } from '@/lib/cache/cache-headers'
import type { AdminUser } from '@/lib/auth/admin'

// Initialize tRPC for cache middleware
const t = initTRPC.context<{ req: Request; user?: AdminUser; res?: Response }>().create()

/**
 * Cache middleware for tRPC procedures
 * 
 * Adds appropriate cache headers based on the procedure type and content
 */
export const cacheMiddleware = (options?: {
  maxAge?: number
  staleWhileRevalidate?: number
  private?: boolean
  noCache?: boolean
}) => {
  const {
    maxAge = 300, // 5 minutes default
    staleWhileRevalidate = 60, // 1 minute default
    private: isPrivate = false,
    noCache = false,
  } = options || {}

  return t.middleware(async ({ ctx, next, path, type }) => {
    const result = await next()

    // Only cache successful responses
    if (result.ok) {
      const headers = new Headers()
      
      if (noCache || ctx.user) {
        // Don't cache authenticated or explicitly no-cache responses
        setCacheHeaders(headers, 'NO_CACHE')
      } else {
        // Generate appropriate cache headers
        const directives: string[] = []
        
        if (isPrivate) {
          directives.push('private')
        } else {
          directives.push('public')
        }
        
        directives.push(`max-age=${maxAge}`)
        
        if (staleWhileRevalidate > 0) {
          directives.push(`s-maxage=${maxAge}`)
          directives.push(`stale-while-revalidate=${staleWhileRevalidate}`)
        }
        
        const cacheControl = directives.join(', ')
        headers.set('Cache-Control', cacheControl)
        
        // Add ETag for cache validation
        const etag = `"${Buffer.from(JSON.stringify(result.data)).toString('base64').slice(0, 16)}"`
        headers.set('ETag', etag)
        
        // Add Vary header
        headers.set('Vary', 'Accept-Encoding, Accept')
      }
      
      // Store headers in context for use in response
      return {
        ...result,
        ctx: {
          ...ctx,
          cacheHeaders: headers,
        },
      }
    }

    return result
  })
}

/**
 * No-cache middleware for sensitive operations
 */
export const noCacheMiddleware = cacheMiddleware({ noCache: true })

/**
 * Short cache middleware for dynamic content
 */
export const shortCacheMiddleware = cacheMiddleware({
  maxAge: 60, // 1 minute
  staleWhileRevalidate: 30, // 30 seconds
})

/**
 * Medium cache middleware for semi-static content
 */
export const mediumCacheMiddleware = cacheMiddleware({
  maxAge: 300, // 5 minutes
  staleWhileRevalidate: 60, // 1 minute
})

/**
 * Long cache middleware for static content
 */
export const longCacheMiddleware = cacheMiddleware({
  maxAge: 3600, // 1 hour
  staleWhileRevalidate: 300, // 5 minutes
})