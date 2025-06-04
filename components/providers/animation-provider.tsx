'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import { LazyMotion, domAnimation } from 'framer-motion'

interface AnimationContextType {
  animationsEnabled: boolean
  animationSpeed: 'slow' | 'normal' | 'fast'
  reduceMotion: boolean
  enableAnimations: () => void
  disableAnimations: () => void
  setAnimationSpeed: (_speed: 'slow' | 'normal' | 'fast') => void
}

const AnimationContext = createContext<AnimationContextType>({
  animationsEnabled: true,
  animationSpeed: 'normal',
  reduceMotion: false,
  enableAnimations: () => {},
  disableAnimations: () => {},
  setAnimationSpeed: () => {},
})

/**
 * Animation Provider for global animation settings
 *
 * This provider manages global animation settings and preferences,
 * including reduced motion support and animation speed adjustments.
 */
export function AnimationProvider({ children }: { children: ReactNode }) {
  // Animation state
  const [animationsEnabled, setAnimationsEnabled] = useState(true)
  const [animationSpeed, setAnimationSpeed] = useState<
    'slow' | 'normal' | 'fast'
  >('normal')
  const [reduceMotion, setReduceMotion] = useState(false)

  // Check for prefers-reduced-motion on mount
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mediaQuery.matches)

    // Listen for changes to the prefers-reduced-motion media query
    const handleChange = (e: MediaQueryListEvent) => {
      setReduceMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Disable animations when reduceMotion is true
  useEffect(() => {
    if (reduceMotion) {
      setAnimationsEnabled(false)
    }
  }, [reduceMotion])

  // Functions to control animations
  const enableAnimations = () => {
    if (!reduceMotion) {
      setAnimationsEnabled(true)
    }
  }

  const disableAnimations = () => {
    setAnimationsEnabled(false)
  }

  const handleSetAnimationSpeed = (speed: 'slow' | 'normal' | 'fast') => {
    setAnimationSpeed(speed)
  }

  const value = {
    animationsEnabled,
    animationSpeed,
    reduceMotion,
    enableAnimations,
    disableAnimations,
    setAnimationSpeed: handleSetAnimationSpeed,
  }

  return (
    <LazyMotion features={domAnimation} strict>
      <AnimationContext.Provider value={value}>
        {children}
      </AnimationContext.Provider>
    </LazyMotion>
  )
}

/**
 * Custom hook to access animation settings
 */
export function useAnimation() {
  const context = useContext(AnimationContext)

  if (context === undefined) {
    throw new Error('useAnimation must be used within an AnimationProvider')
  }

  return context
}

/**
 * Helper hook to get animation speed factor
 *
 * Returns a multiplier based on the current animation speed setting:
 * - slow: 1.5x (50% slower)
 * - normal: 1x (default)
 * - fast: 0.67x (33% faster)
 */
export function useAnimationSpeed() {
  const { animationSpeed } = useAnimation()

  switch (animationSpeed) {
    case 'slow':
      return 1.5
    case 'fast':
      return 0.67
    default:
      return 1
  }
}
