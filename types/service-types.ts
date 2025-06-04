import type { ReactNode } from 'react'

export type ServiceCardVariant = 'default' | 'animated' | 'gradient' | 'minimal'

export interface ServiceCardProps {
  title: string
  description: string
  icon: ReactNode
  href: string
  className?: string
  featured?: boolean
  variant?: ServiceCardVariant
  price?: string
  gradient?: string
  delay?: number
  onClick?: () => void
}

// Service Section Types
export type ServicesSectionVariant =
  | 'default'
  | 'gradient'
  | 'simple'
  | 'minimal'

export type ServiceItem = {
  icon: ReactNode
  title: string
  description: string
  price?: string
  link: string
  gradient?: string
  featured?: boolean
}

export interface ServicesSectionProps {
  variant?: ServicesSectionVariant
  title?: string
  subtitle?: string
  services?: ServiceItem[]
  className?: string
  showContactCta?: boolean
  ctaText?: string
  ctaLink?: string
  ctaButtonText?: string
  bgColor?: string
}

/**
 * Service update data for batch operations
 */
export interface ServiceUpdate {
  id: string
  title?: string
  description?: string
  price?: string
  featured?: boolean
  isActive?: boolean
}
