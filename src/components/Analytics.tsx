"use client";
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { initializeAnalytics, trackPageView, trackAttribution } from '@/lib/analytics';
import { initializePostHog } from '@/lib/posthog';

export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize all analytics services
    initializeAnalytics();
    initializePostHog();
    trackAttribution();
  }, []);

  useEffect(() => {
    // Track page views on route change
    trackPageView(window.location.href);
  }, [pathname]);

  return (
    <>
      <VercelAnalytics />
      <SpeedInsights />
    </>
  );
}