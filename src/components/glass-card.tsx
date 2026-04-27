import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes, Ref } from 'react'

import { cn } from '@/lib/utils'

const glassCardVariants = cva('transition-smooth', {
	variants: {
		variant: {
			default: 'glass-card',
			light: 'glass-card-light'
		},
		padding: {
			sm: 'card-padding-sm',
			md: 'card-padding',
			lg: 'card-padding-lg'
		},
		hover: {
			true: 'card-hover-glow hover-lift',
			false: ''
		}
	},
	defaultVariants: {
		variant: 'default',
		padding: 'md',
		hover: false
	}
})

export interface GlassCardProps
	extends HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof glassCardVariants> {
	ref?: Ref<HTMLDivElement>
}

function GlassCard({
	className,
	variant,
	padding,
	hover,
	ref,
	...props
}: GlassCardProps) {
	return (
		<div
			ref={ref}
			className={cn(glassCardVariants({ variant, padding, hover }), className)}
			{...props}
		/>
	)
}

export { GlassCard, glassCardVariants }
