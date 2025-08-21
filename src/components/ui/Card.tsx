"use client";

import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// Consolidated card constants - single source of truth
const BASE_CARD_CLASSES = 'relative rounded-xl transition-all duration-300';

const CARD_VARIANTS = {
  glass: 'bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-xl shadow-black/5',
  solid: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg shadow-black/5',
  gradient: 'bg-gradient-to-br from-gray-900/90 via-black/90 to-gray-900/90 backdrop-blur-sm border border-gray-800/50 shadow-xl shadow-black/10',
  outline: 'bg-transparent border-2 border-gray-800 dark:border-gray-700 hover:border-cyan-400/50',
} as const;

const CARD_SIZES = {
  sm: 'p-4',
  md: 'p-6', 
  lg: 'p-8',
  xl: 'p-10',
} as const;

const HOVER_EFFECTS = {
  none: '',
  lift: 'hover:-translate-y-2 hover:shadow-2xl',
  glow: 'hover:shadow-cyan-500/25 hover:border-cyan-400/50',
  scale: 'hover:scale-[1.02]',
} as const;

// Base card component
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof CARD_VARIANTS;
  size?: keyof typeof CARD_SIZES;
  hover?: keyof typeof HOVER_EFFECTS;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'glass', size = 'md', hover = 'lift', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          BASE_CARD_CLASSES,
          CARD_VARIANTS[variant],
          CARD_SIZES[size],
          HOVER_EFFECTS[hover],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

// Card sub-components with shared classes
const HEADER_CLASSES = 'mb-4';
const TITLE_CLASSES = 'text-2xl font-bold';
const TITLE_GRADIENT_CLASSES = 'bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent';
const TITLE_NORMAL_CLASSES = 'text-white';
const DESCRIPTION_CLASSES = 'text-gray-400 mt-2';
const FOOTER_CLASSES = 'mt-6 pt-6 border-t border-white/10';

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn(HEADER_CLASSES, className)} {...props}>
      {children}
    </div>
  )
);
CardHeader.displayName = "CardHeader";

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  gradient?: boolean;
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, gradient = false, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        TITLE_CLASSES,
        gradient ? TITLE_GRADIENT_CLASSES : TITLE_NORMAL_CLASSES,
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => (
    <p ref={ref} className={cn(DESCRIPTION_CLASSES, className)} {...props}>
      {children}
    </p>
  )
);
CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  )
);
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn(FOOTER_CLASSES, className)} {...props}>
      {children}
    </div>
  )
);
CardFooter.displayName = "CardFooter";

export default Card;