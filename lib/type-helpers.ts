/**
 * Type helper utilities for working with API data and endpoints
 */
import type { ZodType, ZodTypeDef } from 'zod'

/**
 * Helper type that makes all properties optional
 * Different from TypeScript's built-in Partial to avoid conflicts
 */
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T

/**
 * Creates a type-safe wrapper for response data
 * Useful for creating mock data with proper types
 */
export function createTypedResponse<T>(data: T): T {
  return data
}

/**
 * Type-safe schema validator
 * This helps TypeScript infer the correct type from a zod schema
 */
export function validateWithSchema<Output, Def extends ZodTypeDef, Input>(
  schema: ZodType<Output, Def, Input>,
  data: unknown,
): Output {
  return schema.parse(data)
}

/**
 * Make all properties in T required and non-nullable
 * Different from TypeScript's built-in Required to avoid conflicts
 */
export type DeepRequired<T> = T extends object
  ? {
      [P in keyof T]-?: NonNullable<DeepRequired<T[P]>>
    }
  : NonNullable<T>

/**
 * Convert a type with string index signature to specific properties
 * This helps TypeScript infer correct property types
 */
export type FromIndexSignature<T extends Record<string, unknown>> = {
  [K in keyof T]: T[K]
}

/**
 * Helper for transforming typed records to proper TypeScript types
 * Useful for converting API responses to properly typed objects
 */
export function transformTypedRecord<T>(record: Record<string, unknown>): T {
  return record as unknown as T
}

/**
 * Create a type-safe interface around an API endpoint
 * This helps ensure type consistency in API calls
 */
export interface TypedApiEndpoint<Input, Output> {
  input: Input
  output: Output
}

/**
 * Helper for creating a consistent API response structure
 */
export interface TypedApiResponse<T> {
  data: T
  success: boolean
  error?: string
  metadata?: Record<string, unknown>
}

/**
 * Type helper for safely extracting property types
 */
export type PropertyType<T, K extends keyof T> = T[K]

/**
 * Utility type for making certain keys optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * Utility type for making certain keys required
 */
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>

/**
 * Extract non-nullable keys from a type
 */
export type NonNullableKeys<T> = {
  [K in keyof T]-?: NonNullable<T[K]> extends T[K] ? K : never
}[keyof T]

/**
 * Extract nullable keys from a type
 */
export type NullableKeys<T> = {
  [K in keyof T]-?: NonNullable<T[K]> extends T[K] ? never : K
}[keyof T]

/**
 * Helper to ensure exhaustive checks in switch statements
 */
export function assertNever(value: never): never {
  throw new Error(`Unhandled discriminated union member: ${JSON.stringify(value)}`)
}

/**
 * Type guard to check if a value is defined
 */
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null
}

/**
 * Type guard to check if a value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

/**
 * Type guard to check if a value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value)
}

/**
 * Type guard to check if a value is an object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Type guard to check if a value is an array
 */
export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value)
}