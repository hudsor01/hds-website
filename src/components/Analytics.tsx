"use client";
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { initializeAnalytics, trackPageView, trackAttribution } from '@/lib/analytics';
import { initializePostHog, trackPagePerformance, trackNetworkInfo } from '@/lib/posthog';

export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize all analytics services
    initializeAnalytics();
    initializePostHog();
    trackAttribution();
    
    // Track network information for performance insights
    trackNetworkInfo();
    
    // Track page performance metrics after load
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (perfData) {
            trackPagePerformance({
              loadTime: perfData.loadEventEnd - perfData.fetchStart,
              domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart,
              firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
              firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
            });
          }
        }, 1000);
      });
    }
  }, []);

  useEffect(() => {
    // Track page views on route change
    trackPageView(window.location.href);
  }, [pathname]);

  return (
    <>
      <VercelAnalytics />
    </>
  );
}