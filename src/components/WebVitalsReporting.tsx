"use client";
import { useReportWebVitals } from 'next/web-vitals';
import { trackWebVital } from '@/lib/posthog';

export default function WebVitalsReporting() {
  useReportWebVitals((metric) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(metric);
    }

    const roundedValue = Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value);

    // Send to Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', metric.name, {
        custom_map: { metric_id: 'custom_metric' },
        value: roundedValue,
        event_category: 'Web Vitals',
        event_label: metric.id,
        non_interaction: true,
      });
    }

    // Send to PostHog (enhanced with performance tracking)
    trackWebVital({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
      navigationType: metric.navigationType,
    });

    // Send to custom analytics endpoint
    sendToAnalytics(metric);
  });

  return null;
}

interface Metric {
  name: string;
  value: number;
  rating?: string;
  id: string;
  navigationType?: string;
}

function sendToAnalytics(metric: Metric) {
  const body = JSON.stringify(metric);
  
  // Use beacon API if available for better reliability
  if ('sendBeacon' in navigator) {
    navigator.sendBeacon('/api/analytics/web-vitals', body);
  } else {
    // Fallback to fetch
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      body,
      headers: {
        'Content-Type': 'application/json',
      },
      keepalive: true,
    }).catch((error) => {
      console.error('Failed to send analytics:', error);
    });
  }
}