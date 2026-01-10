/**
 * Unified Analytics Module
 * Migrated to Vercel Analytics for better performance and reliability
 * Lightweight, non-blocking analytics with Vercel Analytics
 */

import { track as vercelTrack } from '@vercel/analytics';
import { logger } from '@/lib/logger';
import type {
    EventProperties,
    PageViewProperties,
    UserProperties,
} from "@/types/analytics";

type AnalyticsValue = string | number | boolean | null | undefined;

/**
 * Analytics Manager - Lightweight, non-blocking analytics
 * Uses Vercel Analytics for reliable event tracking
 */
class AnalyticsManager {
  private initialized = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.initialized = true;
    }
  }

  /**
   * Track custom event
   */
  trackEvent(eventName: string, properties?: EventProperties): void {
    if (!this.initialized) {
      return;
    }

    try {
      vercelTrack(eventName, properties);
    } catch (error) {
      logger.warn('Failed to track event:', error);
    }
  }

  /**
   * Track page view
   */
  trackPageView(properties?: PageViewProperties): void {
    if (!this.initialized) {
      return;
    }

    try {
      vercelTrack('page_view', properties as Record<string, AnalyticsValue>);
    } catch (error) {
      logger.warn('Failed to track page view:', error);
    }
  }

  /**
   * Identify user (Vercel Analytics doesn't support user identification)
   */
  identify(userId: string, properties?: UserProperties): void {
    if (!this.initialized) {
      return;
    }

    try {
      // Vercel Analytics doesn't support user identification
      // We can track it as an event instead
      vercelTrack('user_identified', { userId, ...properties });
    } catch (error) {
      logger.warn('Failed to identify user:', error);
    }
  }

  /**
   * Track conversion
   */
  trackConversion(
    conversionType: string,
    value?: number,
    currency = 'USD',
    properties?: Record<string, AnalyticsValue>
  ): void {
    if (!this.initialized) {
      return;
    }

    try {
      vercelTrack('conversion', {
        conversionType,
        value,
        currency,
        ...properties
      });
    } catch (error) {
      logger.warn('Failed to track conversion:', error);
    }
  }

  /**
   * Track timing/performance metrics
   */
  trackTiming(
    category: string,
    action: string,
    time: number,
    label?: string
  ): void {
    if (!this.initialized) {
      return;
    }

    try {
      vercelTrack('timing', {
        category,
        action,
        time,
        label
      });
    } catch (error) {
      logger.warn('Failed to track timing:', error);
    }
  }

  /**
   * Track error
   */
  trackError(error: Error | string, fatal = false): void {
    if (!this.initialized) {
      return;
    }

    try {
      const errorMessage = error instanceof Error ? error.message : error;
      const errorStack = error instanceof Error ? error.stack : undefined;

      vercelTrack('error', {
        message: errorMessage,
        stack: errorStack,
        fatal
      });
    } catch (err) {
      logger.warn('Failed to track error:', err);
    }
  }

  /**
   * Track form interaction
   */
  trackFormInteraction(
    formName: string,
    action: string,
    fieldName?: string
  ): void {
    if (!this.initialized) {
      return;
    }

    try {
      vercelTrack('form_interaction', {
        formName,
        action,
        fieldName
      });
    } catch (error) {
      logger.warn('Failed to track form interaction:', error);
    }
  }

  /**
   * Track CTA click
   */
  trackCTAClick(
    ctaName: string,
    location: string,
    destination?: string
  ): void {
    if (!this.initialized) {
      return;
    }

    try {
      vercelTrack('cta_click', {
        ctaName,
        location,
        destination
      });
    } catch (error) {
      logger.warn('Failed to track CTA click:', error);
    }
  }

  /**
   * Track scroll depth
   */
  trackScrollDepth(percentage: number): void {
    if (!this.initialized) {
      return;
    }

    try {
      vercelTrack('scroll_depth', { percentage });
    } catch (error) {
      logger.warn('Failed to track scroll depth:', error);
    }
  }

  /**
   * Track time on page
   */
  trackTimeOnPage(seconds: number): void {
    if (!this.initialized) {
      return;
    }

    try {
      vercelTrack('time_on_page', { seconds });
    } catch (error) {
      logger.warn('Failed to track time on page:', error);
    }
  }

  /**
   * Reset analytics (no-op for Vercel Analytics)
   */
  reset(): void {
    // Vercel Analytics doesn't support resetting
  }
}

// Create singleton instance
const analytics = new AnalyticsManager();

// Export convenience functions
export const trackEvent = (eventName: string, properties?: EventProperties) =>
  analytics.trackEvent(eventName, properties);

export const identify = (userId: string, properties?: UserProperties) =>
  analytics.identify(userId, properties);

export const trackConversion = (
  conversionType: string,
  value?: number,
  currency?: string,
  properties?: Record<string, AnalyticsValue>
) => analytics.trackConversion(conversionType, value, currency, properties);

export const trackError = (error: Error | string, fatal?: boolean) =>
  analytics.trackError(error, fatal);

export default analytics;
