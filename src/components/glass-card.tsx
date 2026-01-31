import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const glassCardVariants = cva('transition-smooth', {
  variants: {
    variant: {
      default: 'glass-card',
      light: 'glass-card-light',
    },
    padding: {
      sm: 'card-padding-sm',
      md: 'card-padding',
      lg: 'card-padding-lg',
    },
    hover: {
      true: 'card-hover-glow hover-lift',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    padding: 'md',
    hover: false,
  },
})

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, padding, hover, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(glassCardVariants({ variant, padding, hover }), className)}
      {...props}
    />
  )
)

GlassCard.displayName = 'GlassCard'

export { GlassCard, glassCardVariants }
