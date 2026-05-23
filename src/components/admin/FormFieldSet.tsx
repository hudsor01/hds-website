/**
 * Labeled wrapper for admin form fields (server component).
 *
 * Lives inside per-resource field renderers (Create/Edit forms). Owns the
 * label, required marker, hint text, and error text; the caller owns the
 * actual input element so different fields can pick the right control
 * (input, textarea, select, multi-select) without duplicating accessibility
 * boilerplate.
 *
 * Aria pattern mirrors `GenericField` in `src/hooks/form-hook.tsx`. The
 * child input is responsible for setting:
 *  - `id={htmlFor}`
 *  - `aria-describedby={errorId ?? hintId}`
 *  - `aria-invalid={error ? 'true' : undefined}`
 */
import type { ReactNode } from 'react'

interface FormFieldSetProps {
	label: string
	htmlFor: string
	required?: boolean
	error?: string
	hint?: string
	children: ReactNode
}

export function FormFieldSet({
	label,
	htmlFor,
	required,
	error,
	hint,
	children
}: FormFieldSetProps) {
	const errorId = error ? `${htmlFor}-error` : undefined
	const hintId = hint ? `${htmlFor}-hint` : undefined
	return (
		<div className="space-y-1.5">
			<label
				htmlFor={htmlFor}
				className="block text-sm font-medium text-foreground"
			>
				{label}
				{required && (
					<>
						<span className="text-destructive" aria-hidden="true">
							{' *'}
						</span>
						<span className="sr-only"> required</span>
					</>
				)}
			</label>
			{children}
			{hint && (
				<p id={hintId} className="text-xs text-muted-foreground">
					{hint}
				</p>
			)}
			{error && (
				<p id={errorId} role="alert" className="text-xs text-destructive">
					{error}
				</p>
			)}
		</div>
	)
}
