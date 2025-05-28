import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// Analytics State
interface AnalyticsState {
  hasConsent: boolean
  pageViews: number
  sessionId: string | null
  setConsent: (_consent: boolean) => void
  incrementPageViews: () => void
  setSessionId: (_id: string) => void
}

export const useAnalyticsStore = create<AnalyticsState>()(
  devtools(
    persist(
      set => ({
        hasConsent: false,
        pageViews: 0,
        sessionId: null,
        setConsent: consent => set({ hasConsent: consent }),
        incrementPageViews: () =>
          set(state => ({ pageViews: state.pageViews + 1 })),
        setSessionId: id => set({ sessionId: id }),
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
