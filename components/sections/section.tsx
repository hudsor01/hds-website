'use client'

import React from 'react'
import { m } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { SectionProps, AnimatedSectionProps } from '@/types/component-types'
import { animations, transitions } from '@/lib/design-system'
import { useScrollAnimation } from '@/hooks/use-animation-hooks'

/**
 * Enhanced base section component for page content
 *
 * This component provides a consistent section wrapper with optional styling,
 * title/subtitle, and container width control. Use this as the base for all page sections.
 */
export function Section({
  id,
  className,
  variant = 'default',
  containerWidth = 'default',
  children,
  padding = 'default',
  title,
  subtitle,
  titleAlignment = 'center',
}: SectionProps) {
  // Style mapping based on props
  const variantClasses = {
    default: 'bg-white',
    dark: 'bg-gray-900 text-white',
    accent: 'bg-primary/5 border-y border-primary/10',
    gradient: 'bg-gradient-to-b from-gray-50 to-white',
    light: 'bg-gray-50',
  }

  const paddingClasses = {
    default: 'py-12 md:py-20',
    small: 'py-8 md:py-12',
    large: 'py-16 md:py-32',
    none: '',
  }

  const containerClasses = {
    default: 'container mx-auto px-4 md:px-6',
    narrow: 'container max-w-4xl mx-auto px-4 md:px-6',
    wide: 'container max-w-7xl mx-auto px-4 md:px-6',
    full: 'w-full px-4 md:px-6',
  }

  const titleAlignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  return (
    <section
      id={id}
      className={cn(
        paddingClasses[padding],
        variantClasses[variant],
        className,
      )}
    >
      <div className={containerClasses[containerWidth]}>
        {(title || subtitle) && (
          <div className={cn('mb-12', titleAlignmentClasses[titleAlignment])}>
            {title && (
              <h2 className='text-3xl font-bold tracking-tight sm:text-4xl mb-4'>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className='text-lg text-muted-foreground max-w-3xl mx-auto'>
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  )
}

/**
 * Animated section with customizable animations triggered on scroll
 *
 * This component enhances the base Section with animation capabilities using
 * Framer Motion. It supports various animation types and delay options.
 */
export function AnimatedSection({
  children,
  className,
  id,
  variant = 'default',
  containerWidth = 'default',
  padding = 'default',
  title,
  subtitle,
  titleAlignment = 'center',
  animation = 'fadeInUp',
  delay = 0,
}: AnimatedSectionProps) {
  const { ref, isInView } = useScrollAnimation({})

  // Style mapping based on props
  const variantClasses = {
    default: 'bg-white',
    dark: 'bg-gray-900 text-white',
    accent: 'bg-primary/5 border-y border-primary/10',
    gradient: 'bg-gradient-to-b from-gray-50 to-white',
    light: 'bg-gray-50',
  }

  const paddingClasses = {
    default: 'py-12 md:py-20',
    small: 'py-8 md:py-12',
    large: 'py-16 md:py-32',
    none: '',
  }

  const containerClasses = {
    default: 'container mx-auto px-4 md:px-6',
    narrow: 'container max-w-4xl mx-auto px-4 md:px-6',
    wide: 'container max-w-7xl mx-auto px-4 md:px-6',
    full: 'w-full px-4 md:px-6',
  }

  const titleAlignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  return (
    <m.section
      ref={ref}
      id={id}
      className={cn(
        paddingClasses[padding],
        variantClasses[variant],
        className,
      )}
      initial={animations[animation].initial}
      animate={
        isInView ? animations[animation].animate : animations[animation].initial
      }
      transition={{ ...transitions.smooth, delay }}
    >
      <div className={containerClasses[containerWidth]}>
        {(title || subtitle) && (
          <m.div
            className={cn('mb-12', titleAlignmentClasses[titleAlignment])}
            initial={animations.fadeInUp.initial}
            animate={
              isInView
                ? animations.fadeInUp.animate
                : animations.fadeInUp.initial
            }
            transition={{ ...transitions.smooth, delay: delay + 0.1 }}
          >
            {title && (
              <h2 className='text-3xl font-bold tracking-tight sm:text-4xl mb-4'>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className='text-lg text-muted-foreground max-w-3xl mx-auto'>
                {subtitle}
              </p>
            )}
          </m.div>
        )}
        {children}
      </div>
    </m.section>
  )
}

/**
 * Dark themed section with gradient background
 *
 * Pre-configured dark section with a gradient background.
 * This is a shorthand for Section with variant='dark'.
 */
export function DarkSection(props: SectionProps) {
  return (
    <Section
      variant='dark'
      className={cn(
        'bg-gradient-to-b from-gray-900 to-gray-800',
        props.className,
      )}
      {...props}
    />
  )
}

/**
 * Colored section with accent background
 *
 * Pre-configured accent section with subtle background and border.
 * This is a shorthand for Section with variant='accent'.
 */
export function AccentSection(props: SectionProps) {
  return <Section variant='accent' {...props} />
}

/**
 * Gradient background section
 *
 * Pre-configured section with a subtle gradient background.
 * This is a shorthand for Section with variant='gradient'.
 */
export function GradientSection(props: SectionProps) {
  return <Section variant='gradient' {...props} />
}
