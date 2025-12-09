import { create } from 'zustand';
import type { UTMParameters, LeadAttributionData } from '@/types/analytics';
import { captureAttribution, getStoredAttribution, getAttributionForSubmission } from '@/lib/attribution';
import { logger } from '@/lib/logger';

interface AnalyticsState {
  // Attribution
  attribution: LeadAttributionData | null;
  storedAttribution: LeadAttributionData | null;
  utmParams: UTMParameters;
  isLoading: boolean;

  // Actions
  captureAttribution: () => void;
  sendAttribution: (email?: string) => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set, _get) => ({
  attribution: null,
  storedAttribution: null,
  utmParams: {},
  isLoading: false,

  captureAttribution: () => {
    const attribution = captureAttribution();
    const stored = getStoredAttribution();
    set({
      attribution,
      storedAttribution: stored,
      utmParams: attribution?.utm_params || {}
    });
  },

  sendAttribution: async (email?: string) => {
    const attributionData = getAttributionForSubmission();
    if (email) {
      attributionData.email = email;
    }

    try {
      set({ isLoading: true });
      const response = await fetch('/api/analytics/attribution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attributionData),
      });

      if (!response.ok) {
        logger.warn('Failed to send attribution data');
      }
    } catch (error) {
      logger.error('Error sending attribution:', error as Error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
