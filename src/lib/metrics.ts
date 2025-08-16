/**
 * Prometheus Metrics for Grafana Monitoring
 * 
 * This module provides metrics collection for:
 * - HTTP request metrics
 * - Business metrics (contact form submissions)
 * - Performance metrics (Web Vitals)
 * - Application health metrics
 */

import { collectDefaultMetrics, register, Counter, Histogram, Gauge, Summary } from 'prom-client';

// Clear existing metrics to prevent duplicates
register.clear();

// Collect default metrics (CPU, memory, etc.)
collectDefaultMetrics({
  prefix: 'hds_',
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
});

// HTTP Request Metrics
export const httpRequestDuration = new Histogram({
  name: 'hds_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

export const httpRequestTotal = new Counter({
  name: 'hds_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

// Contact Form Metrics
export const contactFormSubmissions = new Counter({
  name: 'hds_contact_form_submissions_total',
  help: 'Total number of contact form submissions',
  labelNames: ['status', 'lead_type'],
});

export const contactFormLeadScore = new Histogram({
  name: 'hds_contact_form_lead_score',
  help: 'Distribution of lead scores from contact form',
  buckets: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
});

export const contactFormProcessingTime = new Histogram({
  name: 'hds_contact_form_processing_seconds',
  help: 'Time taken to process contact form submissions',
  labelNames: ['status'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

// Email Metrics
export const emailSentTotal = new Counter({
  name: 'hds_email_sent_total',
  help: 'Total number of emails sent',
  labelNames: ['type', 'status'],
});

export const emailQueueSize = new Gauge({
  name: 'hds_email_queue_size',
  help: 'Current size of email queue',
  labelNames: ['priority'],
});

// Web Vitals Metrics
export const webVitalsLCP = new Summary({
  name: 'hds_web_vitals_lcp_seconds',
  help: 'Largest Contentful Paint (LCP) in seconds',
  percentiles: [0.5, 0.75, 0.9, 0.95, 0.99],
  labelNames: ['page'],
});

export const webVitalsFID = new Summary({
  name: 'hds_web_vitals_fid_milliseconds',
  help: 'First Input Delay (FID) in milliseconds',
  percentiles: [0.5, 0.75, 0.9, 0.95, 0.99],
  labelNames: ['page'],
});

export const webVitalsCLS = new Summary({
  name: 'hds_web_vitals_cls',
  help: 'Cumulative Layout Shift (CLS) score',
  percentiles: [0.5, 0.75, 0.9, 0.95, 0.99],
  labelNames: ['page'],
});

export const webVitalsTTFB = new Summary({
  name: 'hds_web_vitals_ttfb_milliseconds',
  help: 'Time to First Byte (TTFB) in milliseconds',
  percentiles: [0.5, 0.75, 0.9, 0.95, 0.99],
  labelNames: ['page'],
});

export const webVitalsFCP = new Summary({
  name: 'hds_web_vitals_fcp_seconds',
  help: 'First Contentful Paint (FCP) in seconds',
  percentiles: [0.5, 0.75, 0.9, 0.95, 0.99],
  labelNames: ['page'],
});

// Application Health Metrics
export const applicationErrors = new Counter({
  name: 'hds_application_errors_total',
  help: 'Total number of application errors',
  labelNames: ['type', 'severity', 'component'],
});

export const activeUsers = new Gauge({
  name: 'hds_active_users',
  help: 'Number of active users on the site',
});

export const pageViews = new Counter({
  name: 'hds_page_views_total',
  help: 'Total number of page views',
  labelNames: ['page', 'referrer'],
});

// Rate Limiting Metrics
export const rateLimitHits = new Counter({
  name: 'hds_rate_limit_hits_total',
  help: 'Number of rate limit hits',
  labelNames: ['endpoint', 'ip_hash'],
});

// Security Metrics
export const securityEvents = new Counter({
  name: 'hds_security_events_total',
  help: 'Security events detected',
  labelNames: ['type', 'severity', 'blocked'],
});

// Business Metrics
export const conversionEvents = new Counter({
  name: 'hds_conversion_events_total',
  help: 'Conversion events tracked',
  labelNames: ['type', 'source'],
});

// Helper function to record HTTP metrics
export function recordHttpMetrics(
  method: string,
  route: string,
  statusCode: number,
  duration: number
) {
  const labels = { method, route, status_code: statusCode.toString() };
  httpRequestDuration.observe(labels, duration);
  httpRequestTotal.inc(labels);
}

// Helper function to record Web Vitals
export function recordWebVital(
  metric: 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'FCP',
  value: number,
  page: string
) {
  switch (metric) {
    case 'LCP':
      webVitalsLCP.observe({ page }, value / 1000); // Convert to seconds
      break;
    case 'FID':
      webVitalsFID.observe({ page }, value);
      break;
    case 'CLS':
      webVitalsCLS.observe({ page }, value);
      break;
    case 'TTFB':
      webVitalsTTFB.observe({ page }, value);
      break;
    case 'FCP':
      webVitalsFCP.observe({ page }, value / 1000); // Convert to seconds
      break;
  }
}

// Helper function to record contact form metrics
export function recordContactFormMetrics(
  leadScore: number,
  processingTime: number,
  status: 'success' | 'error',
  isHighValue: boolean
) {
  const leadType = isHighValue ? 'high_value' : 'standard';
  contactFormSubmissions.inc({ status, lead_type: leadType });
  contactFormLeadScore.observe(leadScore);
  contactFormProcessingTime.observe({ status }, processingTime);
}

// Helper function to record error metrics
export function recordError(
  type: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  component: string
) {
  applicationErrors.inc({ type, severity, component });
}

// Helper function to record security events
export function recordSecurityEvent(
  type: string,
  severity: 'info' | 'warning' | 'critical',
  blocked: boolean
) {
  securityEvents.inc({ type, severity, blocked: blocked.toString() });
}

// Export the registry for the metrics endpoint
export { register };