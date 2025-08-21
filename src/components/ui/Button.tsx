'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { LoadingInline } from './loading';

// Consolidated button constants - single source of truth
const BASE_BUTTON_CLASSES = 'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95';

const BUTTON_VARIANTS = {
  primary: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 focus:ring-cyan-400 shadow-lg hover:shadow-xl',
  secondary: 'border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white focus:ring-gray-400',
  ghost: 'text-gray-300 hover:bg-gray-800 hover:text-white focus:ring-gray-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-400',
  success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-400',
} as const;

const BUTTON_SIZES = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base', 
  lg: 'px-8 py-4 text-lg',
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof BUTTON_VARIANTS;
  size?: keyof typeof BUTTON_SIZES;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md',
    loading = false,
    fullWidth = false,
    disabled,
    children,
    ...props 
  }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          BASE_BUTTON_CLASSES,
          BUTTON_VARIANTS[variant],
          BUTTON_SIZES[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <LoadingInline /> : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;