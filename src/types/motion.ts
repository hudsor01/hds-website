/**
 * Motion Animation Type Definitions
 * Types for animation library (framer-motion stub)
 */

// Animation value types (permissive for stub implementation)
export type AnimationValue = string | number | boolean | null | number[] | string[];

// Transition configuration (permissive for stub implementation)
export interface TransitionConfig {
  duration?: number;
  delay?: number;
  ease?: string | number[];
  type?: 'spring' | 'tween' | 'inertia';
  stiffness?: number;
  damping?: number;
  mass?: number;
  velocity?: number;
  repeat?: number;
  repeatType?: 'loop' | 'reverse' | 'mirror';
  repeatDelay?: number;
  times?: number[];
  when?: string;
  staggerChildren?: number;
  delayChildren?: number;
  x?: { type?: string; stiffness?: number; damping?: number; duration?: number; };
  opacity?: { type?: string; stiffness?: number; damping?: number; duration?: number; };
  scale?: { type?: string; stiffness?: number; damping?: number; duration?: number; };
}

// Animation target state (permissive for stub implementation)
export interface AnimationTarget {
  x?: number | string | number[];
  y?: number | string | number[];
  scale?: number | number[];
  rotate?: number | number[];
  opacity?: number | number[];
  translateX?: number | string;
  translateY?: number | string;
  translateZ?: number | string;
  rotateX?: number | string;
  rotateY?: number | string;
  rotateZ?: number | string;
  scaleX?: number;
  scaleY?: number;
  scaleZ?: number;
  skewX?: number | string;
  skewY?: number | string;
  backgroundColor?: string;
  background?: string;
  color?: string;
  borderRadius?: number | string;
  boxShadow?: string;
  filter?: string;
  backdropFilter?: string;
  zIndex?: number;
  transformOrigin?: string;
  transformStyle?: string;
  transition?: TransitionConfig;
}

// Variant definition (permissive for stub implementation)
export type Variant = AnimationTarget | ((custom?: number | Record<string, string | number | boolean>) => AnimationTarget);
export type Variants = Record<string, Variant>;

// Drag constraints
export interface DragConstraints {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}

// Viewport configuration
export interface ViewportConfig {
  once?: boolean;
  amount?: number | 'all' | 'some';
  margin?: string;
}


// Scroll hook return type
export interface ScrollMotionValue {
  get: () => number;
}

export interface UseScrollReturn {
  scrollY: ScrollMotionValue;
  scrollYProgress: ScrollMotionValue;
}

// Transform hook types
export type TransformInput = number[];
export type TransformOutput = (string | number)[];

export interface UseTransformReturn {
  get: () => string | number;
}