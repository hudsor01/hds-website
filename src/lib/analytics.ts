/**
 * Unified Analytics Module
 * Simple analytics tracking with backend integration for critical events
 */

import type {
  EventProperties,
  PageViewProperties,
  UserProperties,
} from "@/types/analytics";
import { logger } from './logger';
import { env } from '@/env';

class AnalyticsManager {
  private initialized = false;
  private queue: Array<() => void> = [];

  constructor() {
    if (typeof window !== "undefined") {
      this.initialize();
    }
  }

  private initialize() {
    try {
      // Mark as initialized immediately for simple tracking
      this.initialized = true;
      this.processQueue();

      logger.info('Analytics initialized', {
        environment: env.NODE_ENV
      });
    } catch (error) {
      logger.error("Failed to initialize analytics", {
        error,
        environment: env.NODE_ENV
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
      // Custom tracking for critical events
      if (eventName === "form_submission" || eventName === "lead_captured") {
        this.sendToBackend(eventName, properties);
      }

      // Structured logging for development and production
      logger.info('Analytics Event Tracked', {
        eventName,
        properties,
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

      logger.info('Page view tracked', pageData);
    });
  }

  /**
   * Identify user
   */
  identify(userId: string, properties?: UserProperties) {
    this.executeOrQueue(() => {
      logger.info('User identified', {
        userId,
        properties
      });
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
    logger.info('Analytics reset');
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
