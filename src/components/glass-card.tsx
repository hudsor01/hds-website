import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type GlassVariant = "default" | "light" | "section"

interface GlassCardProps {
  children: ReactNode
  variant?: GlassVariant
  className?: string
  padding?: "sm" | "md" | "lg" | "xl" | "none"
}

const variantStyles = {
  default: "glass-card",
  light: "glass-card-light",
  section: "glass-section"
} as const

const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
  xl: "p-12 md:p-16"
} as const

export function GlassCard({
  children,
  variant = "default",
  className,
  padding = "lg"
}: GlassCardProps) {
  return (
    <div className={cn(
      variantStyles[variant],
      paddingStyles[padding],
      className
    )}>
      {children}
    </div>
  )
}