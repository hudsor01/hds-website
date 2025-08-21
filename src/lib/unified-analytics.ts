/**
 * Unified Analytics Interface
 * Combines PostHog, Google Analytics, and custom analytics
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}

export interface ConversionEvent {
  type: 'contact_form_submission' | 'lead_magnet_download' | 'consultation_booking';
  value?: number;
  properties?: Record<string, any>;
}

// Stub implementation for unified analytics
export class UnifiedAnalytics {
  track(event: AnalyticsEvent): void {
    console.log('Analytics event:', event);
    // In production, this would send to multiple analytics platforms
  }

  trackConversion(event: ConversionEvent): void {
    console.log('Conversion event:', event);
    // In production, this would track conversions across platforms
  }

  identify(userId: string, properties?: Record<string, any>): void {
    console.log('User identified:', userId, properties);
    // In production, this would identify users across platforms
  }
}

export const analytics = new UnifiedAnalytics();