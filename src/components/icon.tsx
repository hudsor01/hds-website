import type { ComponentType, SVGProps } from 'react'
import type { ComponentType, SVGProps } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Icon Component System
 *
 * Standardizes icon usage across the application with consistent sizing and styling.
 * Works with any Heroicon or SVG component that accepts SVGProps.
 */

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
  '2xl': 'w-16 h-16'
} as const

export function Icon({
  icon: IconComponent,
  size = 'md',
  className,
  ...props
}: IconProps) {
  return (
    <IconComponent
      className={cn(sizeClasses[size], className)}
      {...props}
    />
  )
}

// Convenience exports for common patterns
export const SmallIcon = ({ icon, ...props }: Omit<IconProps, 'size'>) =>
  <Icon icon={icon} size="sm" {...props} />

export const LargeIcon = ({ icon, ...props }: Omit<IconProps, 'size'>) =>
  <Icon icon={icon} size="xl" {...props} />

export const HeroIcon = ({ icon, ...props }: Omit<IconProps, 'size'>) =>
  <Icon icon={icon} size="2xl" {...props} />

/**
 * Icon Button Component
 *
 * Renders a clickable icon button with consistent hover states and accessibility.
 * Perfect for toolbar buttons, action buttons, and interactive icons.
 */

interface IconButtonProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  onClick?: () => void
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'ghost' | 'primary' | 'danger'
  className?: string
  ariaLabel: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const iconButtonVariants = {
  default: 'text-muted-foreground hover:text-foreground',
  ghost: 'text-muted-foreground hover:text-foreground',
  primary: 'text-accent hover:text-accent/80',
  danger: 'text-destructive hover:text-destructive-darker'
} as const

const iconButtonSizes = {
  xs: 'icon-sm',
  sm: 'icon-sm',
  md: 'icon',
  lg: 'icon-lg',
  xl: 'icon-lg'
} as const

export function IconButton({
  icon: IconComponent,
  onClick,
  size = 'md',
  variant = 'default',
  className,
  ariaLabel,
  disabled = false,
  type = 'button'
}: IconButtonProps) {
  const iconSize = size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : size === 'lg' ? 'w-6 h-6' : 'w-8 h-8'

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      variant="ghost"
      size={iconButtonSizes[size]}
      className={cn(
        iconButtonVariants[variant],
        className
      )}
    >
      <IconComponent className={iconSize} aria-hidden="true" />
    </Button>
  )
}
