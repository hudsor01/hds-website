'use client';

import { m } from 'framer-motion';
import type { ReactNode } from 'react';
import { textAnimations, transitions } from '@/lib/design-system';
import { cn } from '@/lib/utils';

interface AnimatedTextProps {
  children: ReactNode
  className?: string
  delay?: number
  gradient?: boolean
  variant?: 'heading' | 'paragraph' | 'highlight'
}

/**
 * Animated text component with various animation options
 *
 * This component provides text animations with customizable variants and delay.
 * It supports gradient text and different animation patterns based on the variant.
 */
export function AnimatedText({
  children,
  className = '',
  delay = 0,
  gradient = false,
  variant = 'paragraph',
}: AnimatedTextProps) {
  const gradientClass = gradient
    ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400'
    : '';

  return (
    <m.span
      className={cn(className, gradientClass)}
      initial='hidden'
      animate='visible'
      variants={textAnimations[variant]}
      transition={{
        ...transitions.smooth,
        delay,
      }}
    >
      {children}
    </m.span>
  );
}

/**
 * Animated heading component with emphasis effect
 *
 * This component is specifically designed for headings with a more
 * pronounced animation effect and optional gradient text.
 */
export function AnimatedHeading({
  children,
  className = '',
  delay = 0,
  gradient = true,
  variant = 'heading',
}: AnimatedTextProps) {
  const gradientClass = gradient
    ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300'
    : '';

  return (
    <m.h2
      className={cn(className, gradientClass)}
      initial='hidden'
      animate='visible'
      variants={textAnimations[variant]}
      transition={{
        ...transitions.smooth,
        delay,
      }}
    >
      {children}
    </m.h2>
  );
}
