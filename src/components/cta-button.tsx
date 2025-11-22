import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

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

  const LinkComponent = external ? 'a' : Link
  const linkProps = external
    ? { href, target: "_blank", rel: "noopener noreferrer", className: cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      ) }
    : { href, className: cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      ) }

  return (
    <LinkComponent {...linkProps}>
      <span className="relative">{children}</span>
      {showArrow && (
        <ArrowRight className="relative w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      )}
    </LinkComponent>
  )
}