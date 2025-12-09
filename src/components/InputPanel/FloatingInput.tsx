'use client'

import { useState, useRef } from 'react'

export default function FloatingInput({
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  className = "",
  id,
  autoComplete
}: {
  type?: 'text' | 'email' | 'tel';
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  placeholder: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  autoComplete?: string;
}) {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

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
      <input
        ref={inputRef}
        type={type}
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
        autoComplete={autoComplete}
        className={`
          peer w-full px-4 pt-6 pb-2
          bg-muted/50 border rounded-lg
          text-primary-foreground placeholder-transparent
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
            : 'top-1/2 -translate-y-1/2 text-base text-text-muted'
          }
          ${getLabelColor()}
        `}
      >
        {placeholder}
        {required && <span className="text-danger ml-1">*</span>}
      </label>

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