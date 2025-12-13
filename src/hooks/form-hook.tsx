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
// Generic Field Component
// =============================================================================

interface GenericFieldProps {
  label: string
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea'
  placeholder?: string
  autoComplete?: string
  options?: Array<{ value: string; label: string }>
  rows?: number
}

function GenericField({
  type,
  label,
  placeholder,
  autoComplete,
  options,
  rows = 4
}: GenericFieldProps) {
  const field = useFieldContext<string>()

  const renderField = () => {
    switch(type) {
      case 'email':
        return (
          <Input
            type="email"
            placeholder={placeholder}
            autoComplete={autoComplete || "email"}
            value={field.state.value ?? ''}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        );
      case 'tel':
        return (
          <Input
            type="tel"
            placeholder={placeholder}
            autoComplete={autoComplete || "tel"}
            value={field.state.value ?? ''}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        );
      case 'select':
        return (
          <Select
            value={field.state.value ?? ''}
            onValueChange={(value) => field.handleChange(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'textarea':
        return (
          <Textarea
            placeholder={placeholder}
            rows={rows}
            value={field.state.value ?? ''}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        );
      default: // text
        return (
          <Input
            placeholder={placeholder}
            autoComplete={autoComplete}
            value={field.state.value ?? ''}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        );
    }
  };

  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      {renderField()}
      <FieldError errors={field.state.meta.errors} />
    </Field>
  );
}

// =============================================================================
// Field Components (for backward compatibility)
// =============================================================================

interface TextFieldProps {
  label: string
  placeholder?: string
  autoComplete?: string
}

function TextField({ label, placeholder, autoComplete }: TextFieldProps) {
  return (
    <GenericField
      type="text"
      label={label}
      placeholder={placeholder}
      autoComplete={autoComplete}
    />
  );
}

function EmailField({ label, placeholder }: TextFieldProps) {
  return (
    <GenericField
      type="email"
      label={label}
      placeholder={placeholder}
    />
  );
}

function PhoneField({ label, placeholder }: TextFieldProps) {
  return (
    <GenericField
      type="tel"
      label={label}
      placeholder={placeholder}
    />
  );
}

interface SelectFieldProps {
  label: string
  placeholder?: string
  options: Array<{ value: string; label: string }>
}

function SelectField({ label, placeholder, options }: SelectFieldProps) {
  return (
    <GenericField
      type="select"
      label={label}
      placeholder={placeholder}
      options={options}
    />
  );
}

interface TextareaFieldProps {
  label: string
  placeholder?: string
  rows?: number
}

function TextareaField({ label, placeholder, rows = 4 }: TextareaFieldProps) {
  return (
    <GenericField
      type="textarea"
      label={label}
      placeholder={placeholder}
      rows={rows}
    />
  );
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
    // We could add GenericField here in the future if needed
  },
  formComponents: {
    SubmitButton,
  },
})
