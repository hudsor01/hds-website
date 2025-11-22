'use client'

import Link from "next/link"
import { ArrowRightIcon } from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"
import { logger } from "@/lib/logger"

/**
 * Call-to-Action Button Component with Conversion Tracking
 *
 * A reusable CTA button that automatically tracks clicks for conversion analytics.
 * Supports both internal and external links with consistent styling and hover effects.
 *
 * @example
 * ```tsx
 * <CTAButton href="/contact" variant="primary" size="lg">
 *   Get Started
 * </CTAButton>
 * ```
 */
interface CTAButtonProps {
  /** Destination URL (internal or external) */
  href: string
  /** Button content */
  children: React.ReactNode
  /** Visual style variant - primary for main CTAs, secondary for supporting actions */
  variant?: "primary" | "secondary"
  /** Button size - affects padding and text size */
  size?: "sm" | "md" | "lg"
  /** Additional Tailwind classes for customization */
  className?: string
  /** Show/hide the arrow icon (default: true) */
  showArrow?: boolean
  /** Whether the link is external (opens in new tab) */
  external?: boolean
}

const variants = {
  primary: "cta-primary",
  secondary: "cta-secondary button-hover-glow"
}

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3 text-base"
}

/**
 * CTA Button Component
 *
 * Renders a styled call-to-action button with automatic click tracking.
 * All clicks are logged to PostHog and Vercel Analytics for conversion optimization.
 *
 * Features:
 * - Automatic conversion tracking
 * - Consistent brand styling
 * - Smooth hover animations
 * - Support for internal and external links
 * - Accessibility compliant (focus states, keyboard navigation)
 *
 * @param props - CTAButton props
 * @returns Styled button/link component with tracking
 */
export function CTAButton({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
  showArrow = true,
  external = false
}: CTAButtonProps) {
  const baseClasses = "button-base group relative gap-2 font-bold will-change-transform focus-ring"

  const handleClick = () => {
    // Track CTA clicks for conversion analytics
    logger.info('CTA button clicked', {
      href,
      variant,
      size,
      label: typeof children === 'string' ? children : 'CTA',
      external,
      component: 'CTAButton',
      conversionEvent: 'cta_click',
      businessValue: variant === 'primary' ? 'high' : 'medium'
    })
  }

  const LinkComponent = external ? 'a' : Link
  const linkProps = external
    ? { href, target: "_blank", rel: "noopener noreferrer", onClick: handleClick, className: cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      ) }
    : { href, onClick: handleClick, className: cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      ) }

  return (
    <LinkComponent {...linkProps}>
      <span className="relative">{children}</span>
      {showArrow && (
        <ArrowRightIcon className="relative w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      )}
    </LinkComponent>
  )
}