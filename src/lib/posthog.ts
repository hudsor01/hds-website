import posthog from 'posthog-js';
import type { 
  AnalyticsProperties, 
  WebVitalMetric,
  UserTraits,
  GroupProperties
} from '@/types/analytics';

let posthogInitialized = false;

export function initializePostHog() {
  if (typeof window === 'undefined' || posthogInitialized) return;

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

  if (!apiKey) {
    console.warn('PostHog API key not found');
    return;
  }

  posthog.init(apiKey, {
    api_host: host,
    // Capture configuration
    capture_pageview: true,
    capture_pageleave: true,
    cross_subdomain_cookie: false,
    persistence: 'localStorage+cookie',
    
    // Privacy and GDPR compliance
    respect_dnt: true,
    opt_out_capturing_by_default: false,
    
    // Performance optimization
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') {
        posthog.debug(true);
      }
    },
    
    // Autocapture configuration
    autocapture: {
      dom_event_allowlist: ['click', 'change', 'submit'],
      url_allowlist: ['hudsondigitalsolutions.com'],
      element_allowlist: ['button', 'form', 'input', 'select', 'textarea', 'label'],
    },
    
    // Session replay (optional)
    session_recording: {
      maskAllInputs: true,
    },
    
    // Feature flags
    bootstrap: {
      featureFlags: {},
    },
  });

  posthogInitialized = true;
}

// Event tracking functions
export const trackEvent = (eventName: string, properties?: AnalyticsProperties) => {
  if (typeof window !== 'undefined' && posthog && posthogInitialized) {
    try {
      posthog.capture(eventName, properties);
    } catch (error) {
      console.warn('PostHog tracking error:', error);
    }
  }
};

// Performance and Web Vitals tracking (replacing Speed Insights)
export const trackWebVital = (metric: WebVitalMetric) => {
  trackEvent('web_vitals', {
    metric_name: metric.name,
    metric_value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    metric_rating: metric.rating,
    metric_id: metric.id,
    navigation_type: metric.navigationType,
    timestamp: Date.now(),
  });
};

export const trackPagePerformance = (data: {
  loadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  firstInputDelay?: number;
}) => {
  trackEvent('page_performance', {
    load_time: data.loadTime,
    dom_content_loaded: data.domContentLoaded,
    first_paint: data.firstPaint,
    first_contentful_paint: data.firstContentfulPaint,
    largest_contentful_paint: data.largestContentfulPaint,
    cumulative_layout_shift: data.cumulativeLayoutShift,
    first_input_delay: data.firstInputDelay,
    timestamp: Date.now(),
  });
};

export const trackUserTiming = (name: string, duration: number, startTime: number) => {
  trackEvent('user_timing', {
    timing_name: name,
    duration,
    start_time: startTime,
    timestamp: Date.now(),
  });
};

export const trackNetworkInfo = () => {
  if (typeof window !== 'undefined' && 'navigator' in window && 'connection' in navigator) {
    const connection = (navigator as unknown as { connection: { effectiveType?: string; downlink?: number; rtt?: number; saveData?: boolean } }).connection;
    if (connection) {
      trackEvent('network_info', {
        effective_type: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        save_data: connection.saveData,
        timestamp: Date.now(),
      });
    }
  }
};

export const trackFormSubmission = (formName: string, success: boolean, data?: AnalyticsProperties) => {
  trackEvent('form_submitted', {
    form_name: formName,
    success,
    ...data,
  });
};

export const trackButtonClick = (buttonName: string, location: string) => {
  trackEvent('button_clicked', {
    button_name: buttonName,
    location,
  });
};

export const trackDownload = (fileName: string, fileType: string) => {
  trackEvent('file_downloaded', {
    file_name: fileName,
    file_type: fileType,
  });
};

export const trackEmailClick = (email: string, context: string) => {
  trackEvent('email_clicked', {
    email,
    context,
  });
};

export const trackPhoneClick = (phone: string, context: string) => {
  trackEvent('phone_clicked', {
    phone,
    context,
  });
};

export const trackSchedulingWidget = (action: 'opened' | 'booked' | 'closed', data?: AnalyticsProperties) => {
  trackEvent('scheduling_widget', {
    action,
    ...data,
  });
};

export const trackBlogEngagement = (action: 'read' | 'share' | 'comment', postTitle: string, readTime?: number) => {
  trackEvent('blog_engagement', {
    action,
    post_title: postTitle,
    read_time: readTime,
  });
};

export const trackServicePageView = (serviceName: string, source?: string) => {
  trackEvent('service_page_viewed', {
    service_name: serviceName,
    source,
  });
};

export const trackConversionFunnel = (step: string, data?: AnalyticsProperties) => {
  trackEvent('conversion_funnel', {
    step,
    ...data,
  });
};

// User identification
export const identifyUser = (userId: string, traits?: UserTraits) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.identify(userId, traits);
  }
};

// Group identification (for B2B tracking)
export const identifyGroup = (groupType: string, groupKey: string, properties?: GroupProperties) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.group(groupType, groupKey, properties);
  }
};

// Feature flag functions
export const getFeatureFlag = (flagKey: string): boolean | string => {
  if (typeof window !== 'undefined' && posthog) {
    return posthog.getFeatureFlag(flagKey) || false;
  }
  return false;
};

export const isFeatureEnabled = (flagKey: string): boolean => {
  if (typeof window !== 'undefined' && posthog) {
    return Boolean(posthog.isFeatureEnabled(flagKey));
  }
  return false;
};

// A/B testing
export const getActiveExperiments = (): Record<string, string | boolean> => {
  if (typeof window !== 'undefined' && posthog) {
    // Return feature flags if available, otherwise return empty object
    return {};
  }
  return {};
};

// Reset user (for logout)
export const resetUser = () => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.reset();
  }
};

// GDPR compliance
export const optOut = () => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.opt_out_capturing();
  }
};

export const optIn = () => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.opt_in_capturing();
  }
};

export const hasOptedOut = (): boolean => {
  if (typeof window !== 'undefined' && posthog) {
    return posthog.has_opted_out_capturing();
  }
  return false;
};

// Session replay control
export const startSessionRecording = () => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.startSessionRecording();
  }
};

export const stopSessionRecording = () => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.stopSessionRecording();
  }
};

export default posthog;