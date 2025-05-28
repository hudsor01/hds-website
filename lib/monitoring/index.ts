/**
 * Monitoring and Error Tracking Setup
 * 
 * MEDIUM PRIORITY #13: Set up monitoring and error tracking
 * 
 * This module configures comprehensive monitoring for:
 * - Application errors
 * - Security events
 * - Performance metrics
 * - User behavior
 * - System health
 */

import { logger } from '@/lib/logger'

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Event types for monitoring
 */
export enum MonitoringEvent {
  // Security events
  LOGIN_ATTEMPT = 'login_attempt',
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  SESSION_EXPIRED = 'session_expired',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  CSRF_VIOLATION = 'csrf_violation',
  CSP_VIOLATION = 'csp_violation',
  
  // Application events
  FORM_SUBMISSION = 'form_submission',
  API_REQUEST = 'api_request',
  API_ERROR = 'api_error',
  DATABASE_ERROR = 'database_error',
  VALIDATION_ERROR = 'validation_error',
  
  // Performance events
  SLOW_RESPONSE = 'slow_response',
  MEMORY_WARNING = 'memory_warning',
  HIGH_CPU_USAGE = 'high_cpu_usage',
  
  // Business events
  CONTACT_FORM = 'contact_form',
  NEWSLETTER_SIGNUP = 'newsletter_signup',
  LEAD_DOWNLOAD = 'lead_download',
}

/**
 * Error context interface
 */
export interface ErrorContext {
  userId?: string
  sessionId?: string
  requestId?: string
  url?: string
  method?: string
  statusCode?: number
  userAgent?: string
  ipAddress?: string
  extra?: Record<string, any>
}

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  responseTime: number
  cpuUsage?: number
  memoryUsage?: number
  requestsPerMinute?: number
}

/**
 * Monitoring configuration
 */
const MONITORING_CONFIG = {
  enabledInDevelopment: false,
  sampleRate: 1.0, // 100% in production
  performanceThreshold: {
    responseTime: 1000, // 1 second
    cpuUsage: 80, // 80%
    memoryUsage: 90, // 90%
  },
  alerting: {
    criticalErrors: true,
    securityEvents: true,
    performanceIssues: true,
  },
}

/**
 * Base monitoring class
 */
export class MonitoringService {
  private static instance: MonitoringService
  private isEnabled: boolean
  
  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'production' || MONITORING_CONFIG.enabledInDevelopment
  }
  
  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService()
    }
    return MonitoringService.instance
  }
  
  /**
   * Track an error
   */
  trackError(
    error: Error,
    severity: ErrorSeverity,
    context?: ErrorContext,
  ): void {
    if (!this.isEnabled) return
    
    const errorData = {
      message: error.message,
      stack: error.stack,
      severity,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      ...context,
    }
    
    // Log locally
    logger.error('Application error tracked', errorData)
    
    // Send to monitoring service
    this.sendToMonitoringService('error', errorData)
    
    // Alert if critical
    if (severity === ErrorSeverity.CRITICAL) {
      this.sendAlert('Critical Error', errorData)
    }
  }
  
  /**
   * Track an event
   */
  trackEvent(
    event: MonitoringEvent,
    data?: Record<string, any>,
  ): void {
    if (!this.isEnabled) return
    
    const eventData = {
      event,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      ...data,
    }
    
    // Log locally
    logger.info('Event tracked', eventData)
    
    // Send to monitoring service
    this.sendToMonitoringService('event', eventData)
    
    // Alert for security events
    if (this.isSecurityEvent(event)) {
      this.checkSecurityThresholds(event, data)
    }
  }
  
  /**
   * Track performance metrics
   */
  trackPerformance(
    endpoint: string,
    metrics: PerformanceMetrics,
  ): void {
    if (!this.isEnabled) return
    
    const performanceData = {
      endpoint,
      ...metrics,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    }
    
    // Check thresholds
    if (metrics.responseTime > MONITORING_CONFIG.performanceThreshold.responseTime) {
      logger.warn('Slow response detected', performanceData)
      this.trackEvent(MonitoringEvent.SLOW_RESPONSE, performanceData)
    }
    
    if (metrics.cpuUsage && metrics.cpuUsage > MONITORING_CONFIG.performanceThreshold.cpuUsage) {
      logger.warn('High CPU usage detected', performanceData)
      this.trackEvent(MonitoringEvent.HIGH_CPU_USAGE, performanceData)
    }
    
    if (metrics.memoryUsage && metrics.memoryUsage > MONITORING_CONFIG.performanceThreshold.memoryUsage) {
      logger.warn('High memory usage detected', performanceData)
      this.trackEvent(MonitoringEvent.MEMORY_WARNING, performanceData)
    }
    
    // Send to monitoring service
    this.sendToMonitoringService('performance', performanceData)
  }
  
  /**
   * Check if event is security-related
   */
  private isSecurityEvent(event: MonitoringEvent): boolean {
    return [
      MonitoringEvent.LOGIN_FAILURE,
      MonitoringEvent.RATE_LIMIT_EXCEEDED,
      MonitoringEvent.SUSPICIOUS_ACTIVITY,
      MonitoringEvent.CSRF_VIOLATION,
      MonitoringEvent.CSP_VIOLATION,
    ].includes(event)
  }
  
  /**
   * Check security thresholds
   */
  private checkSecurityThresholds(
    event: MonitoringEvent,
    data?: Record<string, any>,
  ): void {
    // Example: Alert after 5 failed login attempts from same IP
    if (event === MonitoringEvent.LOGIN_FAILURE) {
      // In production, you would check against a Redis counter
      logger.warn('Failed login attempt', {
        ipAddress: data?.ipAddress,
        username: data?.username,
      })
    }
    
    // Example: Alert on any CSRF violation
    if (event === MonitoringEvent.CSRF_VIOLATION) {
      this.sendAlert('CSRF Violation Detected', data)
    }
  }
  
  /**
   * Send data to monitoring service
   */
  private sendToMonitoringService(
    type: 'error' | 'event' | 'performance',
    data: any,
  ): void {
    // In production, integrate with services like:
    // - Sentry for error tracking
    // - DataDog for metrics
    // - LogRocket for session replay
    // - New Relic for APM
    
    if (process.env.SENTRY_DSN) {
      // Sentry integration
      // Sentry.captureException(error)
    }
    
    if (process.env.DATADOG_API_KEY) {
      // DataDog integration
      // datadog.gauge('custom.metric', value)
    }
    
    // For now, just log
    logger.debug(`Monitoring ${type}`, data)
  }
  
  /**
   * Send alert for critical issues
   */
  private sendAlert(title: string, data: any): void {
    logger.error(`ALERT: ${title}`, data)
    
    // In production, send alerts via:
    // - Email
    // - Slack
    // - PagerDuty
    // - SMS
    
    if (process.env.SLACK_WEBHOOK_URL) {
      // Send to Slack
      fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 ${title}`,
          attachments: [{
            color: 'danger',
            fields: Object.entries(data).map(([key, value]) => ({
              title: key,
              value: String(value),
              short: true,
            })),
          }],
        }),
      }).catch(err => logger.error('Failed to send Slack alert', err))
    }
  }
}

/**
 * Express/Next.js middleware for request monitoring
 */
export function monitoringMiddleware() {
  const monitoring = MonitoringService.getInstance()
  
  return async (req: any, res: any, next: any) => {
    const startTime = Date.now()
    const requestId = crypto.randomUUID()
    
    // Add request ID to headers
    req.headers['x-request-id'] = requestId
    res.setHeader('X-Request-ID', requestId)
    
    // Track request
    monitoring.trackEvent(MonitoringEvent.API_REQUEST, {
      method: req.method,
      url: req.url,
      requestId,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    })
    
    // Monitor response
    const originalSend = res.send
    res.send = function(data: any) {
      res.send = originalSend
      
      const responseTime = Date.now() - startTime
      const statusCode = res.statusCode
      
      // Track performance
      monitoring.trackPerformance(req.url, {
        responseTime,
      })
      
      // Track errors
      if (statusCode >= 400) {
        monitoring.trackEvent(MonitoringEvent.API_ERROR, {
          method: req.method,
          url: req.url,
          statusCode,
          responseTime,
          requestId,
        })
      }
      
      return res.send(data)
    }
    
    next()
  }
}

/**
 * Client-side error boundary for React
 */
export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const monitoring = MonitoringService.getInstance()
  
  const handleError = (error: Error, errorInfo: any) => {
    monitoring.trackError(error, ErrorSeverity.HIGH, {
      extra: {
        componentStack: errorInfo.componentStack,
        props: errorInfo.props,
      },
    })
  }
  
  // This is a monitoring utility, not a React component
  // Error boundary would be implemented in the component layer
}

/**
 * Performance observer for Web Vitals
 */
export function initWebVitalsTracking() {
  if (typeof window === 'undefined') return
  
  const monitoring = MonitoringService.getInstance()
  
  // Track Core Web Vitals
  if ('PerformanceObserver' in window) {
    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      
      monitoring.trackPerformance('web-vitals-lcp', {
        responseTime: lastEntry.startTime,
      })
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
    
    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        monitoring.trackPerformance('web-vitals-fid', {
          responseTime: entry.processingStart - entry.startTime,
        })
      })
    })
    fidObserver.observe({ entryTypes: ['first-input'] })
    
    // Cumulative Layout Shift (CLS)
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      
      monitoring.trackPerformance('web-vitals-cls', {
        responseTime: clsValue * 1000, // Convert to ms
      })
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })
  }
}

/**
 * Custom hook for error tracking
 */
export function useErrorTracking() {
  const monitoring = MonitoringService.getInstance()
  
  const trackError = (error: Error, context?: ErrorContext) => {
    monitoring.trackError(error, ErrorSeverity.MEDIUM, context)
  }
  
  const trackEvent = (event: MonitoringEvent, data?: Record<string, any>) => {
    monitoring.trackEvent(event, data)
  }
  
  return { trackError, trackEvent }
}

// Export singleton instance
export const monitoring = MonitoringService.getInstance()
