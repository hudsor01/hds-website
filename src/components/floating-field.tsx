'use client'

import { useState, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

// Shared styling logic for floating labels
const useFloatingLabelStyles = (value: string, isFocused: boolean, disabled: boolean) => {
  const hasValue = value.length > 0
  const isActive = isFocused || hasValue

  const getLabelColor = () => {
    if (disabled) {return 'text-muted-foreground'}
    if (isActive) {return 'text-cyan-400'}
    return 'text-muted-foreground'
  }

  const getLabelClasses = () => cn(
    "absolute left-3 transition-all duration-200 pointer-events-none",
    getLabelColor(),
    isActive
      ? "-top-2 text-xs bg-background px-1"
      : "top-3 text-sm"
  )

  return { getLabelClasses, isActive }
}

// Floating Input Component
interface FloatingInputProps {
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: () => void
  placeholder: string
  type?: 'text' | 'email' | 'tel'
  autoComplete?: string
  required?: boolean
  disabled?: boolean
  className?: string
  id?: string
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(({
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  type = 'text',
  autoComplete,
  required = false,
  disabled = false,
  className = "",
  id,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false)
  const { getLabelClasses, isActive } = useFloatingLabelStyles(value, isFocused, disabled)

  const handleFocus = () => setIsFocused(true)
  const handleBlur = () => {
    setIsFocused(false)
    onBlur?.()
  }

  return (
    <div className="relative">
      <Input
        ref={ref}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        type={type}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        id={id || name}
        placeholder=" "
        className={cn(
          "pt-4 pb-2",
          isActive && "border-cyan-400",
          className
        )}
        {...props}
      />

      <Label
        htmlFor={id || name}
        className={getLabelClasses()}
      >
        {placeholder}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
    </div>
  )
})

FloatingInput.displayName = 'FloatingInput'

// Floating Textarea Component
interface FloatingTextareaProps {
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onBlur?: () => void
  placeholder: string
  rows?: number
  required?: boolean
  disabled?: boolean
  className?: string
  id?: string
}

export const FloatingTextarea = forwardRef<HTMLTextAreaElement, FloatingTextareaProps>(({
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  rows = 4,
  required = false,
  disabled = false,
  className = "",
  id,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false)
  const { getLabelClasses, isActive } = useFloatingLabelStyles(value, isFocused, disabled)

  const handleFocus = () => setIsFocused(true)
  const handleBlur = () => {
    setIsFocused(false)
    onBlur?.()
  }

  return (
    <div className="relative">
      <Textarea
        ref={ref}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        rows={rows}
        required={required}
        disabled={disabled}
        id={id || name}
        placeholder=" "
        className={cn(
          "pt-6 pb-2 resize-none",
          isActive && "border-cyan-400",
          className
        )}
        {...props}
      />

      <Label
        htmlFor={id || name}
        className={getLabelClasses()}
      >
        {placeholder}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
    </div>
  )
})

FloatingTextarea.displayName = 'FloatingTextarea'

// Default export for backward compatibility
export default FloatingInput