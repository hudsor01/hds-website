/**
 * TanStack Form Hook with Pre-bound Field Components
 * Provides useAppForm with TextField, EmailField, SelectField, etc.
 */

'use client'

import { createFormHook } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
	fieldContext,
	formContext,
	useFieldContext,
	useFormContext
} from './form-context'

// =============================================================================
// Generic Field Component
//
// Owns the accessibility wiring for every form field on the site:
//
//  - Label is associated with the input via htmlFor/id (same field name).
//  - When the field has validation errors the input gets aria-invalid +
//    aria-describedby pointing at the FieldError block (which carries a
//    matching id). WCAG 1.3.1 / 4.1.3.
//  - Required fields get the native `required` attribute (which implies
//    aria-required) plus a visible asterisk and an sr-only " required"
//    suffix. WCAG 3.3.2.
// =============================================================================

interface GenericFieldProps {
	label: string
	type: 'text' | 'email' | 'tel' | 'select' | 'textarea'
	placeholder?: string
	autoComplete?: string
	options?: Array<{ value: string; label: string }>
	rows?: number
	required?: boolean
	/**
	 * Helper text rendered below the field. Hidden when a validation
	 * error is present so the error owns the description slot. Audit
	 * #266: this is the canonical hint pattern used by
	 * `CalculatorInput` (`src/components/calculators/CalculatorInput.tsx`)
	 * — keeping both surfaces on the same convention avoids two
	 * different hint UIs for the same primitive.
	 */
	hint?: string
}

function RequiredMarker() {
	return (
		<>
			<span className="text-destructive" aria-hidden="true">
				{' *'}
			</span>
			<span className="sr-only"> required</span>
		</>
	)
}

function GenericField({
	type,
	label,
	placeholder,
	autoComplete,
	options,
	rows = 4,
	required,
	hint
}: GenericFieldProps) {
	const field = useFieldContext<string>()
	const fieldId = field.name
	const errorId = `${fieldId}-error`
	const hintId = `${fieldId}-hint`
	const hasError = field.state.meta.errors.length > 0
	const showHint = !hasError && Boolean(hint)

	const ariaProps = {
		'aria-invalid': hasError ? ('true' as const) : undefined,
		'aria-describedby': hasError ? errorId : showHint ? hintId : undefined,
		'aria-required': required ? ('true' as const) : undefined
	}

	const renderField = () => {
		switch (type) {
			case 'email':
				return (
					<Input
						id={fieldId}
						type="email"
						placeholder={placeholder}
						autoComplete={autoComplete || 'email'}
						value={field.state.value ?? ''}
						onBlur={field.handleBlur}
						onChange={e => field.handleChange(e.target.value)}
						required={required}
						{...ariaProps}
					/>
				)
			case 'tel':
				return (
					<Input
						id={fieldId}
						type="tel"
						placeholder={placeholder}
						autoComplete={autoComplete || 'tel'}
						value={field.state.value ?? ''}
						onBlur={field.handleBlur}
						onChange={e => field.handleChange(e.target.value)}
						required={required}
						{...ariaProps}
					/>
				)
			case 'select':
				return (
					<Select
						value={field.state.value ?? ''}
						onValueChange={value => field.handleChange(value)}
					>
						<SelectTrigger id={fieldId} {...ariaProps}>
							<SelectValue placeholder={placeholder} />
						</SelectTrigger>
						<SelectContent>
							{options?.map(option => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				)
			case 'textarea':
				return (
					<Textarea
						id={fieldId}
						placeholder={placeholder}
						rows={rows}
						value={field.state.value ?? ''}
						onBlur={field.handleBlur}
						onChange={e => field.handleChange(e.target.value)}
						required={required}
						{...ariaProps}
					/>
				)
			default: // text
				return (
					<Input
						id={fieldId}
						placeholder={placeholder}
						autoComplete={autoComplete}
						value={field.state.value ?? ''}
						onBlur={field.handleBlur}
						onChange={e => field.handleChange(e.target.value)}
						required={required}
						{...ariaProps}
					/>
				)
		}
	}

	return (
		<Field>
			<FieldLabel htmlFor={fieldId}>
				{label}
				{required && <RequiredMarker />}
			</FieldLabel>
			{renderField()}
			{showHint && (
				<p id={hintId} className="text-xs text-muted-foreground">
					{hint}
				</p>
			)}
			<FieldError id={errorId} errors={field.state.meta.errors} />
		</Field>
	)
}

// =============================================================================
// Field Components — bound to TanStack Form via createFormHook below.
// Consumed as form.AppField → field.TextField, field.SelectField, etc.
// =============================================================================

interface TextFieldProps {
	label: string
	placeholder?: string
	autoComplete?: string
	required?: boolean
	hint?: string
}

function TextField({
	label,
	placeholder,
	autoComplete,
	required,
	hint
}: TextFieldProps) {
	return (
		<GenericField
			type="text"
			label={label}
			placeholder={placeholder}
			autoComplete={autoComplete}
			required={required}
			hint={hint}
		/>
	)
}

function EmailField({ label, placeholder, required, hint }: TextFieldProps) {
	return (
		<GenericField
			type="email"
			label={label}
			placeholder={placeholder}
			required={required}
			hint={hint}
		/>
	)
}

function PhoneField({ label, placeholder, required, hint }: TextFieldProps) {
	return (
		<GenericField
			type="tel"
			label={label}
			placeholder={placeholder}
			required={required}
			hint={hint}
		/>
	)
}

interface SelectFieldProps {
	label: string
	placeholder?: string
	options: Array<{ value: string; label: string }>
	required?: boolean
	hint?: string
}

function SelectField({
	label,
	placeholder,
	options,
	required,
	hint
}: SelectFieldProps) {
	return (
		<GenericField
			type="select"
			label={label}
			placeholder={placeholder}
			options={options}
			required={required}
			hint={hint}
		/>
	)
}

interface TextareaFieldProps {
	label: string
	placeholder?: string
	rows?: number
	required?: boolean
	hint?: string
}

function TextareaField({
	label,
	placeholder,
	rows = 4,
	required,
	hint
}: TextareaFieldProps) {
	return (
		<GenericField
			type="textarea"
			label={label}
			placeholder={placeholder}
			rows={rows}
			required={required}
			hint={hint}
		/>
	)
}

// =============================================================================
// Form Components
// =============================================================================

interface SubmitButtonProps {
	label: string
	loadingLabel?: string
}

function SubmitButton({
	label,
	loadingLabel = 'Submitting...'
}: SubmitButtonProps) {
	const form = useFormContext()
	// Stay clickable while the form is invalid: a submit attempt then triggers
	// validation and surfaces the errors (reward early, punish late). Gating on
	// canSubmit would leave the button greyed out with no explanation under
	// blur-mode validation. Only disable while a submission is in flight to
	// prevent double-submit.
	return (
		<form.Subscribe selector={state => state.isSubmitting}>
			{isSubmitting => (
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? loadingLabel : label}
				</Button>
			)}
		</form.Subscribe>
	)
}

// =============================================================================
// Create Form Hook
// =============================================================================

export const { useAppForm } = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {
		TextField,
		EmailField,
		PhoneField,
		SelectField,
		TextareaField
	},
	formComponents: {
		SubmitButton
	}
})
