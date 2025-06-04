import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { AnalyticsStore } from '@/types/analytics-types'

export const useAnalyticsStore = create<AnalyticsStore>()(
  devtools(
    persist(
      (set) => ({
        hasConsent: false,
        sessionId: null,
        setConsent: (newConsent) => {
          set({ hasConsent: newConsent })
        },
        setSessionId: (newSessionId) => {
          set({ sessionId: newSessionId })
        },
        reset: () => {
          set({
            hasConsent: false,
            sessionId: null,
          })
        },
      }),
      {
        name: 'analytics-store',
      },
    ),
    {
      name: 'analytics-store',
    },
  ),
)