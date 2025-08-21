import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = {
  primary: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 focus:ring-cyan-400 shadow-lg hover:shadow-xl',
  secondary: 'border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white focus:ring-gray-400',
  ghost: 'text-gray-300 hover:bg-gray-800 hover:text-white focus:ring-gray-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-400',
};

const buttonSizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

interface SimpleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const SimpleButton = forwardRef<HTMLButtonElement, SimpleButtonProps>(
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
          // Base styles
          'inline-flex items-center justify-center rounded-lg font-semibold',
          'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transform hover:scale-105 active:scale-95',
          
          // Variant styles
          buttonVariants[variant],
          
          // Size styles  
          buttonSizes[size],
          
          // Full width
          fullWidth && 'w-full',
          
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading...
          </>
        ) : children}
      </button>
    );
  }
);

SimpleButton.displayName = 'SimpleButton';