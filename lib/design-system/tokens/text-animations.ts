/**
 * Text Animation Tokens
 *
 * Specific animation configurations for text elements
 * and container variants for text-based components.
 */

import { transitions } from './animation-tokens'

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
