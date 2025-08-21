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
  [key: string]: unknown;
}

// Animation target state (permissive for stub implementation)
export interface AnimationTarget {
  x?: number | string | number[];
  y?: number | string | number[];
  scale?: number | number[];
  rotate?: number | number[];
  opacity?: number | number[];
  [key: string]: unknown;
}

// Variant definition (permissive for stub implementation)  
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Variant = AnimationTarget | ((custom?: any) => AnimationTarget);
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

// Motion component props
export interface MotionProps {
  initial?: AnimationTarget | string | boolean;
  animate?: AnimationTarget | string;
  exit?: AnimationTarget | string;
  variants?: Variants;
  transition?: TransitionConfig;
  whileHover?: AnimationTarget | string;
  whileTap?: AnimationTarget | string;
  whileInView?: AnimationTarget | string;
  whileDrag?: AnimationTarget | string;
  whileFocus?: AnimationTarget | string;
  drag?: boolean | 'x' | 'y';
  dragConstraints?: DragConstraints;
  dragElastic?: boolean | number;
  dragMomentum?: boolean;
  layoutId?: string;
  layout?: boolean | 'position' | 'size';
  layoutDependency?: React.DependencyList;
  viewport?: ViewportConfig;
  custom?: Record<string, unknown> | number | string;
  onDragEnd?: () => void;
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