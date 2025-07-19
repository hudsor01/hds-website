import posthog from 'posthog-js';

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
export const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture(eventName, properties);
  }
};

export const trackFormSubmission = (formName: string, success: boolean, data?: Record<string, unknown>) => {
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

export const trackSchedulingWidget = (action: 'opened' | 'booked' | 'closed', data?: Record<string, unknown>) => {
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

export const trackConversionFunnel = (step: string, data?: Record<string, unknown>) => {
  trackEvent('conversion_funnel', {
    step,
    ...data,
  });
};

// User identification
export const identifyUser = (userId: string, traits?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.identify(userId, traits);
  }
};

// Group identification (for B2B tracking)
export const identifyGroup = (groupType: string, groupKey: string, properties?: Record<string, unknown>) => {
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