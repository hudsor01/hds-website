'use client'

import { useState, useRef } from 'react'

interface FloatingInputProps {
  type?: 'text' | 'email' | 'tel'
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string
  required?: boolean
  disabled?: boolean
  className?: string
  id?: string
  autoComplete?: string
}

export default function FloatingInput({
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className = "",
  id,
  autoComplete
}: FloatingInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const hasValue = value.length > 0
  const shouldFloat = isFocused || hasValue

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
        onBlur={() => setIsFocused(false)}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        className={`
          peer w-full px-4 pt-6 pb-2 
          bg-gray-800/50 border rounded-lg
          text-white placeholder-transparent
          transition-all duration-200 ease-in-out
          ${disabled 
            ? 'border-gray-700 cursor-not-allowed opacity-50' 
            : isFocused
              ? 'border-cyan-400 ring-2 ring-cyan-400/20 shadow-lg shadow-cyan-500/10'
              : 'border-gray-600 hover:border-gray-500'
          }
          focus:outline-none
        `}
        placeholder={placeholder}
      />
      
      <label
        htmlFor={id}
        className={`
          absolute left-4 transition-all duration-200 ease-in-out pointer-events-none
          ${shouldFloat 
            ? 'top-2 text-xs text-cyan-400' 
            : 'top-1/2 -translate-y-1/2 text-base text-gray-400'
          }
          ${isFocused && shouldFloat ? 'text-cyan-400' : shouldFloat ? 'text-gray-300' : ''}
        `}
      >
        {placeholder}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>

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