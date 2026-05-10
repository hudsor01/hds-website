'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { useMemo } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

function FieldGroup({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="field-group"
			className={cn(
				'group/field-group @container/field-group flex w-full flex-col gap-7 data-[slot=checkbox-group]:gap-3 [&>[data-slot=field-group]]:gap-4',
				className
			)}
			{...props}
		/>
	)
}

const fieldVariants = cva(
	'group/field data-[invalid=true]:text-destructive flex w-full gap-3',
	{
		variants: {
			orientation: {
				vertical: ['flex-col [&>*]:w-full [&>.sr-only]:w-auto'],
				horizontal: [
					'flex-row items-center',
					'[&>[data-slot=field-label]]:flex-auto',
					'has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px has-[>[data-slot=field-content]]:items-start'
				],
				responsive: [
					'@md/field-group:flex-row @md/field-group:items-center @md/field-group:[&>*]:w-auto flex-col [&>*]:w-full [&>.sr-only]:w-auto',
					'@md/field-group:[&>[data-slot=field-label]]:flex-auto',
					'@md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px'
				]
			}
		},
		defaultVariants: {
			orientation: 'vertical'
		}
	}
)

function Field({
	className,
	orientation = 'vertical',
	...props
}: React.ComponentProps<'div'> & VariantProps<typeof fieldVariants>) {
	// Previously had role="group" without an accessible name — ARIA group
	// requires an aria-label/labelledby, and a single-field wrapper has no
	// reason to be a group anyway. Plain <div> is the right semantics; the
	// label/input pair already conveys the relationship.
	return (
		<div
			data-slot="field"
			data-orientation={orientation}
			className={cn(fieldVariants({ orientation }), className)}
			{...props}
		/>
	)
}

function FieldLabel({
	className,
	...props
}: React.ComponentProps<typeof Label>) {
	return (
		<Label
			data-slot="field-label"
			className={cn(
				'group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50',
				'has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border [&>[data-slot=field]]:p-4',
				'has-data-[state=checked]:bg-primary/5 has-data-[state=checked]:border-primary dark:has-data-[state=checked]:bg-primary/10',
				className
			)}
			{...props}
		/>
	)
}

function FieldError({
	className,
	children,
	errors,
	id,
	...props
}: React.ComponentProps<'div'> & {
	errors?: Array<{ message?: string } | string | undefined>
}) {
	const content = useMemo(() => {
		if (children) {
			return children
		}

		if (!errors || errors.length === 0) {
			return null
		}

		// Handle TanStack Form errors (can be string or object with message)
		const getErrorMessage = (
			error: { message?: string } | string | undefined
		): string | undefined => {
			if (!error) {
				return undefined
			}
			if (typeof error === 'string') {
				return error
			}
			return error.message
		}

		if (errors.length === 1) {
			const message = getErrorMessage(errors[0])
			return message || null
		}

		const messages = errors.map(getErrorMessage).filter(Boolean)
		if (messages.length === 0) {
			return null
		}

		return (
			<ul className="ml-4 flex list-disc flex-col gap-1">
				{messages.map((message, index) => (
					<li key={index}>{message}</li>
				))}
			</ul>
		)
	}, [children, errors])

	if (!content) {
		return null
	}

	// `role="alert"` causes screen readers to announce the content
	// immediately. That's only correct when the content describes an
	// actual error — when a consumer passes static helper text via
	// `children`, the alert behaviour is misleading. Apply the role
	// only when the `errors` prop drove the render.
	const isErrorMessage = !!errors && errors.length > 0
	const alertRole = isErrorMessage ? ('alert' as const) : undefined

	return (
		<div
			role={alertRole}
			id={id}
			data-slot="field-error"
			className={cn('text-destructive text-sm font-normal', className)}
			{...props}
		>
			{content}
		</div>
	)
}

export { Field, FieldError, FieldGroup, FieldLabel }
