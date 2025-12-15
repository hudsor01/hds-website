/**
 * TanStack Form Hook with Pre-bound Field Components
 * Provides useAppForm with TextField, EmailField, SelectField, etc.
 */

'use client'

import { createFormHook } from '@tanstack/react-form'
import { fieldContext, formContext, useFieldContext, useFormContext } from './form-context'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'

// Re-export useFieldContext for external use
export { useFieldContext }

// =============================================================================
// Field Components
// =============================================================================

interface TextFieldProps {
  label: string
  placeholder?: string
  autoComplete?: string
}

function TextField({ label, placeholder, autoComplete }: TextFieldProps) {
  const field = useFieldContext<string>()
  const fieldId = `field-${field.name}`
  return (
    <Field>
      <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
      <Input
        id={fieldId}
        name={field.name}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={field.state.value ?? ''}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      <FieldError errors={field.state.meta.errors} />
    </Field>
  )
}

function EmailField({ label, placeholder }: TextFieldProps) {
  const field = useFieldContext<string>()
  const fieldId = `field-${field.name}`
  return (
    <Field>
      <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
      <Input
        id={fieldId}
        name={field.name}
        type="email"
        placeholder={placeholder}
        autoComplete="email"
        value={field.state.value ?? ''}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      <FieldError errors={field.state.meta.errors} />
    </Field>
  )
}

function PhoneField({ label, placeholder }: TextFieldProps) {
  const field = useFieldContext<string>()
  const fieldId = `field-${field.name}`
  return (
    <Field>
      <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
      <Input
        id={fieldId}
        name={field.name}
        type="tel"
        placeholder={placeholder}
        autoComplete="tel"
        value={field.state.value ?? ''}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      <FieldError errors={field.state.meta.errors} />
    </Field>
  )
}

interface SelectFieldProps {
  label: string
  placeholder?: string
  options: Array<{ value: string; label: string }>
}

function SelectField({ label, placeholder, options }: SelectFieldProps) {
  const field = useFieldContext<string>()
  const fieldId = `field-${field.name}`
  return (
    <Field>
      <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
      <Select
        name={field.name}
        value={field.state.value ?? ''}
        onValueChange={(value) => field.handleChange(value)}
      >
        <SelectTrigger id={fieldId}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError errors={field.state.meta.errors} />
    </Field>
  )
}

interface TextareaFieldProps {
  label: string
  placeholder?: string
  rows?: number
}

function TextareaField({ label, placeholder, rows = 4 }: TextareaFieldProps) {
  const field = useFieldContext<string>()
  const fieldId = `field-${field.name}`
  return (
    <Field>
      <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
      <Textarea
        id={fieldId}
        name={field.name}
        placeholder={placeholder}
        rows={rows}
        value={field.state.value ?? ''}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      <FieldError errors={field.state.meta.errors} />
    </Field>
  )
}

// =============================================================================
// Form Components
// =============================================================================

interface SubmitButtonProps {
  label: string
  loadingLabel?: string
}

function SubmitButton({ label, loadingLabel = 'Submitting...' }: SubmitButtonProps) {
  const form = useFormContext()
  return (
    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
      {(result) => {
        const [canSubmit, isSubmitting] = result
        return (
          <Button type="submit" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? loadingLabel : label}
          </Button>
        )
      }}
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
    TextareaField,
  },
  formComponents: {
    SubmitButton,
  },
})
