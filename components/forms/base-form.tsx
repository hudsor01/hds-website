'use client'

import type { ReactNode } from 'react'
import type { FieldValues, UseFormReturn } from 'react-hook-form'
import type { Variant } from '@/types/enum-types'
import { Form } from '@/components/ui/form'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface BaseFormProps<T extends FieldValues> {
  form: UseFormReturn<T>
  onSubmit: (formData: T) => Promise<void> | void
  children: ReactNode
  className?: string
  title?: string
  description?: string
  footer?: ReactNode
  isCard?: boolean
  loadingMessage?: string
  successMessage?: string
  variant?: Variant | 'filled'
  darkMode?: boolean
}

/**
 * Base form component
 *
 * This component provides a consistent base for all forms in the application.
 * It handles the form container, header, and layout, while allowing custom content.
 */
export function BaseForm<T extends FieldValues>({
  form,
  onSubmit,
  children,
  className,
  title,
  description,
  footer,
  isCard = true,
  variant = 'default',
  darkMode = false,
}: BaseFormProps<T>) {
  // Determine styling based on variant and dark mode
  const getStyles = () => {
    // Base styles for different variants
    const variantStyles = {
      default: darkMode
        ? 'border-gray-700 bg-gray-800'
        : 'border-gray-200 bg-white',
      filled: darkMode
        ? 'bg-gray-800 border-gray-700'
        : 'bg-gray-50 border-gray-200',
      outline: darkMode
        ? 'border-gray-600 bg-transparent'
        : 'border-gray-200 bg-transparent',
      ghost: 'border-transparent bg-transparent',
    }

    // Text colors based on dark mode
    const textStyles = darkMode ? 'text-white' : 'text-gray-900'

    // Input styles based on dark mode
    const inputStyles = darkMode
      ? 'bg-gray-700 border-gray-600 text-white'
      : 'bg-white border-gray-200 text-gray-900'

    return {
      container: cn('rounded-lg', variantStyles[variant]),
      text: textStyles,
      input: inputStyles,
    }
  }

  const styles = getStyles()

  // Render as Card if isCard is true
  if (isCard) {
    return (
      <Card className={cn(styles.container, className)}>
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle className={styles.text}>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              {children}
            </form>
          </Form>
        </CardContent>
        {footer && <CardFooter>{footer}</CardFooter>}
      </Card>
    )
  }

  // Render as regular div if isCard is false
  return (
    <div className={cn('space-y-6', className)}>
      {(title || description) && (
        <div className='space-y-2'>
          {title && (
            <h3 className={cn('text-xl font-bold', styles.text)}>{title}</h3>
          )}
          {description && (
            <p className='text-muted-foreground'>{description}</p>
          )}
        </div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          {children}
        </form>
      </Form>
      {footer && <div className='pt-4'>{footer}</div>}
    </div>
  )
}
