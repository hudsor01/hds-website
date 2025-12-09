/**
 * Button Analytics Hook
 * Custom hook for button click tracking
 * Separates analytics logic from UI components
 */

import { useCallback } from 'react';
import { ButtonAnalyticsTracker, type ButtonAnalyticsOptions } from '../lib/button-analytics';

export interface UseButtonAnalyticsReturn {
  trackConversion: (
    options: ButtonAnalyticsOptions,
    children: React.ReactNode,
    variant?: string,
    size?: string
  ) => void;
  trackButtonClick: (label: string, properties?: Record<string, unknown>) => void;
}

export function useButtonAnalytics(): UseButtonAnalyticsReturn {
  const trackConversion = useCallback((
    options: ButtonAnalyticsOptions,
    children: React.ReactNode,
    variant?: string,
    size?: string
  ) => {
    ButtonAnalyticsTracker.trackConversion(options, children, variant, size);
  }, []);

  const trackButtonClick = useCallback((label: string, properties?: Record<string, unknown>) => {
    ButtonAnalyticsTracker.trackButtonClick(label, properties);
  }, []);

  return {
    trackConversion,
    trackButtonClick
  };
}
