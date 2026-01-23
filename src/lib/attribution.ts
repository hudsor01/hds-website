/**
 * Lead Attribution Tracking
 * Captures UTM parameters, referrer, and device information for lead source attribution
 */

import { logger } from '@/lib/logger';
import { STORAGE_KEYS } from './constants';
import type { UTMParameters, LeadAttributionData } from '@/types/analytics';

/**
 * Storage key for attribution data in localStorage
 */
const ATTRIBUTION_STORAGE_KEY = 'lead_attribution';
const ATTRIBUTION_EXPIRY_DAYS = 30;

/**
 * Extract UTM parameters from URL
 */
function getUTMParameters(): UTMParameters {
  if (typeof window === 'undefined') {
    return {};
  }

  const params = new URLSearchParams(window.location.search);

  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    utm_term: params.get('utm_term') || undefined,
    utm_content: params.get('utm_content') || undefined,
  };
}

/**
 * Determine traffic source from UTM parameters and referrer
 */
function determineTrafficSource(
  utmParams: UTMParameters,
  referrer: string
): { source: string; medium: string } {
  // If UTM parameters exist, use them
  if (utmParams.utm_source || utmParams.utm_medium) {
    return {
      source: utmParams.utm_source || 'unknown',
      medium: utmParams.utm_medium || 'unknown',
    };
  }

  // No referrer = direct traffic
  if (!referrer) {
    return { source: 'direct', medium: 'none' };
  }

  const referrerDomain = new URL(referrer).hostname.toLowerCase();
  const currentDomain = window.location.hostname.toLowerCase();

  // Same domain = internal/direct
  if (referrerDomain === currentDomain) {
    return { source: 'direct', medium: 'none' };
  }

  // Search engines
  const searchEngines = [
    'google',
    'bing',
    'yahoo',
    'duckduckgo',
    'baidu',
    'yandex',
  ];

  if (searchEngines.some(engine => referrerDomain.includes(engine))) {
    return {
      source: searchEngines.find(engine => referrerDomain.includes(engine)) || 'search',
      medium: 'organic',
    };
  }

  // Social media
  const socialPlatforms = [
    'facebook',
    'twitter',
    'linkedin',
    'instagram',
    'pinterest',
    'reddit',
    'tiktok',
    'youtube',
  ];

  if (socialPlatforms.some(platform => referrerDomain.includes(platform))) {
    return {
      source: socialPlatforms.find(platform => referrerDomain.includes(platform)) || 'social',
      medium: 'social',
    };
  }

  // Everything else is referral
  return {
    source: referrerDomain,
    medium: 'referral',
  };
}

/**
 * Detect device type
 */
function getDeviceType(): string {
  if (typeof window === 'undefined') {
    return 'unknown';
  }

  const ua = navigator.userAgent.toLowerCase();

  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(ua)) {
    return 'tablet';
  }

  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) {
    return 'mobile';
  }

  return 'desktop';
}

/**
 * Detect browser
 */
function getBrowser(): string {
  if (typeof window === 'undefined') {
    return 'unknown';
  }

  const ua = navigator.userAgent.toLowerCase();

  if (ua.includes('chrome') && !ua.includes('edg')) {return 'chrome';}
  if (ua.includes('safari') && !ua.includes('chrome')) {return 'safari';}
  if (ua.includes('firefox')) {return 'firefox';}
  if (ua.includes('edg')) {return 'edge';}
  if (ua.includes('opera') || ua.includes('opr')) {return 'opera';}
  if (ua.includes('trident') || ua.includes('msie')) {return 'ie';}

  return 'other';
}

/**
 * Detect operating system
 */
function getOS(): string {
  if (typeof window === 'undefined') {
    return 'unknown';
  }

  const ua = navigator.userAgent.toLowerCase();

  if (ua.includes('win')) {return 'windows';}
  if (ua.includes('mac')) {return 'macos';}
  if (ua.includes('linux')) {return 'linux';}
  if (ua.includes('android')) {return 'android';}
  if (ua.includes('iphone') || ua.includes('ipad')) {return 'ios';}

  return 'other';
}

/**
 * Generate session ID (simple implementation)
 */
function getSessionId(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  let sessionId = sessionStorage.getItem(STORAGE_KEYS.SESSION_ID);

  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    sessionStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
  }

  return sessionId;
}

/**
 * Capture full attribution data
 */
export function captureAttribution(): LeadAttributionData {
  if (typeof window === 'undefined') {
    return {};
  }

  const utmParams = getUTMParameters();
  const referrer = document.referrer;
  const { source, medium } = determineTrafficSource(utmParams, referrer);

  const attribution: LeadAttributionData = {
    source,
    medium,
    campaign: utmParams.utm_campaign,
    term: utmParams.utm_term,
    content: utmParams.utm_content,
    utm_params: utmParams,
    referrer: referrer || undefined,
    landing_page: window.location.href,
    current_page: window.location.href,
    session_id: getSessionId(),
    device_type: getDeviceType(),
    browser: getBrowser(),
    os: getOS(),
  };

  // Store attribution data in localStorage (first-touch attribution)
  storeAttribution(attribution);

  return attribution;
}

/**
 * Store attribution data in localStorage with expiry
 */
function storeAttribution(attribution: LeadAttributionData): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const existing = getStoredAttribution();

    // Only update if this is the first visit or data has expired
    if (!existing) {
      const data = {
        attribution,
        timestamp: Date.now(),
        expiresAt: Date.now() + (ATTRIBUTION_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
      };

      localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(data));
    }
  } catch (error) {
    // localStorage might be disabled or full
    logger.error('Failed to store attribution data:', error as Error);
  }
}

/**
 * Retrieve stored attribution data
 */
export function getStoredAttribution(): LeadAttributionData | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(ATTRIBUTION_STORAGE_KEY);

    if (!stored) {
      return null;
    }

    const { attribution, expiresAt } = JSON.parse(stored);

    // Check if expired
    if (Date.now() > expiresAt) {
      localStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
      return null;
    }

    return attribution;
  } catch (error) {
    logger.error('Failed to retrieve attribution data:', error as Error);
    return null;
  }
}

/**
 * Get attribution data for current session (or first-touch if available)
 */
export function getAttributionForSubmission(): LeadAttributionData {
  // Use first-touch attribution if available, otherwise capture current
  return getStoredAttribution() || captureAttribution();
}
<<<<<<< HEAD

/**
 * Clear stored attribution data
 */
export function clearAttribution(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_ID);
  } catch (error) {
    logger.error('Failed to clear attribution data:', error as Error);
  }
}

/**
 * Track attribution on page load
 * Call this in your root layout or _app
 */
export function initializeAttribution(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Capture attribution on initial page load
  captureAttribution();
}
||||||| 5406b87

/**
 * Clear stored attribution data
 */
export function clearAttribution(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
    sessionStorage.removeItem('session_id');
  } catch (error) {
    logger.error('Failed to clear attribution data:', error as Error);
  }
}

/**
 * Track attribution on page load
 * Call this in your root layout or _app
 */
export function initializeAttribution(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Capture attribution on initial page load
  captureAttribution();
}
=======
>>>>>>> origin/main
