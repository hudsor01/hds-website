'use client'

import type * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
	return (
		<textarea
			data-slot="textarea"
			className={cn('field flex field-sizing-content min-h-16', className)}
			{...props}
		/>
	)
}

export { Textarea }
