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
    if (isFocused && shouldFloat) {return 'text-cyan-400'}
    if (shouldFloat) {return 'text-gray-300'}
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
          bg-gray-800/50 border rounded-lg
          text-white placeholder-transparent resize-none
          transition-all duration-200 ease-in-out
          ${disabled
            ? 'border-gray-700 cursor-not-allowed opacity-50'
            : isFocused
              ? 'border-cyan-400 ring-2 ring-cyan-400/20 shadow-lg shadow-cyan-500/10'
              : 'border-gray-600 hover:border-gray-500'
          }
          focus-ring
        `}
        placeholder={placeholder}
      />
      
      <label
        htmlFor={id}
        className={`
          absolute left-4 transition-all duration-200 ease-in-out pointer-events-none
          ${shouldFloat 
            ? 'top-2 text-xs text-cyan-400' 
            : 'top-6 text-base text-gray-400'
          }
          ${getLabelColor()}
        `}
      >
        {placeholder}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>

      {/* Character count indicator */}
      {value.length > 0 && (
        <div className="absolute bottom-2 right-4 text-xs text-gray-400">
          {value.length} characters
        </div>
      )}

      {/* Focus ring animation */}
      <div
        className={`
          absolute inset-0 rounded-lg pointer-events-none
          transition-all duration-200 ease-in-out
          ${isFocused 
            ? 'ring-1 ring-cyan-400/30 ring-offset-1 ring-offset-transparent' 
            : ''
          }
        `}
      />
    </div>
  )
}