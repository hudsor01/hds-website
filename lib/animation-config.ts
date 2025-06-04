/**
 * Unified Animation Configuration
 *
 * This file centralizes all animation definitions and configurations used across the application.
 * It extends the basic animations from design-system.ts with more complex patterns and sequences.
 */

import type { Variants } from 'framer-motion'
import { animations, transitions, hover } from './design-system'

// Re-export animations from design-system for backward compatibility
export { animations, transitions, hover }

// Text-specific animation variants
export const textAnimations = {
  heading: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        ...transitions.smooth,
        duration: 0.6,
      },
    },
  },
  paragraph: {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        ...transitions.smooth,
        duration: 0.4,
        delay: 0.15,
      },
    },
  },
  highlight: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        ...transitions.spring,
      },
    },
  },
}

// Stagger configurations for lists and grids
export const staggerConfigs = {
  fast: 0.05,
  default: 0.1,
  slow: 0.2,
}

// Container variants for staggered children
export const containerVariants = {
  // Default stagger container
  stagger: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: staggerConfigs.default,
      },
    },
  },

  // Fast stagger container
  fastStagger: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: staggerConfigs.fast,
      },
    },
  },

  // Slow stagger container
  slowStagger: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: staggerConfigs.slow,
      },
    },
  },

  // Delayed container (waits for parent animations)
  delayed: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: staggerConfigs.default,
      },
    },
  },
}

// Variants for floating elements
export const floatingAnimations = {
  slow: {
    y: [0, -10, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut',
    },
  },
  medium: {
    y: [0, -15, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut',
    },
  },
  fast: {
    y: [0, -8, 0],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut',
    },
  },
  subtle: {
    y: [0, -5, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut',
    },
  },
}

// Card animations
export const cardAnimations = {
  hover: {
    scale: 1.03,
    y: -5,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 20,
    },
  },
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
}

// Gradient background animations
export const gradientAnimations = {
  subtle: {
    backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: 'linear',
    },
  },
  medium: {
    backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
    transition: {
      duration: 10,
      repeat: Infinity,
      ease: 'linear',
    },
  },
  mouseBased: (mouseX: number, mouseY: number) => ({
    backgroundPosition: `${mouseX}% ${mouseY}%`,
    transition: {
      type: 'spring',
      stiffness: 50,
      damping: 30,
    },
  }),
}

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
