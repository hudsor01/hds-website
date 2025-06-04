/**
 * Component Types (Legacy)
 * 
 * @deprecated Use types from ui-types.ts, business-types.ts, and other domain-specific files instead.
 * This file is maintained for backward compatibility only.
 */

import type { ReactNode, ReactElement } from 'react'

// Legacy component types - interfaces defined below

// Legacy types maintained for backward compatibility
export type HeroVariant = 'default' | 'simple' | 'animated'

// These types should be migrated to use the new organized types
export interface SectionProps {
  children: ReactNode
  className?: string
  id?: string
  variant?: 'default' | 'dark' | 'accent' | 'gradient' | 'light'
  containerWidth?: 'default' | 'narrow' | 'wide' | 'full'
  padding?: 'default' | 'small' | 'large' | 'none'
  title?: string
  subtitle?: string
  titleAlignment?: 'left' | 'center' | 'right'
}

export interface AnimatedSectionProps extends SectionProps {
  animation?:
    | 'fadeIn'
    | 'fadeInUp'
    | 'fadeInDown'
    | 'scaleIn'
    | 'slideInRight'
    | 'slideInLeft'
    | 'springBounce'
  delay?: number
}

export type StatItem = {
  value: number | null
  label: string
  suffix?: string
  text?: string
}

export type FeatureBadge = {
  icon: ReactElement
  text: string
  delay: number
}

export type CtaLink = {
  text: string
  href: string
}

// Base hero props
export interface BaseHeroProps {
  title: string
  subtitle: string
  primaryCta?: CtaLink
  secondaryCta?: CtaLink
  className?: string
}

// Simple hero props
export interface SimpleHeroProps extends BaseHeroProps {
  darkMode?: boolean
}

// Default hero props
export interface DefaultHeroProps extends BaseHeroProps {
  imageSrc?: string
  imageAlt?: string
  darkMode?: boolean
}

// Animated hero props
export interface AnimatedHeroProps extends BaseHeroProps {
  stats?: StatItem[]
  badges?: FeatureBadge[]
}

// Legacy hero props (for backward compatibility)
export type HeroProps = {
  variant?: HeroVariant
  title: string
  subtitle: string
  primaryCta?: CtaLink
  secondaryCta?: CtaLink
  imageSrc?: string
  imageAlt?: string
  darkMode?: boolean
  stats?: StatItem[]
  badges?: FeatureBadge[]
  className?: string
}

// Common component types
export interface TitleSectionProps {
  title: string
  subtitle?: string
  description?: string
  alignment?: 'left' | 'center' | 'right'
  titleSize?: 'sm' | 'md' | 'lg' | 'xl'
  subtitleColor?: string
  className?: string
}

// Animation types
export interface AnimatedProps {
  children: ReactNode
  className?: string
  delay?: number
}