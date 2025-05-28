/**
 * Animation Tokens
 *
 * Core animation tokens including basic animations, transitions,
 * hover effects, and cursor styles.
 */

export const transitions = {
  default: { duration: 0.3, ease: 'easeInOut' },
  fast: { duration: 0.2, ease: 'easeInOut' },
  slow: { duration: 0.5, ease: 'easeInOut' },
  spring: { type: 'spring', stiffness: 260, damping: 20 },
  smooth: { type: 'tween', ease: 'easeInOut', duration: 0.4 },
}

export const animations = {
  // Fade animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },

  // Scale animations
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },

  // Slide animations
  slideInRight: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 },
  },
  slideInLeft: {
    initial: { opacity: 0, x: -100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  },

  // Stagger children
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },

  // Spring animations
  springBounce: {
    initial: { scale: 0 },
    animate: {
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20,
      },
    },
  },
}

// Import required for hover animations
import { shadows } from './visual-tokens'

// Hover states
export const hover = {
  scale: { scale: 1.05, transition: transitions.spring },
  glow: { boxShadow: shadows.glow, transition: transitions.default },
  lift: { y: -5, boxShadow: shadows.xl, transition: transitions.default },
}

// Custom cursor animations
export const cursor = {
  default: { cursor: 'default' },
  pointer: { cursor: 'pointer' },
  grab: { cursor: 'grab' },
  grabbing: { cursor: 'grabbing' },
}
