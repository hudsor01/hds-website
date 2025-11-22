'use client'

import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'

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

  return (
    <div className={cn("relative", className)}>
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
        className={cn(
          "peer w-full px-4 pt-6 pb-2 border rounded-lg text-foreground placeholder-transparent transition-smooth focus-ring",
          "bg-muted-dark/50 dark:bg-muted-dark/50",
          disabled && "border-border-dark cursor-not-allowed opacity-50",
          !disabled && isFocused && "border-secondary ring-2 ring-secondary/20 hover-glow",
          !disabled && !isFocused && "border-border-dark hover:border-muted-foreground-dark"
        )}
        placeholder={placeholder}
      />

      <label
        htmlFor={id}
        className={cn(
          "absolute left-4 pointer-events-none transition-smooth",
          shouldFloat && "top-2 text-xs",
          !shouldFloat && "top-1/2 -translate-y-1/2 text-base",
          isFocused && shouldFloat && "text-secondary",
          !isFocused && shouldFloat && "text-muted-foreground",
          !shouldFloat && "text-muted-foreground-dark"
        )}
      >
        {placeholder}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>

      {/* Focus ring animation */}
      <div
        className={cn(
          "absolute inset-0 rounded-lg pointer-events-none transition-smooth",
          isFocused && "ring-1 ring-secondary/30 ring-offset-1 ring-offset-transparent"
        )}
      />
    </div>
  )
}