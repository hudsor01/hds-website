'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAnalyticsStore } from '@/lib/store/analytics-store';
import { api } from '@/lib/trpc/client';

import type {
  UsePageAnalyticsOptions,
  TrackEventOptions,
} from '@/types/analytics-types';

/**
 * Analytics hook for tracking page views and user interaction
 *
 * This hook provides client-side analytics tracking including:
 * - Page views
 * - Time on page
 * - Screen size
 *
 * It uses tRPC to securely send analytics data to the server.
 */
export function usePageAnalytics(options?: UsePageAnalyticsOptions) {
  const pathname = usePathname();
  const { incrementPageViews } = useAnalyticsStore();
  const trackPageView = api.analytics.trackPageView.useMutation();
  const trackEvent = api.analytics.trackEvent.useMutation();

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Track page view
    if (options?.trackPageView !== false) {
      // Update local store for immediate UI feedback
      incrementPageViews();

      // Send to server via tRPC
      trackPageView.mutate({
        url: window.location.href,
        title: document.title,
        path: pathname,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        clientTime: Date.now(),
        screenSize: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      });
    }

    // Track time on page
    if (options?.trackTime) {
      const startTime = Date.now();

      return () => {
        const timeOnPage = Date.now() - startTime;

        // Track time spent on page as an event
        trackEvent.mutate({
          name: 'page_exit',
          category: 'engagement',
          action: 'time_on_page',
          label: pathname,
          value: timeOnPage,
          page: pathname,
          data: {
            timeMs: timeOnPage,
            timeSeconds: Math.round(timeOnPage / 1000),
          },
        });
      };
    }
  }, [
    pathname,
    trackPageView,
    trackEvent,
    incrementPageViews,
    options?.trackPageView,
    options?.trackTime,
  ]);

  // Add a convenience function to track events
  const trackCustomEvent = (eventData: TrackEventOptions) => {
    if (options?.trackEvents === false) return;

    trackEvent.mutate({
      ...eventData,
      page: pathname,
      clientTime: Date.now(),
    });
  };

  // Return the track event function for component use
  return {
    trackEvent: trackCustomEvent,
  };
}
