/**
 * Unified Analytics Module
 * Lightweight analytics tracking using Supabase only
 * No external dependencies - optimized for performance
 */

import type {
  EventProperties,
  PageViewProperties,
  UserProperties,
} from "@/types/analytics";
import {
  postHogEventSchema,
  conversionDataSchema,
  pageViewPropertiesSchema,
  userPropertiesSchema,
} from '@/lib/schemas';

/**
 * Analytics Manager - Lightweight, non-blocking analytics
 * Only tracks critical events to Supabase
 * Sampling strategy: 10% of non-critical events
 */
class AnalyticsManager {
  private initialized = false;
  private samplingRate = 0.1; // 10% sampling for non-critical events

  constructor() {
    if (typeof window !== "undefined") {
      this.initialized = true;
    }
  }

  /**
   * Determine if event should be sampled
   */
  private shouldSample(eventName: string): boolean {
    // Always track critical events
    const criticalEvents = [
      'form_submission',
      'lead_captured',
      'conversion',
      'error',
      'purchase',
      'sign_up'
    ];

    if (criticalEvents.includes(eventName)) {
      return true;
    }

    // Sample non-critical events at 10% rate
    return Math.random() < this.samplingRate;
  }

  /**
   * Track custom events (non-blocking)
   */
  trackEvent(eventName: string, properties?: EventProperties) {
    // Skip if not initialized or shouldn't sample
    if (!this.initialized || !this.shouldSample(eventName)) {
      return;
    }

    // Validate event data
    const validation = postHogEventSchema.safeParse({
      event: eventName,
      properties,
    });

    if (!validation.success) {
      // Silent fail for invalid events (don't spam logs)
      return;
    }

    // Fire-and-forget to backend (non-blocking)
    if (eventName === "form_submission" || eventName === "lead_captured" || eventName === "conversion") {
      this.sendToBackend(eventName, properties).catch(() => {
        // Silent fail - don't block user experience
      });
    }
  }

  /**
   * Track page views (non-blocking, sampled)
   */
  trackPageView(properties?: PageViewProperties) {
    if (!this.initialized || !this.shouldSample('pageview')) {
      return;
    }

    // Validate page view properties
    if (properties) {
      const validation = pageViewPropertiesSchema.safeParse(properties);
      if (!validation.success) {
        return; // Silent fail
      }
    }

    // Fire-and-forget (non-blocking)
    const pageData = {
      url: window.location.href,
      path: window.location.pathname,
      referrer: document.referrer,
      title: document.title,
      ...properties,
    };

    this.sendToBackend('pageview', pageData).catch(() => {});
  }

  /**
   * Identify user (always tracked, non-blocking)
   */
  identify(userId: string, properties?: UserProperties) {
    if (!this.initialized) {
      return;
    }

    // Validate user properties
    if (properties) {
      const validation = userPropertiesSchema.safeParse(properties);
      if (!validation.success) {
        return; // Silent fail
      }
    }

    // Fire-and-forget (non-blocking)
    this.sendToBackend('user_identified', {
      user_id: userId,
      ...properties,
    }).catch(() => {});
  }

  /**
   * Track conversion events (always tracked, non-blocking)
   */
  trackConversion(
    conversionType: string,
    value?: number,
    properties?: EventProperties
  ) {
    if (!this.initialized) {
      return;
    }

    // Validate conversion data
    const validation = conversionDataSchema.safeParse({
      event: conversionType,
      value,
    });

    if (!validation.success) {
      return; // Silent fail
    }

    const conversionData = {
      conversion_type: conversionType,
      conversion_value: value,
      ...properties,
    };

    this.trackEvent("conversion", conversionData);
  }

  /**
   * Track timing events (sampled)
   */
  trackTiming(
    category: string,
    variable: string,
    time: number,
    label?: string
  ) {
    // Basic validation
    if (!category || !variable || time < 0) {
      return;
    }

    this.trackEvent("timing_complete", {
      timing_category: category,
      timing_variable: variable,
      timing_time: time,
      timing_label: label,
    });
  }

  /**
   * Track errors (always tracked, non-blocking)
   */
  trackError(error: Error | string, fatal = false) {
    if (!this.initialized) {
      return;
    }

    const errorData = {
      error_message: typeof error === "string" ? error : error.message,
      error_stack: typeof error === "object" ? error.stack : undefined,
      error_fatal: fatal,
      page_url: typeof window !== "undefined" ? window.location.href : undefined,
    };

    // Fire-and-forget (non-blocking)
    this.sendToBackend("error", errorData).catch(() => {});
  }

  /**
   * Track form interactions (sampled)
   */
  trackFormInteraction(formName: string, action: string, fieldName?: string) {
    this.trackEvent("form_interaction", {
      form_name: formName,
      form_action: action,
      field_name: fieldName,
    });
  }

  /**
   * Track CTA clicks (sampled)
   */
  trackCTAClick(ctaName: string, location: string, destination?: string) {
    this.trackEvent("cta_click", {
      cta_name: ctaName,
      cta_location: location,
      cta_destination: destination,
    });
  }

  /**
   * Track scroll depth (sampled)
   */
  trackScrollDepth(percentage: number) {
    // Basic validation
    if (percentage < 0 || percentage > 100) {
      return;
    }

    this.trackEvent("scroll_depth", {
      depth_percentage: percentage,
      page_height: typeof document !== "undefined" ? document.body.scrollHeight : 0,
    });
  }

  /**
   * Track time on page (sampled)
   */
  trackTimeOnPage(seconds: number) {
    // Basic validation
    if (seconds < 0) {
      return;
    }

    this.trackEvent("time_on_page", {
      time_seconds: seconds,
      page_url: typeof window !== "undefined" ? window.location.href : undefined,
    });
  }

  /**
   * Send critical events to backend (non-blocking, fire-and-forget)
   */
  private async sendToBackend(eventName: string, properties?: EventProperties): Promise<void> {
    const payload = {
      event: eventName,
      properties,
      timestamp: new Date().toISOString(),
    };

    // Validate backend analytics payload
    const validation = postHogEventSchema.safeParse(payload);

    if (!validation.success) {
      return; // Silent fail
    }

    // Fire-and-forget fetch (no await in caller)
    fetch("/api/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      // Use keepalive to ensure request completes even if page unloads
      keepalive: true,
    }).catch(() => {
      // Silent fail - don't throw errors or log
    });
  }

  /**
   * Reset user (no-op since we removed PostHog)
   */
  reset() {
    // No-op: Kept for backwards compatibility
  }
}

// Create singleton instance
const analytics = new AnalyticsManager();

// Export convenience functions
export const trackEvent = (eventName: string, properties?: EventProperties) =>
  analytics.trackEvent(eventName, properties);

export const trackPageView = (properties?: PageViewProperties) =>
  analytics.trackPageView(properties);

export const identify = (userId: string, properties?: UserProperties) =>
  analytics.identify(userId, properties);

export const trackConversion = (
  conversionType: string,
  value?: number,
  properties?: EventProperties
) => analytics.trackConversion(conversionType, value, properties);

export const trackTiming = (
  category: string,
  variable: string,
  time: number,
  label?: string
) => analytics.trackTiming(category, variable, time, label);

export const trackError = (error: Error | string, fatal = false) =>
  analytics.trackError(error, fatal);

export const trackFormInteraction = (
  formName: string,
  action: string,
  fieldName?: string
) => analytics.trackFormInteraction(formName, action, fieldName);

export const trackCTAClick = (
  ctaName: string,
  location: string,
  destination?: string
) => analytics.trackCTAClick(ctaName, location, destination);

export const trackScrollDepth = (percentage: number) =>
  analytics.trackScrollDepth(percentage);

export const trackTimeOnPage = (seconds: number) =>
  analytics.trackTimeOnPage(seconds);

export const resetAnalytics = () => analytics.reset();

export default analytics;
