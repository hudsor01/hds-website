// Central export for all type definitions
export type * from './seo'
export type * from './performance' 
export type * from './accessibility'

// Common utility types
export interface BaseConfig {
  enabled: boolean
  debug?: boolean
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  timestamp: number
}

export interface Route {
  path: string
  name: string
  component: unknown
  meta?: {
    seo?: string
    requiresAuth?: boolean
    layout?: string
  }
}