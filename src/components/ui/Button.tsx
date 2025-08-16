'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, AnimatePresence, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-black hover:from-cyan-600 hover:to-cyan-700 focus:ring-cyan-400 shadow-lg hover:shadow-xl transform hover:scale-105',
        secondary: 'border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black focus:ring-cyan-400 backdrop-blur-md',
        ghost: 'text-gray-300 hover:bg-gray-800 hover:text-white focus:ring-gray-400',
        danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-400 shadow-lg hover:shadow-xl',
        success: 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 focus:ring-green-400 shadow-lg hover:shadow-xl',
        outline: 'border border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white focus:ring-gray-400',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-12 px-6 text-base',
        lg: 'h-14 px-8 text-lg',
        xl: 'h-16 px-10 text-xl',
        icon: 'h-10 w-10',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

type BaseButtonProps = {
  children: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  ripple?: boolean;
};

export type ButtonProps = BaseButtonProps & 
  VariantProps<typeof buttonVariants> & 
  Omit<HTMLMotionProps<'button'>, keyof BaseButtonProps>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth,
    loading = false,
    loadingText = 'Loading...',
    icon,
    iconPosition = 'left',
    ripple = true,
    children,
    disabled,
    onClick,
    ...props 
  }, ref) => {
    const [isPressed, setIsPressed] = React.useState(false);
    const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; id: number }>>([]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple && !disabled && !loading) {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const newRipple = { x, y, id: Date.now() };
        
        setRipples(prev => [...prev, newRipple]);
        
        // Remove ripple after animation
        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== newRipple.id));
        }, 600);
      }
      
      if (onClick && !disabled && !loading) {
        onClick(e);
      }
    };

    return (
      <motion.button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        disabled={disabled || loading}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        onClick={handleClick}
        whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
        whileHover={!disabled && !loading && variant === 'primary' ? { scale: 1.02 } : {}}
        {...props}
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              {loadingText}
            </motion.div>
          ) : (
            <motion.span
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              {icon && iconPosition === 'left' && (
                <span className="inline-flex">{icon}</span>
              )}
              {children}
              {icon && iconPosition === 'right' && (
                <span className="inline-flex">{icon}</span>
              )}
            </motion.span>
          )}
        </AnimatePresence>
        
        {/* Ripple Effect */}
        {ripple && (
          <AnimatePresence>
            {ripples.map(ripple => (
              <motion.span
                key={ripple.id}
                className="absolute bg-white/30 rounded-full pointer-events-none"
                style={{
                  left: ripple.x,
                  top: ripple.y,
                  transform: 'translate(-50%, -50%)',
                }}
                initial={{ width: 0, height: 0, opacity: 1 }}
                animate={{ width: 300, height: 300, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            ))}
          </AnimatePresence>
        )}
        
        {/* Pressed Overlay */}
        <motion.div
          className="absolute inset-0 bg-white/10 rounded-lg pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isPressed ? 1 : 0 }}
          transition={{ duration: 0.1 }}
        />
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };