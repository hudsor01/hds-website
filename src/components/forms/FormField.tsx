'use client'

import type { ReactNode } from 'react'

interface FormFieldProps {
  error?: string
  touched?: boolean
  children: ReactNode
}

export function FormField({ error, touched, children }: FormFieldProps) {
  return (
    <div>
      {children}
      {touched && error && (
        <p className="text-destructive-text text-sm mt-1">{error}</p>
      )}
    </div>
  )
}