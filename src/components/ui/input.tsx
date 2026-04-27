'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import type { InputHTMLAttributes, Ref } from 'react'
import { cn } from '@/lib/utils'

const inputVariants = cva(
	'flex h-10 w-full rounded-md border border-input bg-surface-sunken px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50',
	{
		variants: {
			variant: {
				default: '',
				currency: 'pl-7'
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	}
)

export type InputProps = InputHTMLAttributes<HTMLInputElement> &
	VariantProps<typeof inputVariants> & {
		ref?: Ref<HTMLInputElement>
	}

function Input({ className, variant, type, ref, ...props }: InputProps) {
	return (
		<div className="relative">
			{variant === 'currency' && (
				<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
					$
				</span>
			)}
			<input
				type={type}
				className={cn(inputVariants({ variant }), className)}
				ref={ref}
				{...props}
			/>
		</div>
	)
}

export { Input, inputVariants }
