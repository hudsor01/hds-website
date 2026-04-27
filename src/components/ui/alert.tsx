'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const alertVariants = cva(
	'relative w-full rounded-none border card-padding-sm [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
	{
		variants: {
			variant: {
				default: 'bg-background text-foreground',
				destructive:
					'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive'
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	}
)

function Alert({
	className,
	variant,
	...props
}: HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>) {
	return (
		<div
			role="alert"
			className={cn(alertVariants({ variant }), className)}
			{...props}
		/>
	)
}

function AlertTitle({
	className,
	...props
}: HTMLAttributes<HTMLHeadingElement>) {
	return (
		<h5
			className={cn('mb-1 font-medium leading-none tracking-tight', className)}
			{...props}
		/>
	)
}

function AlertDescription({
	className,
	...props
}: HTMLAttributes<HTMLParagraphElement>) {
	return (
		<div
			className={cn('text-sm [&_p]:leading-relaxed', className)}
			{...props}
		/>
	)
}

export { Alert, AlertDescription, AlertTitle }
