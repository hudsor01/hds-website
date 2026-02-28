'use client'

import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-tight whitespace-nowrap rounded-md text-sm font-medium transition-smooth disabled:pointer-events-none disabled:opacity-50 will-change-transform [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-hidden focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
	{
		variants: {
			variant: {
				default:
					'bg-primary text-primary-foreground shadow-sm hover:bg-primary/80 active:bg-primary/70 focus-visible:ring-primary/30',
				destructive:
					'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/80 active:bg-destructive/75 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
				success:
					'bg-success text-success-foreground shadow-sm hover:bg-success/90 active:bg-success/80',
				accent:
					'bg-accent text-accent-foreground shadow-sm hover:bg-accent/85 active:bg-accent/75',
				outline:
					'border border-border bg-background text-foreground shadow-xs hover:bg-accent hover:text-accent-foreground active:bg-accent/15 dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
				secondary:
					'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 active:bg-secondary/70',
				muted:
					'bg-muted text-muted-foreground hover:bg-muted/80 active:bg-muted/70',
				ghost: 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
				link: 'text-primary underline-offset-4 hover:underline'
			},
			size: {
				default: 'h-9 px-4 py-2 has-[>svg]:px-3',
				sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
				lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
				xl: 'h-12 rounded-xl px-10 py-5 text-lg font-bold has-[>svg]:px-8',
				icon: 'size-9',
				'icon-sm': 'size-8',
				'icon-lg': 'size-10'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	}
)

export interface ButtonProps
	extends React.ComponentProps<'button'>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean
	/** Track this button click as a conversion event (handled by Vercel Analytics) */
	trackConversion?: boolean
}

function Button({
	className,
	variant,
	size,
	asChild = false,
	// trackConversion prop kept for API compatibility, tracking handled by Vercel Analytics
	trackConversion: _trackConversion,
	...props
}: ButtonProps) {
	const Comp = asChild ? Slot : 'button'

	return (
		<Comp
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		>
			{props.children}
		</Comp>
	)
}

export { Button, buttonVariants }
