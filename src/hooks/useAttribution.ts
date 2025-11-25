/**
 * Attribution Tracking Hook
 * Automatically captures and tracks lead attribution data
 */

import { useState } from 'react';
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
  const [attribution] = useState<LeadAttributionData | null>(() => captureAttribution());

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
    isLoading: false,
    utmParams: attribution?.utm_params || {},
    sendAttribution,
  };
}

/**
 * Hook for getting stored attribution (first-touch)
 */
export function useStoredAttribution(): LeadAttributionData | null {
  const [attribution] = useState<LeadAttributionData | null>(() => getStoredAttribution());

  return attribution;
}
