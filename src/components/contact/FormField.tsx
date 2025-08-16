'use client';

import * as React from 'react';
import { UseFormRegister } from 'react-hook-form';
import { type ContactFormData } from '@/schemas/contact';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

const fieldVariants = cva(
  'w-full px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 peer',
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

interface FormFieldProps extends VariantProps<typeof fieldVariants> {
  label: string;
  name: keyof ContactFormData;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  register: UseFormRegister<ContactFormData>;
  className?: string;
  icon?: React.ReactNode;
  description?: string;
}

export function FormField({
  label,
  name,
  type = 'text',
  required = false,
  error,
  register,
  className = '',
  variant,
  size,
  icon,
  description
}: FormFieldProps) {
  const fieldState = error ? 'error' : 'default';
  
  return (
    <div className={cn("opacity-0 translate-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300", className)}>
      {/* Floating Label */}
      <div className="relative">
        <input
          {...register(name)}
          type={type}
          id={name}
          className={cn(
            fieldVariants({ variant, size, state: fieldState }),
            icon && 'pl-10',
            'peer'
          )}
          placeholder=" "
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${name}-error` : description ? `${name}-description` : undefined}
        />
        
        {/* Floating Label */}
        <label 
          htmlFor={name} 
          className={cn(
            'absolute left-4 transition-all duration-200 pointer-events-none',
            'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2',
            'peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:px-1 peer-focus:bg-gray-900',
            'peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:bg-gray-900',
            error ? 'text-red-400' : 'text-gray-400 peer-focus:text-cyan-400'
          )}
        >
          {label} {required && <span className="text-red-400">*</span>}
        </label>
        
        {/* Icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
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