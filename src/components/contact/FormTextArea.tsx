'use client';

import * as React from 'react';
import { UseFormRegister } from 'react-hook-form';
import { type ContactFormData } from '@/schemas/contact';
import { cva, type VariantProps } from 'class-variance-authority';
// Removed Framer Motion - using CSS animations for performance
import { cn } from '@/lib/utils';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

const textareaVariants = cva(
  'w-full px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 resize-none peer',
  {
    variants: {
      variant: {
        default: 'bg-black/40 border border-gray-600 text-white placeholder-gray-500 focus:ring-cyan-400 focus:border-transparent',
        glass: 'bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:ring-cyan-400/50',
        solid: 'bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:ring-cyan-400',
      },
      size: {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-3 text-base',
        lg: 'px-5 py-4 text-lg',
      },
      state: {
        default: '',
        error: 'border-red-500 focus:ring-red-400',
        success: 'border-green-500 focus:ring-green-400',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      state: 'default',
    },
  }
);

interface FormTextAreaProps extends VariantProps<typeof textareaVariants> {
  label: string;
  name: keyof ContactFormData;
  placeholder?: string;
  required?: boolean;
  error?: string;
  register: UseFormRegister<ContactFormData>;
  rows?: number;
  className?: string;
  icon?: React.ReactNode;
  description?: string;
  maxLength?: number;
}

export function FormTextArea({
  label,
  name,
  placeholder,
  required = false,
  error,
  register,
  rows = 5,
  className = '',
  variant,
  size,
  icon,
  description,
  maxLength
}: FormTextAreaProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  const [charCount, setCharCount] = React.useState(0);
  const fieldState = error ? 'error' : 'default';
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCharCount(e.target.value.length);
  };
  
  return (
    <div className={cn("animate-in fade-in slide-in-from-bottom-2 duration-300", className)}>
      {/* Label */}
      <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      
      {/* Textarea Container */}
      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className="absolute left-3 top-3 text-gray-400 pointer-events-none">
            {icon}
          </div>
        )}
        
        {/* Textarea */}
        <textarea
          {...register(name)}
          id={name}
          rows={rows}
          maxLength={maxLength}
          className={cn(
            textareaVariants({ variant, size, state: fieldState }),
            icon && 'pl-10'
          )}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={handleChange}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${name}-error` : description ? `${name}-description` : undefined}
        />
        
        {/* Character Count */}
        {maxLength && (
          <div 
            className={cn(
              "absolute bottom-2 right-2 text-xs text-gray-500 transition-opacity duration-200",
              isFocused ? "opacity-100" : "opacity-0"
            )}
          >
            {charCount}/{maxLength}
          </div>
        )}
      </div>
      
      {/* Description */}
      {description && !error && (
        <p id={`${name}-description`} className="mt-1 text-xs text-gray-500">
          {description}
        </p>
      )}
      
      {/* Error Message */}
      {error && (
        <p
          id={`${name}-error`}
          className="mt-1 text-sm text-red-400 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200"
        >
          <ExclamationCircleIcon className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}