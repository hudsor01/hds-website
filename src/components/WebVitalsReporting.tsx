/**
 * Web Vitals Reporting Component
 * Tracks and reports Core Web Vitals metrics
 */

'use client';

import { useReportWebVitals } from 'next/web-vitals';

interface PostHogClient {
  capture: (event: string, properties: Record<string, unknown>) => void;
}

declare global {
  interface Window {
    posthog?: PostHogClient;
  }
}

export function WebVitalsReporting() {
  useReportWebVitals((metric) => {
    // Send to analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_category: 'Web Vitals',
        event_label: metric.id,
        non_interaction: true,
      });
    }

    // Send to PostHog if available
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('web_vitals', {
        metric_name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
      });
    }

    // Store in database for admin dashboard
    storeWebVital(metric);

    // Log performance issues in development
    if (process.env.NODE_ENV === 'development') {
      const rating = metric.rating === 'poor' ? '🔴' : metric.rating === 'needs-improvement' ? '🟡' : '🟢';
      // eslint-disable-next-line no-console
      console.log(`${rating} ${metric.name}:`, metric.value, metric.rating);
    }
  });

  return null;
}

interface WebVitalMetric {
  name: string;
  value: number;
  rating: string;
  delta: number;
  id: string;
  navigationType?: string;
}

async function storeWebVital(metric: WebVitalMetric) {
  try {
    // Only store in production
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    await fetch('/api/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        navigation_type: metric.navigationType,
      }),
    });
  } catch (error) {
    // Silently fail - don't disrupt user experience
    console.error('Failed to store web vital:', error);
  }
}
