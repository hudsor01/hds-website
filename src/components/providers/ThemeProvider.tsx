'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/stores/theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme, setMounted } = useThemeStore()

  useEffect(() => {
    // Only run on client
    setMounted(true)
    
    // Check localStorage or system preference
    const savedTheme = localStorage.getItem('theme-storage')
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme)
        if (parsed.state?.theme) {
          setTheme(parsed.state.theme)
        }
      } catch (error) {
        console.warn('Error parsing theme from localStorage:', error)
      }
    } else {
      // Fall back to system preference
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      setTheme(systemPreference)
    }
  }, [setTheme, setMounted])

  useEffect(() => {
    // Apply theme to document whenever theme changes
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(theme)
    }
  }, [theme])

  return <>{children}</>
}