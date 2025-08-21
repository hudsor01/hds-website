/**
 * Unified Analytics System - Simplified for build stability
 */

export const trackEvent = (_event: string, _properties?: Record<string, unknown>) => {
  // Simplified tracking for build stability
  if (typeof window !== 'undefined') {
    // Analytics tracking would be implemented here
  }
};

export const analytics = {
  track: trackEvent,
};