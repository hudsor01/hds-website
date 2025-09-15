/**
 * Unified Analytics Module
 * Integrates PostHog and custom analytics tracking
 */

import type {
  EventProperties,
  PageViewProperties,
  UserProperties,
  PostHogLike,
} from "@/types/analytics";
import { logger } from './logger';

class AnalyticsManager {
  private posthog: PostHogLike | null = null;
  private initialized = false;
  private queue: Array<() => void> = [];

  constructor() {
    if (typeof window !== "undefined") {
      this.initialize();
    }
  }

  private async initialize() {
    try {
      // PostHog initialization
      if (
        process.env.NEXT_PUBLIC_POSTHOG_KEY &&
        typeof window !== "undefined"
      ) {
        const posthogLib = await import("posthog-js");
        this.posthog = posthogLib.default;

        (this.posthog as PostHogLike).init(
          process.env.NEXT_PUBLIC_POSTHOG_KEY,
          {
            api_host:
              process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
            loaded: () => {
              this.initialized = true;
              this.processQueue();
            },
            autocapture: true,
            capture_pageview: true,
            capture_pageleave: true,
            disable_session_recording: false,
            persistence: "localStorage",
          }
        );
      }
    } catch (error) {
      logger.error("Failed to initialize analytics", {
        error,
        posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY ? 'present' : 'missing',
        host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'default',
        environment: process.env.NODE_ENV
      });
    }
  }

  private processQueue() {
    while (this.queue.length > 0) {
      const action = this.queue.shift();
      if (action) {action();}
    }
  }

  private executeOrQueue(action: () => void) {
    if (this.initialized) {
      action();
    } else {
      this.queue.push(action);
    }
  }

  /**
   * Track custom events
   */
  trackEvent(eventName: string, properties?: EventProperties) {
    this.executeOrQueue(() => {
      // PostHog tracking
      if (this.posthog) {
        this.posthog.capture(eventName, properties);
      }

      // Custom tracking for critical events
      if (eventName === "form_submission" || eventName === "lead_captured") {
        this.sendToBackend(eventName, properties);
      }

      // Structured logging for development and production
      logger.info('Analytics Event Tracked', {
        eventName,
        properties,
        analyticsProvider: 'PostHog',
        initialized: this.initialized,
        queueLength: this.queue.length
      });
    });
  }

  /**
   * Track page views
   */
  trackPageView(properties?: PageViewProperties) {
    this.executeOrQueue(() => {
      const pageData = {
        url: window.location.href,
        path: window.location.pathname,
        referrer: document.referrer,
        title: document.title,
        ...properties,
      };

      if (this.posthog) {
        this.posthog.capture("$pageview", pageData);
      }
    });
  }

  /**
   * Identify user
   */
  identify(userId: string, properties?: UserProperties) {
    this.executeOrQueue(() => {
      if (this.posthog) {
        this.posthog.identify(userId, properties);
      }
    });
  }

  /**
   * Track conversion events
   */
  trackConversion(
    conversionType: string,
    value?: number,
    properties?: EventProperties
  ) {
    const conversionData = {
      conversion_type: conversionType,
      conversion_value: value,
      ...properties,
    };

    this.trackEvent("conversion", conversionData);
  }

  /**
   * Track timing events (performance)
   */
  trackTiming(
    category: string,
    variable: string,
    time: number,
    label?: string
  ) {
    this.trackEvent("timing_complete", {
      timing_category: category,
      timing_variable: variable,
      timing_time: time,
      timing_label: label,
    });
  }

  /**
   * Track errors
   */
  trackError(error: Error | string, fatal = false) {
    const errorData = {
      error_message: typeof error === "string" ? error : error.message,
      error_stack: typeof error === "object" ? error.stack : undefined,
      error_fatal: fatal,
      page_url:
        typeof window !== "undefined" ? window.location.href : undefined,
    };

    this.trackEvent("error", errorData);
  }

  /**
   * Track form interactions
   */
  trackFormInteraction(formName: string, action: string, fieldName?: string) {
    this.trackEvent("form_interaction", {
      form_name: formName,
      form_action: action,
      field_name: fieldName,
    });
  }

  /**
   * Track CTA clicks
   */
  trackCTAClick(ctaName: string, location: string, destination?: string) {
    this.trackEvent("cta_click", {
      cta_name: ctaName,
      cta_location: location,
      cta_destination: destination,
    });
  }

  /**
   * Track scroll depth
   */
  trackScrollDepth(percentage: number) {
    this.trackEvent("scroll_depth", {
      depth_percentage: percentage,
      page_height:
        typeof document !== "undefined" ? document.body.scrollHeight : 0,
    });
  }

  /**
   * Track time on page
   */
  trackTimeOnPage(seconds: number) {
    this.trackEvent("time_on_page", {
      time_seconds: seconds,
      page_url:
        typeof window !== "undefined" ? window.location.href : undefined,
    });
  }

  /**
   * Send critical events to backend
   */
  private async sendToBackend(eventName: string, properties?: EventProperties) {
    try {
      await fetch("/api/analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event: eventName,
          properties,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      logger.error("Failed to send analytics to backend", {
        error,
        eventName,
        properties,
        endpoint: '/api/analytics'
      });
    }
  }

  /**
   * Reset user (logout)
   */
  reset() {
    if (this.posthog) {
      this.posthog.reset();
    }
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
