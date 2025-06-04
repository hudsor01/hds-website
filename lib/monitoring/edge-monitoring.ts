// Edge runtime monitoring for middleware and edge functions
export class EdgeMonitoring {
  // Track edge function performance
  static trackEdgeFunction(functionName: string, duration: number, success: boolean) {
    const event = {
      type: 'edge_function',
      functionName,
      duration,
      success,
      timestamp: new Date().toISOString(),
    }

    // Edge runtime logging
    console.log('⚡ Edge function executed:', event)

    // In production, you might want to send this to your monitoring service
    // via fetch() to an analytics endpoint
  }

  // Track middleware performance
  static trackMiddleware(path: string, duration: number, statusCode: number) {
    const event = {
      type: 'middleware',
      path,
      duration,
      statusCode,
      timestamp: new Date().toISOString(),
    }

    // Log slow middleware execution
    if (duration > 100) {
      console.warn('⚠️ Slow middleware execution:', event)
    }

    // Log errors
    if (statusCode >= 400) {
      console.error('❌ Middleware error:', event)
    }
  }

  // Track rate limiting
  static trackRateLimit(ip: string, path: string, limited: boolean) {
    const event = {
      type: 'rate_limit',
      ip,
      path,
      limited,
      timestamp: new Date().toISOString(),
    }

    if (limited) {
      console.warn('⚠️ Rate limit triggered:', event)
    }
  }

  // Monitor security events
  static trackSecurityEvent(type: 'csrf' | 'xss' | 'injection' | 'spam', details: unknown) {
    const event = {
      type: 'security_event',
      securityType: type,
      details,
      timestamp: new Date().toISOString(),
    }

    console.warn('🔒 Security event detected:', event)
  }

  // Track API route performance
  static trackApiRoute(route: string, method: string, duration: number, statusCode: number) {
    const event = {
      type: 'api_route',
      route,
      method,
      duration,
      statusCode,
      timestamp: new Date().toISOString(),
    }

    // Log slow API routes
    if (duration > 1000) {
      console.warn('⚠️ Slow API route:', event)
    }

    // Log API errors
    if (statusCode >= 400) {
      console.error('❌ API route error:', event)
    }
  }
}

// Export convenience functions
export const trackEdgeFunction = EdgeMonitoring.trackEdgeFunction.bind(EdgeMonitoring)
export const trackMiddleware = EdgeMonitoring.trackMiddleware.bind(EdgeMonitoring)
export const trackRateLimit = EdgeMonitoring.trackRateLimit.bind(EdgeMonitoring)
export const trackSecurityEvent = EdgeMonitoring.trackSecurityEvent.bind(EdgeMonitoring)
export const trackApiRoute = EdgeMonitoring.trackApiRoute.bind(EdgeMonitoring)