/**
 * Simple metrics for Hudson Digital Solutions
 * Basic tracking for business KPIs only
 */

// Simple contact form tracking
let contactFormSubmissions = 0
let successfulSubmissions = 0

export function recordContactFormSubmission(success: boolean) {
  contactFormSubmissions++
  if (success) {
    successfulSubmissions++
  }
}

export function getMetrics() {
  return {
    contactFormSubmissions,
    successfulSubmissions,
    timestamp: new Date().toISOString()
  }
}