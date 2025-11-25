'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface Option {
  value: string
  label: string
}

interface CustomSelectProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
  name?: string
  id?: string
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  required = false,
  disabled = false,
  className = "",
  name,
  id
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const selectedOption = options.find(option => option.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setFocusedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) {return}

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
          setFocusedIndex(value ? options.findIndex(option => option.value === value) : 0)
        } else if (focusedIndex >= 0) {
          // Safely handle potential undefined when indexing options
          const focusedOption = options[focusedIndex]
          if (focusedOption) {
            onChange(focusedOption.value)
          }
          setIsOpen(false)
          setFocusedIndex(-1)
        }
        break
      case 'Escape':
        setIsOpen(false)
        setFocusedIndex(-1)
        buttonRef.current?.focus()
        break
      case 'ArrowDown':
        event.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
          setFocusedIndex(value ? options.findIndex(option => option.value === value) : 0)
        } else {
          setFocusedIndex(prev => Math.min(prev + 1, options.length - 1))
        }
        break
      case 'ArrowUp':
        event.preventDefault()
        if (isOpen) {
          setFocusedIndex(prev => Math.max(prev - 1, 0))
        }
        break
      case 'Tab':
        setIsOpen(false)
        setFocusedIndex(-1)
        break
    }
  }

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
    setFocusedIndex(-1)
    buttonRef.current?.focus()
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Hidden input for form submission */}
      <input
        type="hidden"
        name={name}
        value={value}
        required={required}
      />
      
      {/* Custom select button */}
      <button
        ref={buttonRef}
        type="button"
        id={id}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          relative w-full px-4 py-3 text-left
          bg-gray-800/50 border rounded-lg
          transition-all duration-200 ease-in-out
          ${disabled 
            ? 'border-gray-700 cursor-not-allowed opacity-50' 
            : isOpen
              ? 'border-cyan-400 ring-2 ring-cyan-400/20 shadow-lg shadow-cyan-500/10'
              : 'border-gray-600 hover:border-gray-500 focus-ring'
          }
          ${!selectedOption?.value ? 'text-text-muted' : 'text-text-inverted'}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={id ? `${id}-label` : undefined}
      >
        <span className="block truncate">
          {selectedOption?.label || placeholder}
        </span>
        
        <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown
            className={`w-5 h-5 text-text-muted transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </span>
      </button>

      {/* Dropdown options */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 glass-card shadow-xl shadow-black/20">
          <div
            className="py-1 max-h-60 overflow-auto scrollbar-hide"
            role="listbox"
            aria-labelledby={id ? `${id}-label` : undefined}
          >
            {options.map((option, index) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleOptionClick(option.value)}
                className={`
                  relative w-full px-4 py-3 text-left transition-colors duration-150
                  ${index === focusedIndex 
                    ? 'bg-cyan-600/20 text-cyan-400/80'
                    : 'text-text-inverted hover:bg-bg-tertiary-dark/50'
                  }
                  ${option.value === value ? 'bg-cyan-600/10' : ''}
                `}
                role="option"
                aria-selected={option.value === value}
                onMouseEnter={() => setFocusedIndex(index)}
              >
                <span className={`block truncate ${option.value === value ? 'font-medium' : ''}`}>
                  {option.label}
                </span>
                
                {option.value === value && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <Check className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}