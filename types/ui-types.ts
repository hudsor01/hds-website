/**
 * UI Component Types
 * 
 * Type definitions for UI components, animations, and visual elements.
 * Organized by component categories for better maintainability.
 */

import type { ReactNode, ReactElement, ComponentProps, JSX, ErrorInfo } from 'react'
import { AnimationType, Size, Variant, ContainerWidth, ColorTheme } from './enum-types'

// ============= Base Component Types =============

/**
 * Common props shared by most components
 */
export interface BaseComponentProps {
  className?: string
  children?: ReactNode
  id?: string
  'data-testid'?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
}


/**
 * Props for components that support variants
 */
export interface VariantProps {
  variant?: Variant
  size?: Size
}

/**
 * Props for interactive components
 */
export interface InteractiveProps {
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  onFocus?: () => void
  onBlur?: () => void
}

// ============= Layout Component Types =============

/**
 * Section component properties
 */
export interface SectionProps extends BaseComponentProps {
  variant?: 'default' | 'dark' | 'accent' | 'gradient' | 'light'
  containerWidth?: ContainerWidth
  padding?: 'none' | 'small' | 'default' | 'large'
  title?: string
  subtitle?: string
  titleAlignment?: 'left' | 'center' | 'right'
  backgroundImage?: string
  backgroundColor?: string
  fullHeight?: boolean
}

/**
 * Container component properties
 */
export interface ContainerProps extends BaseComponentProps {
  width?: ContainerWidth
  centered?: boolean
  padding?: boolean
  as?: keyof JSX.IntrinsicElements
}

/**
 * Grid system properties
 */
export interface GridProps extends BaseComponentProps {
  columns?: number | { sm?: number; md?: number; lg?: number; xl?: number }
  gap?: 'none' | 'small' | 'default' | 'large'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  responsive?: boolean
}

/**
 * Flex layout properties
 */
export interface FlexProps extends BaseComponentProps {
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse'
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  wrap?: boolean
  gap?: 'none' | 'small' | 'default' | 'large'
  responsive?: boolean
}

// ============= Animation Component Types =============

/**
 * Base animation properties
 */
export interface AnimationProps {
  animation?: AnimationType
  delay?: number
  duration?: number
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out'
  repeat?: boolean | number
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
}

/**
 * Animated section properties
 */
export interface AnimatedSectionProps extends SectionProps, AnimationProps {
  threshold?: number // Intersection observer threshold
  triggerOnce?: boolean
  stagger?: boolean
  staggerDelay?: number
}

/**
 * Motion wrapper properties
 */
export interface MotionWrapperProps extends BaseComponentProps, AnimationProps {
  as?: keyof JSX.IntrinsicElements
  threshold?: number
  triggerOnce?: boolean
  disabled?: boolean
}

/**
 * Stagger animation properties
 */
export interface StaggerAnimationProps {
  staggerChildren?: number
  delayChildren?: number
  when?: 'beforeChildren' | 'afterChildren'
}

// ============= Hero Component Types =============

/**
 * CTA (Call to Action) link
 */
export interface CtaLink {
  text: string
  href: string
  variant?: Variant
  external?: boolean
  onClick?: () => void
}

/**
 * Statistical display item
 */
export interface StatItem {
  value: number | string
  label: string
  suffix?: string
  prefix?: string
  description?: string
  animated?: boolean
}

/**
 * Feature badge for hero sections
 */
export interface FeatureBadge {
  icon: ReactElement | string
  text: string
  delay?: number
  color?: string
}

/**
 * Base hero component properties
 */
export interface BaseHeroProps extends BaseComponentProps, AnimationProps {
  title: string
  subtitle?: string
  description?: string
  primaryCta?: CtaLink
  secondaryCta?: CtaLink
  backgroundImage?: string
  backgroundColor?: string
  overlay?: boolean
  overlayOpacity?: number
  textAlign?: 'left' | 'center' | 'right'
  minHeight?: string
}

/**
 * Simple hero variant properties
 */
export interface SimpleHeroProps extends BaseHeroProps {
  theme?: ColorTheme
}

/**
 * Default hero variant properties
 */
export interface DefaultHeroProps extends BaseHeroProps {
  imageSrc?: string
  imageAlt?: string
  imagePosition?: 'left' | 'right'
  theme?: ColorTheme
}

/**
 * Animated hero variant properties
 */
export interface AnimatedHeroProps extends BaseHeroProps {
  stats?: StatItem[]
  badges?: FeatureBadge[]
  floatingElements?: boolean
  particleEffect?: boolean
}

/**
 * Legacy hero props for backward compatibility
 */
export interface HeroProps extends BaseHeroProps {
  variant?: 'default' | 'simple' | 'animated'
  imageSrc?: string
  imageAlt?: string
  imagePosition?: 'left' | 'right'
  stats?: StatItem[]
  badges?: FeatureBadge[]
  theme?: ColorTheme
}

// ============= Form Component Types =============

/**
 * Form field base properties
 */
export interface FormFieldProps extends BaseComponentProps {
  name: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  help?: string
  variant?: 'default' | 'filled' | 'outline'
  size?: Size
}

/**
 * Input field properties
 */
export interface InputProps extends FormFieldProps {
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search'
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  onFocus?: () => void
  autoComplete?: string
  maxLength?: number
  pattern?: string
  icon?: ReactElement
  iconPosition?: 'left' | 'right'
}

/**
 * Textarea properties
 */
export interface TextareaProps extends Omit<InputProps, 'type' | 'icon' | 'iconPosition'> {
  rows?: number
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
  autoResize?: boolean
}

/**
 * Select field properties
 */
export interface SelectProps extends FormFieldProps {
  value?: string | string[]
  defaultValue?: string | string[]
  onChange?: (value: string | string[]) => void
  options: SelectOption[]
  multiple?: boolean
  searchable?: boolean
  clearable?: boolean
  loading?: boolean
  placeholder?: string
}

/**
 * Select option definition
 */
export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  group?: string
  icon?: ReactElement
  description?: string
}

/**
 * Checkbox properties
 */
export interface CheckboxProps extends Omit<FormFieldProps, 'placeholder'> {
  checked?: boolean
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
  indeterminate?: boolean
}

/**
 * Radio group properties
 */
export interface RadioGroupProps extends FormFieldProps {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  options: RadioOption[]
  orientation?: 'horizontal' | 'vertical'
}

/**
 * Radio option definition
 */
export interface RadioOption {
  value: string
  label: string
  disabled?: boolean
  description?: string
}

// ============= Button Component Types =============

/**
 * Button component properties
 */
export interface ButtonProps extends BaseComponentProps, VariantProps, InteractiveProps {
  type?: 'button' | 'submit' | 'reset'
  href?: string
  external?: boolean
  leftIcon?: ReactElement
  rightIcon?: ReactElement
  iconOnly?: boolean
  fullWidth?: boolean
  rounded?: boolean
  gradient?: string
  as?: 'button' | 'a' | 'div'
}

// ============= Card Component Types =============

/**
 * Card component properties
 */
export interface CardProps extends BaseComponentProps, AnimationProps {
  variant?: 'default' | 'elevated' | 'outline' | 'ghost'
  padding?: 'none' | 'small' | 'default' | 'large'
  hover?: boolean
  clickable?: boolean
  onClick?: () => void
  href?: string
  image?: {
    src: string
    alt: string
    position?: 'top' | 'bottom' | 'left' | 'right'
  }
  header?: ReactNode
  footer?: ReactNode
  gradient?: string
}

/**
 * Animated card properties
 */
export interface AnimatedCardProps {
  children: ReactNode
  className?: string
  whileHover?: Record<string, unknown>
  onClick?: () => void
  delay?: number
  elevation?: 'none' | 'low' | 'medium' | 'high'
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  animation?: boolean
  interactionEffect?: 'lift' | 'scale' | 'glow' | 'none'
}

// ============= Modal/Dialog Component Types =============

/**
 * Modal component properties
 */
export interface ModalProps extends BaseComponentProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  size?: 'small' | 'default' | 'large' | 'fullscreen'
  position?: 'center' | 'top' | 'bottom'
  closable?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  showOverlay?: boolean
  overlayBlur?: boolean
  animation?: 'fade' | 'scale' | 'slide-up' | 'slide-down'
  header?: ReactNode
  footer?: ReactNode
}

/**
 * Drawer component properties
 */
export interface DrawerProps extends Omit<ModalProps, 'position'> {
  side?: 'left' | 'right' | 'top' | 'bottom'
  width?: string
  height?: string
  overlay?: boolean
}

/**
 * Popover component properties
 */
export interface PopoverProps extends BaseComponentProps {
  trigger: ReactElement
  content: ReactNode
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto'
  offset?: number
  arrow?: boolean
  interactive?: boolean
  delay?: { open?: number; close?: number }
  disabled?: boolean
}

// ============= Navigation Component Types =============

/**
 * Navigation menu item
 */
export interface NavItem {
  id: string
  label: string
  href?: string
  icon?: ReactElement
  badge?: string | number
  disabled?: boolean
  children?: NavItem[]
  external?: boolean
  onClick?: () => void
}

/**
 * Navigation component properties
 */
export interface NavigationProps extends BaseComponentProps {
  items: NavItem[]
  orientation?: 'horizontal' | 'vertical'
  variant?: 'default' | 'pills' | 'underline' | 'minimal'
  activeId?: string
  onItemClick?: (item: NavItem) => void
  collapsible?: boolean
  defaultCollapsed?: boolean
}

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: ReactElement
  current?: boolean
}

/**
 * Breadcrumb component properties
 */
export interface BreadcrumbProps extends BaseComponentProps {
  items: BreadcrumbItem[]
  separator?: ReactElement | string
  maxItems?: number
  showHome?: boolean
  homeIcon?: ReactElement
}

// ============= Data Display Component Types =============

/**
 * Table column definition
 */
export interface TableColumn<T = any> {
  key: string
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: Record<string, unknown>, row: T, index: number) => ReactNode
  className?: string
}

/**
 * Table component properties
 */
export interface TableProps<T = any> extends BaseComponentProps {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSort?: (column: string, order: 'asc' | 'desc') => void
  onRowClick?: (row: T, index: number) => void
  rowKey?: string | ((row: T) => string)
  emptyMessage?: string
  striped?: boolean
  bordered?: boolean
  hoverable?: boolean
  stickyHeader?: boolean
}

/**
 * List component properties
 */
export interface ListProps<T = any> extends BaseComponentProps {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  loading?: boolean
  emptyMessage?: string
  divider?: boolean
  spacing?: 'none' | 'small' | 'default' | 'large'
  virtualized?: boolean
  itemHeight?: number
}

// ============= Feedback Component Types =============

/**
 * Toast notification properties
 */
export interface ToastProps {
  id: string
  title?: string
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  duration?: number
  persistent?: boolean
  actions?: ToastAction[]
  onClose?: () => void
}

/**
 * Toast action button
 */
export interface ToastAction {
  label: string
  onClick: () => void
  variant?: Variant
}

/**
 * Alert component properties
 */
export interface AlertProps extends BaseComponentProps {
  type?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  message: string
  dismissible?: boolean
  onDismiss?: () => void
  icon?: ReactElement
  actions?: AlertAction[]
}

/**
 * Alert action button
 */
export interface AlertAction {
  label: string
  onClick: () => void
  variant?: Variant
}

/**
 * Loading component properties
 */
export interface LoadingProps extends BaseComponentProps {
  type?: 'spinner' | 'dots' | 'bars' | 'pulse'
  size?: Size
  color?: string
  overlay?: boolean
  fullScreen?: boolean
  message?: string
}

// ============= Media Component Types =============

/**
 * Optimized image properties
 */
export interface OptimizedImageProps extends BaseComponentProps {
  src: string
  alt: string
  width?: number
  height?: number
  sizes?: string
  priority?: boolean
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  quality?: number
  fill?: boolean
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  objectPosition?: string
  loading?: 'lazy' | 'eager'
  onLoad?: () => void
  onError?: () => void
}

/**
 * Video player properties
 */
export interface VideoPlayerProps extends BaseComponentProps {
  src: string
  poster?: string
  autoPlay?: boolean
  controls?: boolean
  loop?: boolean
  muted?: boolean
  width?: number
  height?: number
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  onError?: (error: string) => void
}

// ============= Utility Component Types =============

/**
 * Tooltip properties
 */
export interface TooltipProps {
  content: ReactNode
  children: ReactElement
  placement?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  arrow?: boolean
  theme?: 'dark' | 'light'
  maxWidth?: string
  disabled?: boolean
}

/**
 * Badge properties
 */
export interface BadgeProps extends BaseComponentProps, VariantProps {
  content?: string | number
  dot?: boolean
  max?: number
  showZero?: boolean
  offset?: [number, number]
  placement?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

/**
 * Progress indicator properties
 */
export interface ProgressProps extends BaseComponentProps {
  value: number
  max?: number
  variant?: 'linear' | 'circular'
  size?: Size
  color?: string
  showLabel?: boolean
  label?: string
  animated?: boolean
  striped?: boolean
}

// ============= Error Boundary Component Types =============

/**
 * Base error boundary properties
 */
export interface BaseErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (errorToReport: Error, errorInfoToReport: ErrorInfo) => void
  className?: string
}

/**
 * Base error boundary state
 */
export interface BaseErrorBoundaryState {
  hasError: boolean
  error: Error | null
}