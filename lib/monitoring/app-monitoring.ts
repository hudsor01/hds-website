// Application performance monitoring
export class AppMonitoring {
  private static instance: AppMonitoring
  private performanceMetrics: Map<string, number[]> = new Map()

  static getInstance(): AppMonitoring {
    if (!AppMonitoring.instance) {
      AppMonitoring.instance = new AppMonitoring()
    }
    return AppMonitoring.instance
  }

  // Track API response times
  trackApiResponse(endpoint: string, duration: number) {
    if (!this.performanceMetrics.has(endpoint)) {
      this.performanceMetrics.set(endpoint, [])
    }
    
    const metrics = this.performanceMetrics.get(endpoint)!
    metrics.push(duration)
    
    // Keep only last 100 measurements
    if (metrics.length > 100) {
      metrics.shift()
    }

    // Log slow responses (> 1 second)
    if (duration > 1000) {
      console.warn(`⚠️ Slow API response: ${endpoint} took ${duration}ms`)
    }
  }

  // Track form submissions
  trackFormSubmission(formType: string, success: boolean, duration?: number) {
    const event = {
      type: 'form_submission',
      formType,
      success,
      duration,
      timestamp: new Date().toISOString(),
    }

    // In production, you would send this to your analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Form submission tracked:', event)
    }

    // Track to analytics if available
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (window as Window & { gtag?: (command: string, targetId: string, config?: Record<string, unknown>) => void }).gtag
      if (typeof gtag === 'function') {
        gtag('event', 'form_submission', {
          form_type: formType,
          success,
          duration,
        })
      }
    }
  }

  // Track email delivery status
  trackEmailDelivery(emailType: string, success: boolean, messageId?: string, error?: string) {
    const event = {
      type: 'email_delivery',
      emailType,
      success,
      messageId,
      error,
      timestamp: new Date().toISOString(),
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email delivery tracked:', event)
    }

    // In production, send to monitoring service
    if (!success) {
      console.error(`❌ Email delivery failed: ${emailType}`, { messageId, error })
    }
  }

  // Generic event tracking
  static trackEvent(eventType: string, properties?: Record<string, unknown>) {
    const event = {
      type: eventType,
      properties,
      timestamp: new Date().toISOString(),
    }

    // In production, you would send this to your analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Event tracked:', event)
    }

    // Track to analytics if available
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (window as Window & { gtag?: (command: string, targetId: string, config?: Record<string, unknown>) => void }).gtag
      if (typeof gtag === 'function') {
        gtag('event', eventType, properties)
      }
    }
  }

  // Get performance summary
  getPerformanceSummary() {
    const summary: Record<string, { avg: number; max: number; count: number }> = {}

    for (const [endpoint, metrics] of this.performanceMetrics.entries()) {
      const avg = metrics.reduce((sum, val) => sum + val, 0) / metrics.length
      const max = Math.max(...metrics)
      
      summary[endpoint] = {
        avg: Math.round(avg),
        max,
        count: metrics.length,
      }
    }

    return summary
  }

  // Log system health
  logSystemHealth() {
    const memory = process.memoryUsage()
    const uptime = process.uptime()

    const health = {
      memory: {
        rss: Math.round(memory.rss / 1024 / 1024), // MB
        heapUsed: Math.round(memory.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memory.heapTotal / 1024 / 1024), // MB
      },
      uptime: Math.round(uptime),
      performanceSummary: this.getPerformanceSummary(),
    }

    console.log('🏥 System health:', health)
    return health
  }
}

// Global monitoring instance
export const monitoring = AppMonitoring.getInstance()

// Export tracking functions for convenience
export const trackApiResponse = monitoring.trackApiResponse.bind(monitoring)
export const trackFormSubmission = monitoring.trackFormSubmission.bind(monitoring)
export const trackEmailDelivery = monitoring.trackEmailDelivery.bind(monitoring)

// Initialize health logging in production
if (process.env.NODE_ENV === 'production') {
  // Log system health every 5 minutes
  setInterval(() => {
    monitoring.logSystemHealth()
  }, 5 * 60 * 1000)
}