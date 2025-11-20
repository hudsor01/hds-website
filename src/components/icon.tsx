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
  default: 'text-gray-400 hover:text-white hover:bg-gray-800/50',
  ghost: 'text-gray-400 hover:text-white hover:bg-transparent',
  primary: 'text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10',
  danger: 'text-red-400 hover:text-red-300 hover:bg-red-400/10'
}

const buttonSizes = {
  xs: 'p-1',
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-3',
  xl: 'p-4'
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

/**
 * Icon Badge Component
 *
 * Renders an icon inside a circular or rounded badge.
 * Perfect for status indicators, feature highlights, or decorative icons.
 */

interface IconBadgeProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'circle' | 'rounded'
  className?: string
  ariaLabel?: string
}

const badgeVariants = {
  default: 'bg-gray-800/50 text-gray-400 border-gray-700',
  primary: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/30',
  success: 'bg-green-400/10 text-green-400 border-green-400/30',
  warning: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30',
  danger: 'bg-red-400/10 text-red-400 border-red-400/30',
  info: 'bg-blue-400/10 text-blue-400 border-blue-400/30'
}

const badgeSizes = {
  sm: 'p-2',
  md: 'p-3',
  lg: 'p-4',
  xl: 'p-6'
}

const badgeIconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8'
}

export function IconBadge({
  icon: IconComponent,
  variant = 'default',
  size = 'md',
  shape = 'rounded',
  className,
  ariaLabel
}: IconBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center border',
        badgeSizes[size],
        badgeVariants[variant],
        shape === 'circle' ? 'rounded-full' : 'rounded-lg',
        className
      )}
      aria-label={ariaLabel}
      role={ariaLabel ? undefined : 'presentation'}
    >
      <IconComponent className={badgeIconSizes[size]} aria-hidden="true" />
    </div>
  )
}