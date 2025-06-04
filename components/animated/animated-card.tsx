'use client'

import { m } from 'framer-motion'

import {
  hover,
  shadows,
  borderRadius,
  cardAnimations,
  transitions,
} from '@/lib/design-system'
import { cn } from '@/lib/utils'
import type { AnimatedCardProps } from '@/types/ui-types'

/**
 * Animated card component with hover and entrance effects
 *
 * This component provides a card container with various animation options.
 * It supports hover effects, delayed entrance animations, and customizable styling.
 */
export function AnimatedCard({
  children,
  className = '',
  whileHover,
  onClick,
  delay = 0,
  elevation = 'medium',
  radius = 'xl',
  animation = true,
  interactionEffect = 'lift',
}: AnimatedCardProps) {
  // Map elevation to shadow
  const shadowMap = {
    none: 'none',
    low: shadows.sm,
    medium: shadows.md,
    high: shadows.lg,
  }

  // Map radius to border radius
  const radiusMap = {
    none: '0',
    sm: borderRadius.sm,
    md: borderRadius.md,
    lg: borderRadius.lg,
    xl: borderRadius.xl,
    full: borderRadius.full,
  }

  // Map interaction effect to hover animation
  const interactionMap = {
    lift: hover.lift,
    scale: hover.scale,
    glow: hover.glow,
    none: {},
  }

  // Use provided hover effect or default based on interactionEffect
  const hoverEffect = whileHover || interactionMap[interactionEffect]

  return (
    <m.div
      className={cn('backdrop-blur-sm', className)}
      whileHover={hoverEffect}
      whileTap={cardAnimations.tap}
      initial={animation ? cardAnimations.initial : { opacity: 1 }}
      animate={animation ? cardAnimations.animate : { opacity: 1 }}
      transition={{ ...transitions.smooth, delay }}
      style={{
        boxShadow: shadowMap[elevation],
        borderRadius: radiusMap[radius],
      }}
      onClick={onClick}
    >
      {children}
    </m.div>
  )
}
