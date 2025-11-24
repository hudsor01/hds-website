/**
 * Attribution Tracking Hook
 * Automatically captures and tracks lead attribution data
 */

import { useEffect, useState } from 'react';
import {
  captureAttribution,
  getStoredAttribution,
  getAttributionForSubmission,
} from '@/lib/attribution';
import type { UTMParameters, LeadAttributionData } from '@/types/analytics';

export interface UseAttributionReturn {
  attribution: LeadAttributionData | null;
  isLoading: boolean;
  utmParams: UTMParameters;
  sendAttribution: (email?: string) => Promise<void>;
}

/**
 * Hook for managing lead attribution
 * Captures UTM parameters, referrer, and device information
 */
export function useAttribution(): UseAttributionReturn {
  const [attribution, setAttribution] = useState<LeadAttributionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Capture attribution on mount
    const captured = captureAttribution();
    setAttribution(captured);
    setIsLoading(false);
  }, []);

  /**
   * Send attribution data to backend
   */
  const sendAttribution = async (email?: string) => {
    const attributionData = getAttributionForSubmission();

    if (email) {
      attributionData.email = email;
    }

    try {
      const response = await fetch('/api/analytics/attribution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attributionData),
      });

      if (!response.ok) {
        console.warn('Failed to send attribution data');
      }
    } catch (error) {
      console.warn('Error sending attribution:', error);
    }
  };

  return {
    attribution,
    isLoading,
    utmParams: attribution?.utm_params || {},
    sendAttribution,
  };
}

/**
 * Hook for getting stored attribution (first-touch)
 */
export function useStoredAttribution(): LeadAttributionData | null {
  const [attribution, setAttribution] = useState<LeadAttributionData | null>(null);

  useEffect(() => {
    const stored = getStoredAttribution();
    setAttribution(stored);
  }, []);

  return attribution;
}
