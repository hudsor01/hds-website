'use client'

import { Slot } from '@radix-ui/react-slot'

import {
	type ButtonProps,
	buttonVariants
} from '@/components/ui/button-variants'
import { cn } from '@/lib/utils'

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

// `ButtonProps` and `buttonVariants` are intentionally NOT re-exported —
// server components must import them from `@/components/ui/button-variants`
// to avoid pulling the client Button module into a server render path
// (see button-variants.ts).
export { Button }
