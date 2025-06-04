/**
 * Utility Types
 * 
 * Generic utility types and helper types used throughout the application.
 * These types provide common patterns and transformations.
 */

import React from 'react'

// ============= Generic Utility Types =============

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * Make all properties required recursively
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P]
}

/**
 * Make specific properties optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * Make specific properties required
 */
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>

/**
 * Extract nested value type from object
 */
export type NestedKeyOf<T> = {
  [K in keyof T & (string | number)]: T[K] extends object
    ? `${K}` | `${K}.${NestedKeyOf<T[K]>}`
    : `${K}`
}[keyof T & (string | number)]

/**
 * Get value type by nested key path
 * Simplified version to avoid complex recursive type constraints
 */
export type NestedValueOf<T, K> = K extends keyof T 
  ? T[K]
  : K extends `${infer K1}.${infer K2}`
    ? K1 extends keyof T
      ? T[K1] extends Record<string, unknown>
        ? NestedValueOf<T[K1], K2>
        : never
      : never
    : never

/**
 * Non-empty array type
 */
export type NonEmptyArray<T> = [T, ...T[]]

/**
 * Flatten array type
 */
export type Flatten<T> = T extends (infer U)[] ? U : T

/**
 * Union to intersection type conversion
 */
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never

/**
 * Tuple to union type conversion
 */
export type TupleToUnion<T extends readonly unknown[]> = T[number]

/**
 * Get function parameters as object
 */
export type FunctionParams<T extends (...args: Record<string, unknown>[]) => any> = T extends (
  ...args: infer P
) => any
  ? P
  : never

/**
 * Get function return type
 */
export type AsyncReturnType<T extends (...args: any[]) => Promise<any>> = T extends (
  ...args: any[]
) => Promise<infer R>
  ? R
  : any

/**
 * Remove undefined from type
 */
export type NonUndefined<T> = T extends undefined ? never : T

/**
 * Remove null from type
 */
export type NonNull<T> = T extends null ? never : T

/**
 * Remove null and undefined from type
 */
export type NonNullable<T> = NonNull<NonUndefined<T>>

/**
 * Create discriminated union from object values
 */
export type ValueOf<T> = T[keyof T]

/**
 * Create object with specific value type
 */
export type Dict<T = any> = Record<string, T>

/**
 * Prettify type for better IntelliSense display
 */
export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

// ============= String Utility Types =============

/**
 * Capitalize first letter of string literal type
 */
export type Capitalize<S extends string> = S extends `${infer F}${infer R}`
  ? `${Uppercase<F>}${R}`
  : S

/**
 * Uncapitalize first letter of string literal type
 */
export type Uncapitalize<S extends string> = S extends `${infer F}${infer R}`
  ? `${Lowercase<F>}${R}`
  : S

/**
 * Convert string to kebab-case
 */
export type KebabCase<S extends string> = S extends `${infer C}${infer T}`
  ? KebabCase<T> extends infer U
    ? U extends string
      ? T extends ''
        ? Lowercase<C>
        : C extends Lowercase<C>
        ? `${Lowercase<C>}${U}`
        : `${Lowercase<C>}-${U}`
      : never
    : never
  : S

/**
 * Convert string to snake_case
 */
export type SnakeCase<S extends string> = S extends `${infer C}${infer T}`
  ? SnakeCase<T> extends infer U
    ? U extends string
      ? T extends ''
        ? Lowercase<C>
        : C extends Lowercase<C>
        ? `${Lowercase<C>}${U}`
        : `${Lowercase<C>}_${U}`
      : never
    : never
  : S

/**
 * Convert string to camelCase
 */
export type CamelCase<S extends string> = S extends `${infer P1}-${infer P2}${infer P3}`
  ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
  : S extends `${infer P1}_${infer P2}${infer P3}`
  ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
  : Lowercase<S>

/**
 * Split string by delimiter
 */
export type Split<S extends string, D extends string> = S extends `${infer T}${D}${infer U}`
  ? [T, ...Split<U, D>]
  : [S]

/**
 * Join array of strings with delimiter
 */
export type Join<T extends string[], D extends string> = T extends [infer F, ...infer R]
  ? F extends string
    ? R extends string[]
      ? R['length'] extends 0
        ? F
        : `${F}${D}${Join<R, D>}`
      : never
    : never
  : ''

// ============= Object Utility Types =============

/**
 * Deep merge two types
 */
export type DeepMerge<T, U> = {
  [K in keyof T | keyof U]: K extends keyof U
    ? K extends keyof T
      ? T[K] extends object
        ? U[K] extends object
          ? DeepMerge<T[K], U[K]>
          : U[K]
        : U[K]
      : U[K]
    : K extends keyof T
    ? T[K]
    : never
}

/**
 * Pick properties by type
 */
export type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K]
}

/**
 * Omit properties by type
 */
export type OmitByType<T, U> = {
  [K in keyof T as T[K] extends U ? never : K]: T[K]
}

/**
 * Get all paths of object as string literals
 */
export type Paths<T> = T extends object
  ? {
      [K in keyof T]: K extends string | number
        ? T[K] extends object
          ? `${K}` | `${K}.${Paths<T[K]>}`
          : `${K}`
        : never
    }[keyof T]
  : never

/**
 * Get value type by path
 */
export type PathValue<T, P extends Paths<T>> = P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? Rest extends Paths<T[Key]>
      ? PathValue<T[Key], Rest>
      : never
    : never
  : P extends keyof T
  ? T[P]
  : never

/**
 * Create object with all keys optional except specified ones
 */
export type RequireOnly<T, K extends keyof T> = Partial<T> & Required<Pick<T, K>>

/**
 * Create object with all keys required except specified ones
 */
export type OptionalOnly<T, K extends keyof T> = Required<T> & Partial<Pick<T, K>>

/**
 * Rename object keys
 */
export type RenameKeys<T, U extends Record<keyof T, string>> = {
  [K in keyof T as K extends keyof U ? U[K] : K]: T[K]
}

/**
 * Create object from array of keys with specific value type
 */
export type KeysToObject<T extends readonly string[], U = true> = {
  [K in T[number]]: U
}

// ============= Function Utility Types =============

/**
 * Create overloaded function type
 */
export type Overload<T> = T extends {
  (...args: infer A1): infer R1
  (...args: infer A2): infer R2
  (...args: infer A3): infer R3
  (...args: infer A4): infer R4
}
  ? ((...args: A1) => R1) &
      ((...args: A2) => R2) &
      ((...args: A3) => R3) &
      ((...args: A4) => R4)
  : T extends {
      (...args: infer A1): infer R1
      (...args: infer A2): infer R2
      (...args: infer A3): infer R3
    }
  ? ((...args: A1) => R1) & ((...args: A2) => R2) & ((...args: A3) => R3)
  : T extends {
      (...args: infer A1): infer R1
      (...args: infer A2): infer R2
    }
  ? ((...args: A1) => R1) & ((...args: A2) => R2)
  : T

/**
 * Create memoized function type
 */
export type MemoizedFunction<T extends (...args: any[]) => any> = T & {
  cache: Map<string, ReturnType<T>>
  clear: () => void
}

/**
 * Create throttled function type
 */
export type ThrottledFunction<T extends (...args: any[]) => any> = T & {
  cancel: () => void
  flush: () => void
}

/**
 * Create debounced function type
 */
export type DebouncedFunction<T extends (...args: any[]) => any> = T & {
  cancel: () => void
  flush: () => ReturnType<T>
  pending: () => boolean
}

// ============= API & Data Utility Types =============

/**
 * API response wrapper
 */
export type ApiResponseWrapper<T> = {
  data: T
  success: boolean
  message?: string
  error?: string
}

/**
 * Pagination wrapper
 */
export type PaginatedResponse<T> = {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

/**
 * Sort order type
 */
export type SortOrder = 'asc' | 'desc'

/**
 * Filter operator type
 */
export type FilterOperator =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'nin'
  | 'contains'
  | 'startswith'
  | 'endswith'

/**
 * Filter condition
 */
export type FilterCondition<T> = {
  field: keyof T
  operator: FilterOperator
  value: Record<string, unknown>
}

/**
 * Sort condition
 */
export type SortCondition<T> = {
  field: keyof T
  order: SortOrder
}

/**
 * Query parameters for data fetching
 */
export type QueryParams<T> = {
  page?: number
  limit?: number
  sort?: SortCondition<T>[]
  filters?: FilterCondition<T>[]
  search?: string
  include?: string[]
  fields?: (keyof T)[]
}

// ============= State Management Utility Types =============

/**
 * State slice type
 */
export type StateSlice<T> = T & {
  reset: () => void
}

/**
 * Action type for reducers
 */
export type Action<T extends string = string, P = any> = {
  type: T
  payload?: P
  meta?: Record<string, unknown>
  error?: boolean
}

/**
 * Reducer type
 */
export type Reducer<S, A extends Action = Action> = (state: S, action: A) => S

/**
 * Store type
 */
export type Store<S> = {
  getState: () => S
  dispatch: (action: Action) => void
  subscribe: (listener: () => void) => () => void
}

// ============= Component Utility Types =============

/**
 * Component with ref forwarding
 */
export type ComponentWithRef<T, P = {}> = React.ForwardRefExoticComponent<
  P & React.RefAttributes<T>
>

/**
 * Polymorphic component props
 */
export type PolymorphicProps<E extends React.ElementType, P = {}> = P &
  Omit<React.ComponentProps<E>, keyof P> & {
    as?: E
  }

/**
 * Component variant props
 */
export type VariantProps<T extends Record<string, unknown>> = {
  [K in keyof T]?: keyof T[K]
}

/**
 * Style props for styled components
 */
export type StyledProps = {
  css?: Record<string, unknown>
  sx?: Record<string, unknown>
  className?: string
  style?: React.CSSProperties
}

// ============= Error Utility Types =============

/**
 * Result type for error handling
 */
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E }

/**
 * Maybe type for nullable values
 */
export type Maybe<T> = T | null | undefined

/**
 * Either type for union handling
 */
export type Either<L, R> = 
  | { type: 'left'; value: L }
  | { type: 'right'; value: R }

/**
 * Option type for handling optional values
 */
export type Option<T> = 
  | { some: true; value: T }
  | { some: false }

// ============= Browser & Client Utility Types =============

/**
 * Geolocation position type
 */
export interface GeolocationPositionType {
  coords: {
    latitude: number
    longitude: number
    accuracy: number
    altitude?: number | null
    altitudeAccuracy?: number | null
    heading?: number | null
    speed?: number | null
  }
  timestamp: number
}

/**
 * Scroll behavior type
 */
export type ScrollBehaviorType = 'auto' | 'smooth' | 'instant'

/**
 * Device information
 */
export interface DeviceInfo {
  userAgent: string
  language: string
  platform: string
  cookieEnabled: boolean
  onLine: boolean
  screen: {
    width: number
    height: number
    colorDepth: number
  }
  viewport: {
    width: number
    height: number
  }
}

/**
 * Page performance metrics
 */
export interface PagePerformanceMetrics {
  domContentLoaded: number
  loadComplete: number
  firstPaint: number
  firstContentfulPaint: number
}

/**
 * Log level type
 */
export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace'

// ============= Event Utility Types =============

/**
 * Custom event type
 */
export type CustomEvent<T = any> = {
  type: string
  detail: T
  timestamp: number
}

/**
 * Event handler type
 */
export type EventHandler<T = any> = (event: CustomEvent<T>) => void

/**
 * Event emitter type
 */
export type EventEmitter<T extends Record<string, unknown> = Record<string, unknown>> = {
  on<K extends keyof T>(event: K, handler: EventHandler<T[K]>): void
  off<K extends keyof T>(event: K, handler: EventHandler<T[K]>): void
  emit<K extends keyof T>(event: K, detail: T[K]): void
}