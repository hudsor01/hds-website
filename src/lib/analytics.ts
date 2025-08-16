// Enhanced analytics and performance monitoring
import { trackEvent as posthogTrackEvent, trackConversionFunnel } from './posthog';
import { logger } from './logger';

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

declare global {
  interface Window {
    gtag: (...args: (string | number | boolean | object | null)[]) => void;
    dataLayer: (string | number | boolean | object | null)[];
    va?: {
      track: (event: string, properties?: Record<string, string | number | boolean | object | null>) => void;
    };
  }
}

// Google Analytics 4 Configuration
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Initialize Google Analytics
export function initGA() {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID || GA_MEASUREMENT_ID.startsWith('G-XXXXXXXXXX')) return;

  // Load gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(...args: (string | number | boolean | object | null)[]) {
    window.dataLayer.push(args);
  };

  // Configure GA
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_title: document.title,
    page_location: window.location.href,
    // Enhanced ecommerce for lead tracking
    send_page_view: true,
    // Privacy settings
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
}

// Track page views
export function trackPageView(url: string, title?: string) {
  if (typeof window === 'undefined' || !window.gtag || !GA_MEASUREMENT_ID) return;

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_title: title || document.title,
    page_location: url,
  });
}

// Track custom events across all platforms
export function trackEvent(action: string, category: string, label?: string, value?: number) {
  if (typeof window === 'undefined') return;

  // Google Analytics
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }

  // PostHog
  posthogTrackEvent(action, {
    category,
    label,
    value,
  });

  // Vercel Analytics
  if (window.va && typeof window.va.track === "function") {
    try {
      const vaData: Record<string, string | number | boolean | object | null> = { category };
      if (label) vaData.label = label;
      if (value) vaData.value = value;
      window.va.track(action, vaData);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        if (process.env.NODE_ENV === "development") {
          logger.debug("Vercel Analytics error", { error });
        }
      }
    }
  }
}

// Track conversions (form submissions, calls, etc.)
export function trackConversion(conversionType: 'form_submit' | 'phone_call' | 'email_click' | 'calendar_book', data?: Record<string, string | number | boolean | object | null>) {
  if (typeof window === 'undefined') return;

  const leadValue = getLeadValue(conversionType);

  // Google Analytics
  if (window.gtag) {
    window.gtag('event', 'conversion', {
      event_category: 'Lead Generation',
      event_label: conversionType,
      value: 1,
      custom_parameters: data,
    });

    // Also track as enhanced ecommerce event
    window.gtag('event', 'generate_lead', {
      currency: 'USD',
      value: leadValue,
      event_category: 'Lead Generation',
      event_label: conversionType,
    });
  }

  // PostHog conversion tracking
  trackConversionFunnel(conversionType, {
    ...data,
    lead_value: leadValue,
  });

  // Vercel Analytics
  if (window.va && typeof window.va.track === "function") {
    try {
      window.va.track("conversion", {
        type: conversionType,
        value: leadValue,
        ...data,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        if (process.env.NODE_ENV === "development") {
          logger.debug("Vercel Analytics error", { error });
        }
      }
    }
  }
}

// Get estimated lead value for different conversion types
function getLeadValue(conversionType: string): number {
  const leadValues = {
    'form_submit': 50,    // Contact form submission
    'phone_call': 100,    // Phone call click
    'email_click': 25,    // Email click
    'calendar_book': 200, // Calendar booking (highest intent)
  };
  return leadValues[conversionType as keyof typeof leadValues] || 25;
}

// Track user engagement
export function trackEngagement(action: string, element?: string) {
  trackEvent(action, 'Engagement', element);
}

// Track scroll depth
export function trackScrollDepth() {
  if (typeof window === 'undefined') return;

  const depths = [25, 50, 75, 90, 100];
  const trackedDepths = new Set<number>();

  function handleScroll() {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.scrollY / scrollHeight) * 100;

    depths.forEach(depth => {
      if (scrolled >= depth && !trackedDepths.has(depth)) {
        trackedDepths.add(depth);
        trackEvent('scroll_depth', 'Engagement', `${depth}%`, depth);
      }
    });
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
}

// Track time on page
export function trackTimeOnPage() {
  if (typeof window === 'undefined') return;

  const startTime = Date.now();
  const intervals = [30, 60, 120, 300]; // 30s, 1m, 2m, 5m
  const tracked = new Set<number>();

  const checkTime = () => {
    const timeOnPage = Math.floor((Date.now() - startTime) / 1000);
    
    intervals.forEach(interval => {
      if (timeOnPage >= interval && !tracked.has(interval)) {
        tracked.add(interval);
        trackEvent('time_on_page', 'Engagement', `${interval}s`, interval);
      }
    });
  };

  const timer = setInterval(checkTime, 5000); // Check every 5 seconds

  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    clearInterval(timer);
    const finalTime = Math.floor((Date.now() - startTime) / 1000);
    trackEvent('session_duration', 'Engagement', 'final', finalTime);
  });
}

// Web Vitals tracking
export function trackWebVitals() {
  if (typeof window === 'undefined') return;

  // Track Core Web Vitals
  if ('PerformanceObserver' in window) {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      const lcp = Math.round(lastEntry.startTime);
      
      trackEvent('web_vitals', 'Performance', 'LCP', lcp);
      
      // Send to GA4 as a custom metric
      window.gtag('event', 'web_vital', {
        metric_name: 'LCP',
        metric_value: lcp,
        metric_rating: lcp <= 2500 ? 'good' : lcp <= 4000 ? 'needs_improvement' : 'poor'
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        const eventEntry = entry as PerformanceEventTiming;
        const fid = Math.round(eventEntry.processingStart - eventEntry.startTime);
        
        trackEvent('web_vitals', 'Performance', 'FID', fid);
        
        window.gtag('event', 'web_vital', {
          metric_name: 'FID',
          metric_value: fid,
          metric_rating: fid <= 100 ? 'good' : fid <= 300 ? 'needs_improvement' : 'poor'
        });
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        const layoutEntry = entry as LayoutShift;
        if (!layoutEntry.hadRecentInput) {
          clsValue += layoutEntry.value;
        }
      });
      
      const cls = Math.round(clsValue * 1000) / 1000;
      
      trackEvent('web_vitals', 'Performance', 'CLS', cls);
      
      window.gtag('event', 'web_vital', {
        metric_name: 'CLS',
        metric_value: cls,
        metric_rating: cls <= 0.1 ? 'good' : cls <= 0.25 ? 'needs_improvement' : 'poor'
      });
    }).observe({ entryTypes: ['layout-shift'] });
  }

  // Track page load time
  window.addEventListener('load', () => {
    setTimeout(() => {
      const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = Math.round(navigationTiming.loadEventEnd - navigationTiming.fetchStart);
      
      trackEvent('page_load_time', 'Performance', 'load_complete', loadTime);
      
      window.gtag('event', 'page_timing', {
        metric_name: 'page_load_time',
        metric_value: loadTime,
        page_location: window.location.href
      });
    }, 0);
  });
}

// Track errors
export function trackError(error: Error, context?: string) {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'exception', {
    description: `${context ? context + ': ' : ''}${error.message}`,
    fatal: false,
    error_stack: error.stack,
    page_location: window.location.href
  });
}

// Track business metrics
export function trackBusinessMetric(metric: string, value: number, category = 'Business') {
  trackEvent(metric, category, undefined, value);
}

// Enhanced form tracking
export function trackFormInteraction(formName: string, action: 'start' | 'field_complete' | 'submit' | 'abandon', fieldName?: string) {
  const eventLabel = fieldName ? `${formName}_${fieldName}` : formName;
  trackEvent(`form_${action}`, 'Form Interaction', eventLabel);
  
  // Track form funnel
  if (action === 'submit') {
    trackConversion('form_submit', { form_name: formName });
  }
}

// Track external link clicks
export function trackExternalClick(url: string, linkText?: string) {
  trackEvent('external_click', 'Outbound Link', linkText || url);
}

// Track file downloads
export function trackDownload(fileName: string, fileType?: string) {
  trackEvent('file_download', 'Download', fileName);
  
  window.gtag('event', 'file_download', {
    file_name: fileName,
    file_type: fileType || fileName.split('.').pop(),
    page_location: window.location.href
  });
}

// Initialize all tracking
export function initializeAnalytics() {
  if (typeof window === 'undefined') return;

  initGA();
  trackScrollDepth();
  trackTimeOnPage();
  trackWebVitals();

  // Track initial page view
  trackPageView(window.location.href);

  // Set up error tracking
  window.addEventListener('error', (event) => {
    trackError(event.error, 'Global Error Handler');
  });

  window.addEventListener('unhandledrejection', (event) => {
    trackError(new Error(event.reason), 'Unhandled Promise Rejection');
  });
}

// Marketing attribution tracking
export function trackAttribution() {
  if (typeof window === 'undefined') return;

  const urlParams = new URLSearchParams(window.location.search);
  const utmParams = {
    source: urlParams.get('utm_source'),
    medium: urlParams.get('utm_medium'),
    campaign: urlParams.get('utm_campaign'),
    term: urlParams.get('utm_term'),
    content: urlParams.get('utm_content'),
  };

  // Store attribution data in localStorage for later conversion tracking
  if (Object.values(utmParams).some(param => param !== null)) {
    localStorage.setItem('attribution', JSON.stringify(utmParams));
    
    // Track the attributed session
    window.gtag('event', 'attributed_session', {
      source: utmParams.source,
      medium: utmParams.medium,
      campaign: utmParams.campaign,
    });
  }

  // Track referrer
  if (document.referrer) {
    const referrer = new URL(document.referrer);
    trackEvent('referrer', 'Attribution', referrer.hostname);
  }
}