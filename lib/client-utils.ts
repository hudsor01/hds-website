import 'client-only'
import type {
  GeolocationPositionType,
  ScrollBehaviorType,
  DeviceInfo,
  PagePerformanceMetrics,
} from '@/types/utility-types'

/**
* Client-only utilities
* This file contains functions that should only run in the browser
*/
// Browser API utilities
export function getDeviceInfo(): DeviceInfo | null {
  if (typeof window === 'undefined') return null
  
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    screen: {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth,
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
  }
}

// Local storage utilities
export function getLocalStorage(key: string): string | null {
  if (typeof window === 'undefined') return null
  
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function setLocalStorage(key: string, value: string): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

// Session storage utilities
export function getSessionStorage(key: string): string | null {
  if (typeof window === 'undefined') return null
  
  try {
    return sessionStorage.getItem(key)
  } catch {
    return null
  }
}

// Geolocation utilities
export function getCurrentPosition(): Promise<GeolocationPositionType> {
return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'))
      return
    }
    
    navigator.geolocation.getCurrentPosition(resolve, reject)
  })
}

// Clipboard utilities
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!navigator.clipboard) return false
  
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

// Performance measurement utilities
export function measurePagePerformance(): PagePerformanceMetrics | null {
  if (typeof window === 'undefined') return null
  
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  
  return {
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
    firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
    firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
  }
}

// Analytics utilities (client-side)
export function trackClientEvent(event: string, properties: Record<string, unknown>) {
  // Client-side analytics tracking
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, properties)
  }
  
  // PostHog tracking
  if (typeof window !== 'undefined' && window.posthog) {
    window.posthog.capture(event, properties)
  }
}

// DOM utilities
export function smoothScrollTo(elementId: string, behavior: ScrollBehaviorType = 'smooth') {
const element = document.getElementById(elementId)
if (element) {
element.scrollIntoView({ behavior })
}
}

export function focusElement(elementId: string) {
  const element = document.getElementById(elementId)
  if (element && 'focus' in element) {
    (element as HTMLElement).focus()
  }
}