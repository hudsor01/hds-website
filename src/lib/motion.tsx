/**
 * Motion Library Stub for Build Stability
 * Replaces framer-motion components with regular HTML elements
 */

import { forwardRef } from 'react';
import type { ComponentProps } from 'react';
import Image from 'next/image';
import type {
  UseScrollReturn,
  UseTransformReturn,
  TransformInput,
  TransformOutput
} from '@/types/motion';

// Inline MotionProps type for React 19
import type { AnimationTarget, TransitionConfig, Variant, ViewportConfig } from '@/types/motion';

type MotionProps = {
  initial?: AnimationTarget;
  animate?: AnimationTarget;
  exit?: AnimationTarget;
  variants?: Record<string, Variant>;
  transition?: TransitionConfig;
  whileHover?: AnimationTarget;
  whileTap?: AnimationTarget;
  whileInView?: AnimationTarget;
  whileDrag?: AnimationTarget;
  whileFocus?: AnimationTarget;
  drag?: boolean | 'x' | 'y';
  dragConstraints?: Record<string, unknown> | HTMLElement | SVGElement;
  dragElastic?: boolean | number;
  dragMomentum?: boolean;
  layoutId?: string;
  layout?: boolean | 'position' | 'size';
  layoutDependency?: React.DependencyList;
  viewport?: ViewportConfig;
  custom?: number | Record<string, string | number | boolean>;
  onDragEnd?: () => void;
};

// Motion props that should be filtered out
const motionProps = [
  'initial', 'animate', 'exit', 'variants', 'transition',
  'whileHover', 'whileTap', 'whileInView', 'whileDrag', 'whileFocus',
  'drag', 'dragConstraints', 'dragElastic', 'dragMomentum',
  'layoutId', 'layout', 'layoutDependency', 'viewport', 'custom', 'onDragEnd'
] as const;

// Helper to filter out motion props
function filterMotionProps<T extends Record<string, unknown>>(props: T): Omit<T, keyof MotionProps> {
  const filtered = { ...props };
  motionProps.forEach(prop => {
    delete filtered[prop as keyof typeof filtered];
  });
  return filtered;
}

// Create motion components that render as regular HTML elements
export const m = {
  div: forwardRef<HTMLDivElement, ComponentProps<'div'> & MotionProps>((props, ref) => 
    <div ref={ref} {...filterMotionProps(props)} />
  ),
  section: forwardRef<HTMLElement, ComponentProps<'section'> & MotionProps>((props, ref) => 
    <section ref={ref} {...filterMotionProps(props)} />
  ),
  h1: forwardRef<HTMLHeadingElement, ComponentProps<'h1'> & MotionProps>((props, ref) => 
    <h1 ref={ref} {...filterMotionProps(props)} />
  ),
  h2: forwardRef<HTMLHeadingElement, ComponentProps<'h2'> & MotionProps>((props, ref) => 
    <h2 ref={ref} {...filterMotionProps(props)} />
  ),
  p: forwardRef<HTMLParagraphElement, ComponentProps<'p'> & MotionProps>((props, ref) => 
    <p ref={ref} {...filterMotionProps(props)} />
  ),
  span: forwardRef<HTMLSpanElement, ComponentProps<'span'> & MotionProps>((props, ref) => 
    <span ref={ref} {...filterMotionProps(props)} />
  ),
  img: forwardRef<HTMLImageElement, ComponentProps<'img'> & MotionProps>((props, ref) => {
    const { src, alt, width, height, ...rest } = props;
    return (
      <Image
        ref={ref as React.Ref<HTMLImageElement>}
        src={(src as string) || ''}
        alt={alt || ''}
        width={(width as number) || 100}
        height={(height as number) || 100}
        {...filterMotionProps(rest)}
      />
    );
  }),
  video: forwardRef<HTMLVideoElement, ComponentProps<'video'> & MotionProps>((props, ref) => 
    <video ref={ref} {...filterMotionProps(props)} />
  ),
  button: forwardRef<HTMLButtonElement, ComponentProps<'button'> & MotionProps>((props, ref) => 
    <button ref={ref} {...filterMotionProps(props)} />
  ),
  blockquote: forwardRef<HTMLQuoteElement, ComponentProps<'blockquote'> & MotionProps>((props, ref) => 
    <blockquote ref={ref} {...filterMotionProps(props)} />
  ),
};

// Add display names for better debugging
m.div.displayName = 'motion.div';
m.section.displayName = 'motion.section';
m.h1.displayName = 'motion.h1';
m.h2.displayName = 'motion.h2';
m.p.displayName = 'motion.p';
m.span.displayName = 'motion.span';
m.img.displayName = 'motion.img';
m.video.displayName = 'motion.video';
m.button.displayName = 'motion.button';
m.blockquote.displayName = 'motion.blockquote';

// Stub motion hooks
export const useScroll = (): UseScrollReturn => ({
  scrollY: { get: () => 0 },
  scrollYProgress: { get: () => 0 },
});

export const useTransform = (_value: UseScrollReturn['scrollY'], _input: TransformInput, output: TransformOutput): UseTransformReturn => {
  // Ensure we never return `undefined` — use a safe fallback so the return type is string | number
  return { get: () => (output[0] ?? 0) };
};
