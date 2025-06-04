'use client'

import type { InputHTMLAttributes, ReactNode } from 'react'
import type {
  FieldValues,
  UseFormReturn,
  FieldPath,
} from 'react-hook-form'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

// Base props for all form fields
interface BaseFieldProps<T extends FieldValues, K extends FieldPath<T>> {
  form: UseFormReturn<T>
  name: K
  label?: string
  description?: string
  required?: boolean
  className?: string
  darkMode?: boolean
  fullWidth?: boolean
}

// Text field props
interface TextFieldProps<T extends FieldValues, K extends FieldPath<T>>
  extends BaseFieldProps<T, K>,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'name'> {
  placeholder?: string
  type?: string
}

/**
 * Text input field component
 *
 * This component provides a consistent input field with validation and error handling.
 */
export function TextField<T extends FieldValues, K extends FieldPath<T>>({
  form,
  name,
  label,
  description,
  required = false,
  className,
  darkMode = false,
  fullWidth = true,
  placeholder,
  type = 'text',
  ...props
}: TextFieldProps<T, K>) {
  const inputClass = darkMode ? 'bg-gray-800 border-gray-700' : ''

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn(fullWidth ? 'w-full' : '', className)}>
          {label && (
            <FormLabel className={darkMode ? 'text-gray-200' : ''}>
              {label}
              {required && <span className='text-red-500 ml-1'>*</span>}
            </FormLabel>
          )}
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              className={inputClass}
              {...field}
              {...props}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// Textarea field props
interface TextareaFieldProps<T extends FieldValues, K extends FieldPath<T>>
  extends BaseFieldProps<T, K> {
  placeholder?: string
  rows?: number
}

/**
 * Textarea field component
 *
 * This component provides a consistent textarea field with validation and error handling.
 */
export function TextareaField<T extends FieldValues, K extends FieldPath<T>>({
  form,
  name,
  label,
  description,
  required = false,
  className,
  darkMode = false,
  fullWidth = true,
  placeholder,
  rows = 4,
}: TextareaFieldProps<T, K>) {
  const textareaClass = darkMode ? 'bg-gray-800 border-gray-700' : ''

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn(fullWidth ? 'w-full' : '', className)}>
          {label && (
            <FormLabel className={darkMode ? 'text-gray-200' : ''}>
              {label}
              {required && <span className='text-red-500 ml-1'>*</span>}
            </FormLabel>
          )}
          <FormControl>
            <Textarea
              placeholder={placeholder}
              className={cn(textareaClass, 'min-h-[120px]')}
              rows={rows}
              {...field}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// Select field props
interface SelectFieldProps<T extends FieldValues, K extends FieldPath<T>>
  extends BaseFieldProps<T, K> {
  placeholder?: string
  options: { label: string; value: string }[]
}

/**
 * Select field component
 *
 * This component provides a consistent select field with validation and error handling.
 */
export function SelectField<T extends FieldValues, K extends FieldPath<T>>({
  form,
  name,
  label,
  description,
  required = false,
  className,
  darkMode = false,
  fullWidth = true,
  placeholder = 'Select an option',
  options,
}: SelectFieldProps<T, K>) {
  const selectClass = darkMode ? 'bg-gray-800 border-gray-700' : ''

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn(fullWidth ? 'w-full' : '', className)}>
          {label && (
            <FormLabel className={darkMode ? 'text-gray-200' : ''}>
              {label}
              {required && <span className='text-red-500 ml-1'>*</span>}
            </FormLabel>
          )}
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger className={selectClass}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// Checkbox field props
interface CheckboxFieldProps<T extends FieldValues, K extends FieldPath<T>>
  extends BaseFieldProps<T, K> {
  checkboxLabel: string
}

/**
 * Checkbox field component
 *
 * This component provides a consistent checkbox field with validation and error handling.
 */
export function CheckboxField<T extends FieldValues, K extends FieldPath<T>>({
  form,
  name,
  checkboxLabel,
  description,
  required = false,
  className,
  darkMode = false,
  fullWidth = true,
}: CheckboxFieldProps<T, K>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn(
            'flex flex-row items-start space-x-3 space-y-0 rounded-md p-4',
            darkMode ? 'bg-gray-800/50' : 'bg-gray-50',
            fullWidth ? 'w-full' : '',
            className,
          )}
        >
          <FormControl>
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
          <div className='space-y-1 leading-none'>
            <FormLabel
              className={cn(
                'text-sm font-medium leading-none',
                darkMode ? 'text-gray-200' : '',
              )}
            >
              {checkboxLabel}
              {required && <span className='text-red-500 ml-1'>*</span>}
            </FormLabel>
            {description && <FormDescription>{description}</FormDescription>}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// Form row component props
interface FormRowProps {
  children: ReactNode
  className?: string
  columns?: number
}

/**
 * Form row component
 *
 * This component provides a consistent layout for form fields in a row.
 */
export function FormRow({ children, className, columns = 2 }: FormRowProps) {
  return (
    <div
      className={cn(
        'grid gap-6',
        columns === 1 && 'grid-cols-1',
        columns === 2 && 'grid-cols-1 md:grid-cols-2',
        columns === 3 && 'grid-cols-1 md:grid-cols-3',
        className,
      )}
    >
      {children}
    </div>
  )
}
