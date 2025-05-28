'use client'

/**
 * Re-export of the unified animation hooks
 *
 * This file exists to maintain backward compatibility with existing imports.
 * New code should import directly from hooks/use-animation-hooks.ts
 */

export {
  useScrollAnimation,
  useFramerScrollAnimation,
  useCounter,
  useParallax,
  useMousePosition,
  useDelayedAnimation,
  useViewportSize,
  useStaggerAnimation,
  useScrollLinkedAnimation,
} from './use-animation-hooks'
