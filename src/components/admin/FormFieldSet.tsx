/**
 * Labeled wrapper for admin form fields (server component).
 *
 * Lives inside per-resource field renderers (Create/Edit forms). Owns the
 * label, required marker, hint text, and error text; the caller owns the
 * actual input element so different fields can pick the right control
 * (input, textarea, select, multi-select) without duplicating accessibility
 * boilerplate.
 *
 * Aria pattern mirrors `GenericField` in `src/hooks/form-hook.tsx`.
 *
 * Two child shapes are supported:
 *
 *  1. ReactNode -- the caller wires `id`, `aria-describedby`, and
 *     `aria-invalid` on the child input manually (used by the blog forms,
 *     where the inputs were authored before the render-prop API existed).
 *
 *  2. Render prop `(aria) => ReactNode` -- the FormFieldSet computes the
 *     aria attributes and hands them to the child via the callback. The
 *     child spreads `{...aria}` on the underlying `<input>` / `<textarea>` /
 *     `<select>` and gets `id`, `aria-describedby` (pointing at the error
 *     OR hint id, whichever exists), and `aria-invalid="true"` when there
 *     is an error. Used by every useAppForm-based admin form.
 */
import type { ReactNode } from 'react'

export type FieldRenderProps = {
	id: string
	'aria-describedby'?: string
	'aria-invalid'?: 'true'
}

interface FormFieldSetProps {
	label: string
	htmlFor: string
	required?: boolean
	error?: string
	hint?: string
	children: ReactNode | ((aria: FieldRenderProps) => ReactNode)
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
	const aria: FieldRenderProps = {
		id: htmlFor,
		'aria-describedby': errorId ?? hintId,
		'aria-invalid': error ? 'true' : undefined
	}
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
			{typeof children === 'function' ? children(aria) : children}
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
