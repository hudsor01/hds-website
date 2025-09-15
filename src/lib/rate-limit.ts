import { pRateLimit } from 'p-ratelimit';

// Simple in-memory rate limiting for API routes
// For production with multiple instances, consider using Redis

// Create rate limiters for different endpoints
export const rateLimiters = {
  // Contact form: 5 requests per minute per IP
  contact: pRateLimit({
    interval: 60 * 1000, // 1 minute
    rate: 5,
    concurrency: 1,
  }),

  // Lead magnet: 10 downloads per hour per IP
  leadMagnet: pRateLimit({
    interval: 60 * 60 * 1000, // 1 hour
    rate: 10,
    concurrency: 1,
  }),

  // General API: 100 requests per minute
  general: pRateLimit({
    interval: 60 * 1000, // 1 minute
    rate: 100,
    concurrency: 10,
  }),

  // Cron/admin endpoints: 10 requests per minute
  admin: pRateLimit({
    interval: 60 * 1000, // 1 minute
    rate: 10,
    concurrency: 1,
  }),
};

// IP-based rate limiting tracker
const ipTrackers = new Map<string, Map<string, number>>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, endpoints] of ipTrackers.entries()) {
    for (const [endpoint, timestamp] of endpoints.entries()) {
      if (now - timestamp > 60 * 60 * 1000) { // Remove entries older than 1 hour
        endpoints.delete(endpoint);
      }
    }
    if (endpoints.size === 0) {
      ipTrackers.delete(ip);
    }
  }
}, 5 * 60 * 1000);

export function trackIpRequest(ip: string, endpoint: string): boolean {
  const now = Date.now();

  if (!ipTrackers.has(ip)) {
    ipTrackers.set(ip, new Map());
  }

  const endpoints = ipTrackers.get(ip);
  if (!endpoints) {
    // This should never happen due to the check above, but for type safety
    return true;
  }
  const lastRequest = endpoints.get(endpoint) || 0;

  // Check if too many requests (simple rate limit: 1 request per second per endpoint)
  if (now - lastRequest < 1000) {
    return false; // Rate limited
  }

  endpoints.set(endpoint, now);
  return true; // Request allowed
}

export function getClientIp(request: Request): string {
  // Try to get real IP from various headers (for proxies/load balancers)
  const headers = request.headers;
  const forwardedFor = headers.get('x-forwarded-for');
  const realIp = headers.get('x-real-ip');
  const cfConnectingIp = headers.get('cf-connecting-ip'); // Cloudflare

  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    const firstIp = forwardedFor.split(',')[0];
    return firstIp ? firstIp.trim() : 'unknown';
  }

  if (realIp) {
    return realIp;
  }

  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fallback to a default if no IP found (shouldn't happen in production)
  return 'unknown';
}