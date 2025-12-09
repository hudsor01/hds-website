import type { ComponentType, SVGProps } from 'react'
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

const buttonVariants = {
  default: 'text-muted-foreground hover:text-primary-foreground hover:bg-muted/50',
  ghost: 'text-muted-foreground hover:text-primary-foreground hover:bg-transparent',
  primary: 'text-accent hover:text-accent/80 hover:bg-accent/10',
  danger: 'text-destructive-text hover:text-destructive-muted hover:bg-destructive/10'
}

const buttonSizes = {
  xs: 'p-1',
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-3',
  xl: 'card-padding-sm'
}

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
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        'rounded-lg transition-colors focus-ring disabled:opacity-50 disabled:cursor-not-allowed',
        buttonSizes[size],
        buttonVariants[variant],
        className
      )}
    >
      <IconComponent className={iconSize} aria-hidden="true" />
    </button>
  )
}