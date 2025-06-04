import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// Global UI State
export interface UIState {
  isLoading: boolean
  loadingMessage: string
  error: string | null
  setLoading: (loading: boolean, message?: string) => void
  setError: (error: string | null | undefined) => void
  clearError: () => void
}

export const useUIStore = create<UIState>()(
  devtools(
    set => ({
      isLoading: false,
      loadingMessage: '',
      error: null,
      setLoading: (loading: boolean, message = '') =>
        set({ isLoading: loading, loadingMessage: message }),
      setError: (error: string | null | undefined) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'ui-store',
    },
  ),
)
