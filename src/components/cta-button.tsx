'use client'

import Link from "next/link"
import { ArrowRightIcon } from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"
import { logger } from "@/lib/logger"

interface CTAButtonProps {
  href: string
  children: React.ReactNode
  variant?: "primary" | "secondary"
  size?: "sm" | "md" | "lg"
  className?: string
  showArrow?: boolean
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