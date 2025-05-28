import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// Global UI State
interface UIState {
  isLoading: boolean
  loadingMessage: string
  error: string | null
  setLoading: (_loading: boolean, _message?: string) => void
  setError: (_error: string | null) => void
  clearError: () => void
}

export const useUIStore = create<UIState>()(
  devtools(
    set => ({
      isLoading: false,
      loadingMessage: '',
      error: null,
      setLoading: (loading, message = '') =>
        set({ isLoading: loading, loadingMessage: message }),
      setError: error => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'ui-store',
    },
  ),
)
