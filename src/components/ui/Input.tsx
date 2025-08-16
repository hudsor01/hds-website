'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const inputVariants = cva(
  'w-full px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 peer',
  {
    variants: {
      variant: {
        default: 'bg-black/40 border border-gray-600 text-white placeholder-gray-500 focus:ring-cyan-400 focus:border-transparent',
        glass: 'bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:ring-cyan-400/50',
        solid: 'bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:ring-cyan-400',
        outline: 'bg-transparent border-2 border-gray-600 text-white placeholder-gray-500 focus:ring-cyan-400 focus:border-cyan-400',
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
        warning: 'border-yellow-500 focus:ring-yellow-400',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      state: 'default',
    },
  }
);

const labelVariants = cva(
  'absolute left-4 transition-all duration-200 pointer-events-none',
  {
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
      floating: {
        true: 'top-0 -translate-y-1/2 text-xs px-1 bg-gray-900',
        false: 'top-1/2 -translate-y-1/2',
      },
    },
    defaultVariants: {
      size: 'md',
      floating: false,
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  floatingLabel?: boolean;
  showState?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className,
    variant,
    size,
    state: propState,
    label,
    error,
    success,
    helperText,
    icon,
    iconPosition = 'left',
    floatingLabel = true,
    showState = true,
    type = 'text',
    id,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);
    const generatedId = React.useId();
    const inputId = id || generatedId;
    
    // Determine state based on error/success props
    const state = error ? 'error' : success ? 'success' : propState || 'default';
    
    const handleFocus = () => setIsFocused(true);
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(!!e.target.value);
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      if (props.onChange) {
        props.onChange(e);
      }
    };

    return (
      <motion.div 
        className="relative"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Floating Label */}
        {label && floatingLabel && (
          <motion.label
            htmlFor={inputId}
            className={cn(
              labelVariants({ 
                size, 
                floating: isFocused || hasValue || !!props.value || !!props.defaultValue 
              }),
              state === 'error' && 'text-red-400',
              state === 'success' && 'text-green-400',
              state === 'default' && (isFocused || hasValue) && 'text-cyan-400',
              state === 'default' && !isFocused && !hasValue && 'text-gray-400'
            )}
          >
            {label} {props.required && <span className="text-red-400">*</span>}
          </motion.label>
        )}
        
        {/* Static Label */}
        {label && !floatingLabel && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-300 mb-2">
            {label} {props.required && <span className="text-red-400">*</span>}
          </label>
        )}
        
        <div className="relative">
          {/* Left Icon */}
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {icon}
            </div>
          )}
          
          {/* Input Field */}
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={cn(
              inputVariants({ variant, size, state }),
              icon && iconPosition === 'left' && 'pl-10',
              icon && iconPosition === 'right' && 'pr-10',
              showState && state !== 'default' && 'pr-10',
              className
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            aria-invalid={state === 'error' ? 'true' : 'false'}
            aria-describedby={
              error ? `${inputId}-error` : 
              success ? `${inputId}-success` : 
              helperText ? `${inputId}-helper` : 
              undefined
            }
            {...props}
          />
          
          {/* Right Icon or State Icon */}
          {showState && state !== 'default' && !icon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {state === 'error' && (
                <ExclamationCircleIcon className="w-5 h-5 text-red-400" />
              )}
              {state === 'success' && (
                <CheckCircleIcon className="w-5 h-5 text-green-400" />
              )}
            </div>
          )}
          
          {icon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {icon}
            </div>
          )}
        </div>
        
        {/* Helper Text / Error / Success Messages */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              id={`${inputId}-error`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-1 text-sm text-red-400 flex items-center gap-1"
            >
              <ExclamationCircleIcon className="w-4 h-4" />
              {error}
            </motion.p>
          )}
          
          {success && !error && (
            <motion.p
              id={`${inputId}-success`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-1 text-sm text-green-400 flex items-center gap-1"
            >
              <CheckCircleIcon className="w-4 h-4" />
              {success}
            </motion.p>
          )}
          
          {helperText && !error && !success && (
            <motion.p
              id={`${inputId}-helper`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-1 text-sm text-gray-500"
            >
              {helperText}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };