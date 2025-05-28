/**
 * Global Framer Motion Configuration
 * Professional animation system for Hudson Digital Solutions
 */

import type { Variants, Transition } from 'framer-motion'

// Animation Timing Constants
export const MOTION_TIMING = {
  fast: 0.2,
  normal: 0.4,
  slow: 0.6,
  verySlow: 0.8,
} as const

// Easing Curves - Professional and smooth
export const MOTION_EASING = {
  smooth: [0.25, 0.1, 0.25, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  sharp: [0.4, 0, 0.2, 1],
  ease: [0.4, 0, 0.6, 1],
} as const

// Base Transitions
export const baseTransition: Transition = {
  duration: MOTION_TIMING.normal,
  ease: MOTION_EASING.smooth,
}

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
}

export const slowTransition: Transition = {
  duration: MOTION_TIMING.slow,
  ease: MOTION_EASING.ease,
}

// Page Animation Variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      ...baseTransition,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: baseTransition,
  },
}

// Container Animation Variants
export const containerVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

// Fade In Variants
export const fadeInVariants: Variants = {
  initial: {
    opacity: 0,
    y: 30,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: baseTransition,
  },
}

// Slide In Variants - separate variants for each direction
export const slideInVariants = {
  left: {
    initial: {
      opacity: 0,
      x: -50,
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: baseTransition,
    },
  } as Variants,
  right: {
    initial: {
      opacity: 0,
      x: 50,
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: baseTransition,
    },
  } as Variants,
  up: {
    initial: {
      opacity: 0,
      y: 50,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: baseTransition,
    },
  } as Variants,
  down: {
    initial: {
      opacity: 0,
      y: -50,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: baseTransition,
    },
  } as Variants,
}

// Scale Animation Variants
export const scaleVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: springTransition,
  },
  hover: {
    scale: 1.05,
    transition: { duration: MOTION_TIMING.fast },
  },
  tap: {
    scale: 0.95,
  },
}

// Card Animation Variants
export const cardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 60,
    rotateX: 15,
  },
  animate: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      ...baseTransition,
      duration: MOTION_TIMING.slow,
    },
  },
  hover: {
    y: -8,
    rotateX: 5,
    transition: { duration: MOTION_TIMING.fast },
  },
}

// Hero Animation Variants
export const heroVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      ...slowTransition,
      staggerChildren: 0.2,
    },
  },
}

// Text Animation Variants
export const textVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: baseTransition,
  },
}

// Stagger Animation Variants
export const staggerVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

// Navigation Animation Variants
export const navVariants: Variants = {
  initial: {
    opacity: 0,
    y: -20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      ...baseTransition,
      staggerChildren: 0.05,
    },
  },
}

// Button Animation Variants
export const buttonVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: springTransition,
  },
  hover: {
    scale: 1.05,
    transition: { duration: MOTION_TIMING.fast },
  },
  tap: {
    scale: 0.95,
  },
}

// Form Animation Variants
export const formVariants: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      ...baseTransition,
      staggerChildren: 0.1,
    },
  },
}

// Modal Animation Variants
export const modalVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
    y: 50,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springTransition,
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: baseTransition,
  },
}

// Loading Animation Variants
export const loadingVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.5,
      repeat: Infinity,
      repeatType: 'reverse',
    },
  },
}

// Floating Animation for decorative elements
export const floatingVariants: Variants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

// Parallax-style variants
export const parallaxVariants: Variants = {
  initial: {
    y: 100,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: MOTION_TIMING.slow,
      ease: MOTION_EASING.ease,
    },
  },
}