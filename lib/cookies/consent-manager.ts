/**
 * Cookie Consent Management
 * 
 * LOW PRIORITY #15: Implement cookie consent management
 * 
 * This module implements comprehensive cookie consent:
 * - Cookie categorization
 * - Consent storage
 * - Preference management
 * - Script blocking/unblocking
 * - GDPR compliance
 */
import { useState, useEffect } from 'react'
import { logger } from '@/lib/logger'
import { CookieCategory } from '@/types/enum-types'

/**
 * Cookie consent preferences
 */
export interface CookieConsent {
  necessary: boolean // Always true
  functional: boolean
  analytics: boolean
  marketing: boolean
  timestamp: number
  version: string
}

/**
 * Cookie information
 */
export interface CookieInfo {
  name: string
  category: CookieCategory
  description: string
  duration: string
  provider: string
}

/**
 * Default consent (only necessary cookies)
 */
const DEFAULT_CONSENT: CookieConsent = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
  timestamp: Date.now(),
  version: '1.0',
}

/**
 * Cookie definitions
 */
export const COOKIE_DEFINITIONS: CookieInfo[] = [
  // Necessary cookies
  {
    name: 'session',
    category: CookieCategory.NECESSARY,
    description: 'Authentication session cookie',
    duration: '2 hours',
    provider: 'Hudson Digital Solutions',
  },
  {
    name: 'csrf-token',
    category: CookieCategory.NECESSARY,
    description: 'Security token to prevent cross-site request forgery',
    duration: 'Session',
    provider: 'Hudson Digital Solutions',
  },
  {
    name: 'cookie-consent',
    category: CookieCategory.NECESSARY,
    description: 'Stores your cookie consent preferences',
    duration: '1 year',
    provider: 'Hudson Digital Solutions',
  },
  
  // Functional cookies
  {
    name: 'theme',
    category: CookieCategory.FUNCTIONAL,
    description: 'Remembers your theme preference (light/dark)',
    duration: '1 year',
    provider: 'Hudson Digital Solutions',
  },
  {
    name: 'language',
    category: CookieCategory.FUNCTIONAL,
    description: 'Stores your language preference',
    duration: '1 year',
    provider: 'Hudson Digital Solutions',
  },
  
  // Analytics cookies
  {
    name: '_ga',
    category: CookieCategory.ANALYTICS,
    description: 'Google Analytics tracking cookie',
    duration: '2 years',
    provider: 'Google',
  },
  {
    name: '_gid',
    category: CookieCategory.ANALYTICS,
    description: 'Google Analytics session cookie',
    duration: '24 hours',
    provider: 'Google',
  },
  {
    name: 'ph_*',
    category: CookieCategory.ANALYTICS,
    description: 'PostHog analytics cookies',
    duration: '1 year',
    provider: 'PostHog',
  },
  
  // Marketing cookies
  {
    name: '_fbp',
    category: CookieCategory.MARKETING,
    description: 'Facebook pixel tracking cookie',
    duration: '90 days',
    provider: 'Facebook',
  },
  {
    name: 'li_*',
    category: CookieCategory.MARKETING,
    description: 'LinkedIn insight tracking',
    duration: '6 months',
    provider: 'LinkedIn',
  },
]

/**
 * Cookie consent manager
 */
export class CookieConsentManager {
  private static CONSENT_COOKIE_NAME = 'cookie-consent'
  private static CONSENT_VERSION = '1.0'
  
  /**
   * Get current consent
   */
  static getConsent(): CookieConsent {
    if (typeof window === 'undefined') {
      return DEFAULT_CONSENT
    }
    
    try {
      const stored = localStorage.getItem(this.CONSENT_COOKIE_NAME)
      if (stored) {
        const consent = JSON.parse(stored)
        // Validate stored consent
        if (consent.version === this.CONSENT_VERSION) {
          return consent
        }
      }
    } catch (error) {
      logger.debug('Failed to parse stored consent', { error })
    }
    
    return DEFAULT_CONSENT
  }
  
  /**
   * Save consent preferences
   */
  static saveConsent(consent: Partial<CookieConsent>): void {
    if (typeof window === 'undefined') return
    
    const fullConsent: CookieConsent = {
      ...this.getConsent(),
      ...consent,
      necessary: true, // Always true
      timestamp: Date.now(),
      version: this.CONSENT_VERSION,
    }
    
    try {
      // Save to localStorage
      localStorage.setItem(this.CONSENT_COOKIE_NAME, JSON.stringify(fullConsent))
      
      // Also set as cookie for server-side access
      document.cookie = `${this.CONSENT_COOKIE_NAME}=${encodeURIComponent(
        JSON.stringify(fullConsent),
      )}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`
      
      // Apply consent changes
      this.applyConsent(fullConsent)
      
      // Trigger event for other components
      window.dispatchEvent(new CustomEvent('cookie-consent-updated', {
        detail: fullConsent,
      }))
      
      logger.info('Cookie consent saved', fullConsent)
    } catch (error) {
      logger.error('Failed to save cookie consent', { error })
    }
  }
  
  /**
   * Check if category is allowed
   */
  static isCategoryAllowed(category: CookieCategory): boolean {
    const consent = this.getConsent()
    return consent[category] === true
  }
  
  /**
   * Apply consent by blocking/unblocking scripts
   */
  private static applyConsent(consent: CookieConsent): void {
    // Block/unblock Google Analytics
    if (consent.analytics) {
      this.enableGoogleAnalytics()
    } else {
      this.disableGoogleAnalytics()
    }
    
    // Block/unblock marketing scripts
    if (consent.marketing) {
      this.enableMarketingScripts()
    } else {
      this.disableMarketingScripts()
    }
    
    // Remove non-consented cookies
    this.removeNonConsentedCookies(consent)
  }
  
  /**
   * Enable Google Analytics
   */
  private static enableGoogleAnalytics(): void {
    if (typeof window === 'undefined') return
    
    // Enable GA tracking
    window.gtag = window.gtag || function(...args: unknown[]) {
      (window.dataLayer = window.dataLayer || []).push(...args)
    }
    
    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
    })
    
    // Load GA script if not already loaded
    if (!document.querySelector('script[src*="googletagmanager.com/gtag"]')) {
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`
      document.head.appendChild(script)
    }
  }
  
  /**
   * Disable Google Analytics
   */
  private static disableGoogleAnalytics(): void {
    if (typeof window === 'undefined') return
    
    // Disable GA tracking
    window.gtag = window.gtag || function(...args: unknown[]) {
      (window.dataLayer = window.dataLayer || []).push(...args)
    }
    
    window.gtag('consent', 'update', {
      analytics_storage: 'denied',
    })
    
    // Set opt-out cookie
    document.cookie = `ga-disable-${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}=true; path=/; max-age=${365 * 24 * 60 * 60}`
  }
  
  /**
   * Enable marketing scripts
   */
  private static enableMarketingScripts(): void {
    if (typeof window === 'undefined') return
    
    window.gtag = window.gtag || function(...args: unknown[]) {
      (window.dataLayer = window.dataLayer || []).push(...args)
    }
    
    window.gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    })
  }
  
  /**
   * Disable marketing scripts
   */
  private static disableMarketingScripts(): void {
    if (typeof window === 'undefined') return
    
    window.gtag = window.gtag || function(...args: unknown[]) {
      (window.dataLayer = window.dataLayer || []).push(...args)
    }
    
    window.gtag('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    })
  }
  
  /**
   * Remove cookies that user hasn't consented to
   */
  private static removeNonConsentedCookies(consent: CookieConsent): void {
    if (typeof document === 'undefined') return

    const allCookies = document.cookie.split(';')

    for (const cookie of allCookies) {
      const [name] = cookie.trim().split('=')
      if (!name) continue // Fix: guard against undefined name
      const definition = COOKIE_DEFINITIONS.find(d =>
        name.startsWith(d.name.replace('*', '')),
      )

      if (definition && !consent[definition.category]) {
        // Remove cookie
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
        document.cookie = `${name}=; path=/; domain=.${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`
      }
    }
  }
  
  /**
   * Get cookies by category
   */
  static getCookiesByCategory(category: CookieCategory): CookieInfo[] {
    return COOKIE_DEFINITIONS.filter(cookie => cookie.category === category)
  }
  
  /**
   * Check if consent is required (first visit or version change)
   */
  static isConsentRequired(): boolean {
    if (typeof window === 'undefined') return false
    
    const consent = this.getConsent()
    return !consent.timestamp || consent.version !== this.CONSENT_VERSION
  }
  
  /**
   * Accept all cookies
   */
  static acceptAll(): void {
    this.saveConsent({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    })
  }
  
  /**
   * Reject all optional cookies
   */
  static rejectAll(): void {
    this.saveConsent({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    })
  }
}

/**
 * Cookie consent hook for React components
 */
export function useCookieConsent() {
  const [consent, setConsent] = useState(CookieConsentManager.getConsent())
  
  useEffect(() => {
    const handleUpdate = (event: CustomEvent) => {
      setConsent(event.detail)
    }
    
    window.addEventListener('cookie-consent-updated', handleUpdate as EventListener)
    return () => {
    window.removeEventListener('cookie-consent-updated', handleUpdate as EventListener)
    }
  }, [])
  
  const updateConsent = (newConsent: Partial<CookieConsent>) => {
    CookieConsentManager.saveConsent(newConsent)
  }
  
  return {
    consent,
    updateConsent,
    acceptAll: CookieConsentManager.acceptAll.bind(CookieConsentManager),
    rejectAll: CookieConsentManager.rejectAll.bind(CookieConsentManager),
    isRequired: CookieConsentManager.isConsentRequired(),
  }
}

// For Next.js middleware
export function getCookieConsentFromRequest(request: Request): CookieConsent {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return DEFAULT_CONSENT

  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split('=')
    if (name !== undefined) { // Fix: guard against undefined name
      acc[name] = value ?? ''
    }
    return acc
  }, {} as Record<string, string>)

  // Fix: use string literal for consent cookie name since it's private
  const consentCookie = cookies['cookie-consent']
  if (!consentCookie) return DEFAULT_CONSENT

  try {
    return JSON.parse(decodeURIComponent(consentCookie))
  } catch {
    return DEFAULT_CONSENT
  }
}

