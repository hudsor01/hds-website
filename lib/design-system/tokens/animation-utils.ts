/**
 * Animation Utilities
 *
 * Helper functions and accessibility-focused animation configurations
 * to support the main animation system.
 */

import type { Variants } from 'framer-motion'

// Helper functions for animation
export const withDelay = (animation: Variants, delay: number): Variants => ({
  ...animation,
  animate: {
    ...(typeof animation.animate === 'object' ? animation.animate : {}),
    transition: {
      ...(typeof animation.animate === 'object' && animation.animate && 'transition' in animation.animate 
        ? animation.animate.transition as Record<string, unknown> 
        : {}),
      delay,
    },
  },
})

/**
 * Animation settings for reduced motion preferences
 * This provides a simplified animation for users with reduced motion preferences
 */
export const reducedMotionAnimations = {
  fadeOnly: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
  },
}
