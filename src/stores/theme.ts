import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface ThemeStore {
  theme: 'light' | 'dark'
  mounted: boolean
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
  setMounted: (mounted: boolean) => void
}

export const useThemeStore = create<ThemeStore>()(
  devtools(
    persist(
      (set, get) => ({
        theme: 'dark',
        mounted: false,
        
        toggleTheme: () => {
          const currentTheme = get().theme
          const newTheme = currentTheme === 'light' ? 'dark' : 'light'
          
          set({ theme: newTheme })
          
          // Apply theme to document
          if (typeof window !== 'undefined') {
            document.documentElement.classList.remove('light', 'dark')
            document.documentElement.classList.add(newTheme)
            
            // Smooth transition
            document.documentElement.style.transition = 'background-color 0.3s ease, color 0.3s ease'
          }
        },
        
        setTheme: (theme) => {
          set({ theme })
          
          // Apply theme to document
          if (typeof window !== 'undefined') {
            document.documentElement.classList.remove('light', 'dark')
            document.documentElement.classList.add(theme)
          }
        },
        
        setMounted: (mounted) => set({ mounted })
      }),
      {
        name: 'theme-storage',
        partialize: (state) => ({ theme: state.theme }),
      }
    ),
    {
      name: 'theme-store',
    }
  )
)