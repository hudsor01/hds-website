/**
 * Cal.com configuration
 * Centralized configuration for Cal.com integration with Atoms API support
 */

import type { CalProviderConfig } from '@/types/cal-types'

export const calConfig = {
  // Default Cal.com username/event - can be overridden via props
  defaultCalLink: process.env.NEXT_PUBLIC_CAL_LINK || 'hudsondigital/consultation',
  
  // Cal.com embed script URL
  embedScriptUrl: 'https://app.cal.com/embed/embed.js',
  
  // Default branding
  defaultBrandColor: '#2563eb',
  
  // Default embed configuration
  defaultEmbedConfig: {
    namespace: 'consultation-booking',
    styles: {
      branding: {
        brandColor: '#2563eb',
      },
    },
    hideEventTypeDetails: false,
    layout: 'month_view' as const,
    theme: 'light' as const,
  },
  
  // Cal.com API configuration
  api: {
    baseUrl: process.env.CAL_API_BASE_URL || 'https://api.cal.com/v2',
    timeout: 10000,
    retries: 3,
    rateLimitPerMinute: 60,
  },
  
  // Webhook configuration
  webhook: {
    secret: process.env.CAL_COM_WEBHOOK_SECRET,
    endpoint: '/api/webhooks/cal',
    supportedEvents: [
      'BOOKING_CREATED',
      'BOOKING_RESCHEDULED',
      'BOOKING_CANCELLED',
      'BOOKING_PAID',
      'BOOKING_REQUESTED',
      'MEETING_ENDED',
    ],
  },
  
  // Service definitions for different consultation types
  services: {
    consultation: {
      name: 'Free Consultation',
      slug: 'consultation',
      duration: 30,
      description: 'Discuss your revenue operations needs',
      calEventTypeId: 1, // To be configured based on Cal.com setup
    },
    deepDive: {
      name: 'Deep Dive Session',
      slug: 'deep-dive',
      duration: 60,
      description: 'Comprehensive strategy session',
      calEventTypeId: 2,
    },
    followUp: {
      name: 'Follow-up Meeting',
      slug: 'follow-up',
      duration: 30,
      description: 'Progress review and next steps',
      calEventTypeId: 3,
    },
  },
} as const

/**
 * Cal.com Atoms CalProvider configuration
 */
export const calProviderConfig: CalProviderConfig = {
  clientId: process.env.CAL_OAUTH_CLIENT_ID || '',
  options: {
    apiUrl: 'https://api.cal.com/v2',
    refreshUrl: process.env.CAL_REFRESH_URL,
    readingDirection: 'ltr',
  },
  accessToken: process.env.CAL_ACCESS_TOKEN,
  autoUpdateTimezone: true,
  language: 'en',
  organizationId: process.env.CAL_ORGANIZATION_ID,
}

/**
 * Utility to check if Cal.com script is loaded
 */
export function isCalLoaded(): boolean {
  return typeof window !== 'undefined' && typeof window.Cal === 'function'
}

/**
 * Utility to wait for Cal.com script to load
 */
export function waitForCal(timeout = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isCalLoaded()) {
      resolve()
      return
    }

    const startTime = Date.now()
    const checkInterval = setInterval(() => {
      if (isCalLoaded()) {
        clearInterval(checkInterval)
        resolve()
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval)
        reject(new Error('Cal.com script failed to load within timeout'))
      }
    }, 100)
  })
}