import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type GlassVariant = "default" | "light" | "section"

interface GlassCardProps {
  children: ReactNode
  variant?: GlassVariant
  className?: string
  padding?: "sm" | "md" | "lg" | "xl" | "none"
  hover?: boolean
}

const variantStyles = {
  default: "glass-card",
  light: "glass-card-light",
  section: "glass-section"
} as const

const paddingStyles = {
  none: "",
  sm: "card-padding-sm",
  md: "card-padding",
  lg: "card-padding-lg",
  xl: "p-12 md:p-16"
} as const

export function GlassCard({
  children,
  variant = "default",
  className,
  padding = "lg",
  hover = false
}: GlassCardProps) {
  return (
    <div className={cn(
      variantStyles[variant],
      paddingStyles[padding],
      hover && "card-hover-glow",
      className
    )}>
      {children}
    </div>
  )
}