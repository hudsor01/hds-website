'use client'

import { useState, useRef } from 'react'

export default function FloatingTextarea({
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  className = "",
  id,
  rows = 4
}: {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  placeholder: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  rows?: number;
  id?: string;
}) {
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const hasValue = value.length > 0
  const shouldFloat = isFocused || hasValue

  // Simplify nested ternary for label color
  const getLabelColor = () => {
    if (isFocused && shouldFloat) {return 'text-accent'}
    if (shouldFloat) {return 'text-text-secondary'}
    return ''
  }

  return (
    <div className={`relative ${className}`}>
      <textarea
        ref={textareaRef}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false)
          onBlur?.()
        }}
        required={required}
        disabled={disabled}
        rows={rows}
        className={`
          peer w-full px-4 pt-6 pb-2
          bg-muted/50 border rounded-lg
          text-primary-foreground placeholder-transparent resize-none
          transition-all duration-150 ease-in-out
          ${disabled
            ? 'border-border cursor-not-allowed opacity-50'
            : isFocused
              ? 'border-accent ring-2 ring-accent/20 shadow-lg shadow-cyan-500/10'
              : 'border-border hover:border-border'
          }
          focus-ring
        `}
        placeholder={placeholder}
      />
      
      <label
        htmlFor={id}
        className={`
          absolute left-4 transition-all duration-150 ease-in-out pointer-events-none
          ${shouldFloat 
            ? 'top-2 text-xs text-accent'
            : 'top-6 text-base text-text-muted'
          }
          ${getLabelColor()}
        `}
      >
        {placeholder}
        {required && <span className="text-danger ml-1">*</span>}
      </label>

      {/* Character count indicator */}
      {value.length > 0 && (
        <div className="absolute bottom-2 right-4 text-xs text-text-muted">
          {value.length} characters
        </div>
      )}

      {/* Focus ring animation */}
      <div
        className={`
          absolute inset-0 rounded-lg pointer-events-none
          transition-all duration-150 ease-in-out
          ${isFocused
            ? 'ring-1 ring-accent/30'
            : ''
          }
        `}
      />
    </div>
  )
}