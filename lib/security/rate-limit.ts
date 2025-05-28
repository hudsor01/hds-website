import { NextRequest, NextResponse } from 'next/server'

// In-memory rate limiting for development
// In production, use Redis or a similar solution
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export interface RateLimitOptions {
  windowMs?: number // Window in milliseconds
  maxRequests?: number // Max requests per window
  identifier?: (_req: NextRequest) => string // Custom identifier function
}

export function rateLimit(options: RateLimitOptions = {}) {
  const {
    windowMs = 60 * 1000, // 1 minute
    maxRequests = 10,
    identifier = req => 
      req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.headers.get('x-real-ip') ||
      req.headers.get('cf-connecting-ip') ||
      'anonymous',
  } = options

  return async function rateLimitMiddleware(
    req: NextRequest,
    handler: (_req: NextRequest) => Promise<NextResponse>,
  ): Promise<NextResponse> {
    const id = identifier(req)
    const now = Date.now()

    // Clean up old entries
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key)
      }
    }

    // Get or create rate limit data for this identifier
    let limitData = rateLimitStore.get(id)

    if (!limitData || limitData.resetTime < now) {
      limitData = {
        count: 0,
        resetTime: now + windowMs,
      }
      rateLimitStore.set(id, limitData)
    }

    // Increment request count
    limitData.count++

    // Check if limit exceeded
    if (limitData.count > maxRequests) {
      return NextResponse.json(
        { error: 'Too many requests, please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(
              Math.ceil((limitData.resetTime - now) / 1000),
            ),
            'X-RateLimit-Limit': String(maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(limitData.resetTime).toISOString(),
          },
        },
      )
    }

    // Process request
    const response = await handler(req)

    // Add rate limit headers to response
    response.headers.set('X-RateLimit-Limit', String(maxRequests))
    response.headers.set(
      'X-RateLimit-Remaining',
      String(maxRequests - limitData.count),
    )
    response.headers.set(
      'X-RateLimit-Reset',
      new Date(limitData.resetTime).toISOString(),
    )

    return response
  }
}
