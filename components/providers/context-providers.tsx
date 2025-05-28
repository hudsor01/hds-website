'use client'

import React, { createContext, useContext, ReactNode } from 'react'

/**
 * Client-only context providers
 * These must be Client Components as React Context doesn't work in Server Components
 */

// Theme context
interface ThemeContextType {
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light')

  React.useEffect(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    
    setTheme(savedTheme || systemTheme)
  }, [])

  const value = React.useMemo(() => ({
    theme,
    setTheme: (newTheme: 'light' | 'dark') => {
      setTheme(newTheme)
      localStorage.setItem('theme', newTheme)
      document.documentElement.classList.toggle('dark', newTheme === 'dark')
    },
  }), [theme])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Analytics context
interface AnalyticsContextType {
  track: (event: string, properties?: Record<string, any>) => void
  identify: (userId: string, traits?: Record<string, any>) => void
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const track = React.useCallback((event: string, properties?: Record<string, any>) => {
    // Client-side analytics tracking
    if (typeof window !== 'undefined') {
      // Google Analytics
      if (window.gtag) {
        window.gtag('event', event, properties)
      }
      
      // PostHog
      if (window.posthog) {
        window.posthog.capture(event, properties)
      }
      
      console.log('Analytics event:', event, properties)
    }
  }, [])

  const identify = React.useCallback((userId: string, traits?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      if (window.posthog) {
        window.posthog.identify(userId, traits)
      }
      
      console.log('Analytics identify:', userId, traits)
    }
  }, [])

  const value = React.useMemo(() => ({
    track,
    identify,
  }), [track, identify])

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider')
  }
  return context
}

// User preferences context
interface UserPreferencesContextType {
  preferences: {
    language: string
    currency: string
    notifications: boolean
  }
  updatePreferences: (preferences: Partial<UserPreferencesContextType['preferences']>) => void
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined)

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = React.useState({
    language: 'en',
    currency: 'USD',
    notifications: true,
  })

  React.useEffect(() => {
    // Load preferences from localStorage
    const saved = localStorage.getItem('userPreferences')
    if (saved) {
      try {
        setPreferences(JSON.parse(saved))
      } catch (error) {
        console.error('Error parsing user preferences:', error)
      }
    }
  }, [])

  const updatePreferences = React.useCallback((newPreferences: Partial<typeof preferences>) => {
    setPreferences(prev => {
      const updated = { ...prev, ...newPreferences }
      localStorage.setItem('userPreferences', JSON.stringify(updated))
      return updated
    })
  }, [])

  const value = React.useMemo(() => ({
    preferences,
    updatePreferences,
  }), [preferences, updatePreferences])

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  )
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext)
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider')
  }
  return context
}