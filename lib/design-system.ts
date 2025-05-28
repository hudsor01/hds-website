// Design System for Hudson Digital Solutions
// This file contains all design tokens, animations, and motion configurations

export const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  accent: {
    blue: '#3b82f6',
    purple: '#8b5cf6',
    teal: '#14b8a6',
    pink: '#ec4899',
  },
}

export const spacing = {
  xs: '0.5rem',
  sm: '1rem',
  md: '1.5rem',
  lg: '2rem',
  xl: '3rem',
  '2xl': '4rem',
  '3xl': '6rem',
}

export const typography = {
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
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

// Card-specific animations
export const cardAnimations = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  tap: { scale: 0.98 },
}

// Text-specific animations
export const textAnimations = {
  heading: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
  paragraph: {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  },
  highlight: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  },
}

// Floating element animations
export const floatingAnimations = {
  gentle: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  medium: {
    y: [-20, 20, -20],
    x: [-5, 5, -5],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  active: {
    y: [-30, 30, -30],
    x: [-10, 10, -10],
    rotate: [-5, 5, -5],
    transition: {
      duration: 10,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

export const transitions = {
  default: { duration: 0.3, ease: 'easeInOut' },
  fast: { duration: 0.2, ease: 'easeInOut' },
  slow: { duration: 0.5, ease: 'easeInOut' },
  spring: { type: 'spring', stiffness: 260, damping: 20 },
  smooth: { type: 'tween', ease: 'easeInOut', duration: 0.4 },
}

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  glow: '0 0 20px rgba(59, 130, 246, 0.5)',
}

export const gradients = {
  primary: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  secondary: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  dark: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
  mesh: `
    radial-gradient(at 40% 20%, rgba(59, 130, 246, 0.1) 0px, transparent 50%),
    radial-gradient(at 80% 0%, rgba(139, 92, 246, 0.1) 0px, transparent 50%),
    radial-gradient(at 0% 50%, rgba(20, 184, 166, 0.1) 0px, transparent 50%),
    radial-gradient(at 80% 50%, rgba(236, 72, 153, 0.1) 0px, transparent 50%),
    radial-gradient(at 0% 100%, rgba(59, 130, 246, 0.1) 0px, transparent 50%)
  `,
}

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

export const borderRadius = {
  sm: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
}

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
