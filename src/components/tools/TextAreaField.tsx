'use client'

import type { TextareaHTMLAttributes } from 'react'
import { Label } from '@/components/ui/label'

interface TextAreaFieldProps
	extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
	id: string
	label: string
	helpText?: string
}

/**
 * Labeled textarea for the document generators, styled to match
 * CalculatorInput so every field has a visible, programmatic label.
 */
export function TextAreaField({
	id,
	label,
	helpText,
	rows = 3,
	...props
}: TextAreaFieldProps) {
	return (
		<div className="space-y-tight">
			<Label htmlFor={id}>{label}</Label>
			<textarea
				id={id}
				name={id}
				rows={rows}
				aria-describedby={helpText ? `${id}-help` : undefined}
				className="field"
				{...props}
			/>
			{helpText && (
				<p id={`${id}-help`} className="text-xs text-muted-foreground">
					{helpText}
				</p>
			)}
		</div>
	)
}
