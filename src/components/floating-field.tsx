'use client'

import { useState, forwardRef } from 'react'
import { cn } from '@/lib/utils'

// Shared styling logic
const useFloatingFieldStyles = (value: string, isFocused: boolean, disabled: boolean, className?: string) => {
  const hasValue = value.length > 0
  const isActive = isFocused || hasValue

  const getLabelColor = () => {
    if (disabled) return 'text-gray-500'
    if (isActive) return 'text-cyan-400'
    return 'text-gray-400'
  }

  const getFieldClasses = () => cn(
    "w-full px-4 py-3 bg-transparent border-2 rounded-lg transition-all duration-200 placeholder-transparent peer",
    "focus:outline-none focus:ring-0",
    disabled
      ? "border-gray-700 text-gray-500 cursor-not-allowed"
      : isActive
        ? "border-cyan-400 text-white"
        : "border-gray-600 text-white hover:border-gray-500",
    className
  )

  const getLabelClasses = () => cn(
    "absolute left-4 transition-all duration-200 pointer-events-none",
    getLabelColor(),
    isActive
      ? "-top-2 text-sm bg-slate-950 px-2"
      : "top-3 text-base"
  )

  return { getFieldClasses, getLabelClasses }
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
  const { getFieldClasses, getLabelClasses } = useFloatingFieldStyles(value, isFocused, disabled, className)

  const handleFocus = () => setIsFocused(true)
  const handleBlur = () => {
    setIsFocused(false)
    onBlur?.()
  }

  return (
    <div className="relative">
      <input
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
        placeholder={placeholder}
        className={getFieldClasses()}
        {...props}
      />

      <label
        htmlFor={id || name}
        className={getLabelClasses()}
      >
        {placeholder}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
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
  const { getFieldClasses, getLabelClasses } = useFloatingFieldStyles(value, isFocused, disabled, className)

  const handleFocus = () => setIsFocused(true)
  const handleBlur = () => {
    setIsFocused(false)
    onBlur?.()
  }

  return (
    <div className="relative">
      <textarea
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
        placeholder={placeholder}
        className={getFieldClasses()}
        {...props}
      />

      <label
        htmlFor={id || name}
        className={getLabelClasses()}
      >
        {placeholder}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
    </div>
  )
})

FloatingTextarea.displayName = 'FloatingTextarea'

// Default export for backward compatibility
export default FloatingInput