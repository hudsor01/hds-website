'use client'

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
		<IconComponent className={cn(sizeClasses[size], className)} {...props} />
	)
}
