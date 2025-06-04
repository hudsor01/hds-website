'use client'

import React, { createContext, useContext, type ReactNode } from 'react'
import type { AnalyticsEvent } from '@/types/analytics-types'

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
const [themeState, setThemeState] = React.useState<'light' | 'dark'>('light')

  React.useEffect(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    
    setThemeState(savedTheme || systemTheme)
  }, [])

  const value = React.useMemo(() => ({
  theme: themeState,
    setTheme: (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme)
      localStorage.setItem('theme', newTheme)
      document.documentElement.classList.toggle('dark', newTheme === 'dark')
    },
  }), [themeState])

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
  track: (event: string, properties?: AnalyticsEvent) => void
  identify: (userId: string, traits?: AnalyticsEvent) => void
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const track = React.useCallback((eventName: string, eventProperties?: AnalyticsEvent) => {
    // Client-side analytics tracking
    if (typeof window !== 'undefined') {
      // Google Analytics
      if (window.gtag) {
        window.gtag('event', eventName, eventProperties)
      }
      
      // PostHog
      if (window.posthog) {
        window.posthog.capture(eventName, eventProperties)
      }
      
      console.log('Analytics event:', eventName, eventProperties)
    }
  }, [])

  const identify = React.useCallback((userIdParam: string, userTraits?: AnalyticsEvent) => {
    if (typeof window !== 'undefined') {
      if (window.posthog) {
        window.posthog.identify(userIdParam, userTraits)
      }
      
      console.log('Analytics identify:', userIdParam, userTraits)
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
const [userPreferences, setUserPreferences] = React.useState({
language: 'en',
currency: 'USD',
notifications: true,
})

  React.useEffect(() => {
    // Load preferences from localStorage
    const saved = localStorage.getItem('userPreferences')
    if (saved) {
      try {
        setUserPreferences(JSON.parse(saved))
      } catch (error) {
        console.error('Error parsing user preferences:', error)
      }
    }
  }, [])

  const updatePreferences = React.useCallback((newPreferences: Partial<typeof userPreferences>) => {
  setUserPreferences(prev => {
      const updated = { ...prev, ...newPreferences }
      localStorage.setItem('userPreferences', JSON.stringify(updated))
      return updated
    })
  }, [])

  const value = React.useMemo(() => ({
  preferences: userPreferences,
    updatePreferences,
  }), [userPreferences, updatePreferences])

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