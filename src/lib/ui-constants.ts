/**
 * Shared UI Constants - DRY Implementation
 * Single source of truth for all UI-related constants
 */

// Aspect Ratios (shared across image components)
export const ASPECT_RATIOS = {
  square: "aspect-square",
  video: "aspect-video", 
  portrait: "aspect-3/4",
  landscape: "aspect-4/3",
} as const;

export type AspectRatio = keyof typeof ASPECT_RATIOS;

// Button Variants (shared across interactive elements)
export const BUTTON_VARIANTS = {
  primary: 'bg-linear-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 focus:ring-cyan-400 shadow-lg hover:shadow-xl',
  secondary: 'border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white focus:ring-gray-400',
  ghost: 'text-gray-300 hover:bg-gray-800 hover:text-white focus:ring-gray-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-400',
  success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-400',
} as const;

export type ButtonVariant = keyof typeof BUTTON_VARIANTS;

// Size Variants (shared across components)
export const SIZE_VARIANTS = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
  xl: 'px-10 py-5 text-xl',
} as const;

export type SizeVariant = keyof typeof SIZE_VARIANTS;

// Loading States (shared across components)
export const LOADING_STATES = {
  idle: 'idle',
  loading: 'loading',
  success: 'success',
  error: 'error',
} as const;

export type LoadingState = keyof typeof LOADING_STATES;

// Common Animation Classes (CSS-based transitions)
export const ANIMATION_CLASSES = {
  // Transitions
  smooth: 'transition-all duration-200 ease-in-out',
  fast: 'transition-all duration-150 ease-in-out', 
  slow: 'transition-all duration-300 ease-in-out',
  
  // Transforms
  hoverScale: 'hover:scale-105',
  activeScale: 'active:scale-95',
  hoverLift: 'hover:-translate-y-1',
  
  // Common combinations
  interactive: 'transition-all duration-200 ease-in-out hover:scale-105 active:scale-95',
  fadeIn: 'transition-opacity duration-300 ease-in-out',
  slideUp: 'transition-transform duration-300 ease-in-out',
} as const;

// Focus States (shared accessibility patterns)
export const FOCUS_CLASSES = {
  default: 'focus:outline-none focus:ring-2 focus:ring-offset-2',
  primary: 'focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2',
  danger: 'focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2',
  success: 'focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2',
} as const;

// Disabled States (shared patterns)
export const DISABLED_CLASSES = {
  default: 'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
  button: 'disabled:opacity-50 disabled:cursor-not-allowed',
  input: 'disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50',
} as const;

// Error Message Styles (shared error presentation)
export const ERROR_CLASSES = {
  text: 'text-red-400 text-sm',
  background: 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800',
  icon: 'text-red-500',
} as const;

// Success Message Styles
export const SUCCESS_CLASSES = {
  text: 'text-green-400 text-sm',
  background: 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800',
  icon: 'text-green-500',
} as const;

// Loading Message Styles  
export const LOADING_CLASSES = {
  text: 'text-gray-400 text-sm',
  background: 'bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800',
  spinner: 'text-cyan-400',
} as const;

// Text Gradients (commonly repeated across components)
export const TEXT_GRADIENTS = {
  primary: 'bg-linear-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent',
  secondary: 'bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent',
  accent: 'bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent',
  warm: 'bg-linear-to-r from-orange-400 to-red-400 bg-clip-text text-transparent',
} as const;

// Background Patterns (shared across pages)
export const BACKGROUND_PATTERNS = {
  gradientOrbs: {
    primary: 'absolute top-1/4 right-1/4 w-96 h-96 bg-linear-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl',
    secondary: 'absolute bottom-1/3 left-1/3 w-64 h-64 bg-linear-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl',
    accent: 'absolute top-1/2 left-1/6 w-32 h-32 bg-linear-to-r from-green-500/20 to-cyan-500/20 rounded-full blur-2xl',
  },
  gridLines: {
    horizontal: 'absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(34,211,238,0.1)_50%,transparent_51%)] bg-size-[60px_60px]',
    vertical: 'absolute inset-0 bg-[linear-gradient(0deg,transparent_49%,rgba(34,211,238,0.1)_50%,transparent_51%)] bg-size-[60px_60px]',
    subtle: 'absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(34,211,238,0.05)_50%,transparent_51%)] bg-size-[120px_120px]',
  }
} as const;

// CTA Button Styles (shared shimmer and gradient effects)
export const CTA_STYLES = {
  primary: 'bg-linear-to-r from-cyan-500 to-blue-600 text-white hover:shadow-2xl hover:shadow-cyan-500/50',
  secondary: 'bg-linear-to-r from-purple-500 to-pink-600 text-white hover:shadow-2xl hover:shadow-purple-500/50',
  ghost: 'border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black hover:shadow-xl hover:shadow-cyan-400/50',
  shimmer: 'absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000',
} as const;