/**
 * Unified Design System
 *
 * This file serves as the central export point for all design tokens,
 * styles, and animation configurations used throughout the application.
 *
 * It organizes design tokens into specific domains (colors, spacing, animations, etc.)
 * for better organization and maintainability.
 */

// Re-export all design token categories
export { colors, spacing, typography } from './tokens/base-tokens'
export {
  shadows,
  gradients,
  borderRadius,
  breakpoints,
} from './tokens/visual-tokens'
export {
  animations,
  transitions,
  hover,
  cursor,
} from './tokens/animation-tokens'
export {
  textAnimations,
  containerVariants,
  staggerConfigs,
} from './tokens/text-animations'
export {
  floatingAnimations,
  cardAnimations,
  gradientAnimations,
} from './tokens/complex-animations'
export { withDelay, reducedMotionAnimations } from './tokens/animation-utils'
