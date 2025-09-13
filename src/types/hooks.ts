/**
 * Centralized Hook Type Definitions
 * Consolidates inline interfaces from custom hooks and utilities
 */

// Loading State Hook Types
export interface LoadingState {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error?: string | null;
}

export interface UseLoadingStateOptions {
  autoReset?: boolean;
  resetDelay?: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export interface UseLoadingStateReturn extends LoadingState {
  setLoading: () => void;
  setSuccess: () => void;
  setError: (error?: string) => void;
  reset: () => void;
}

// Image Loading Hook Types
export interface UseImageLoadingState {
  isLoading: boolean;
  isLoaded: boolean;
  hasError: boolean;
  error?: string;
}

export interface UseImageLoadingReturn extends UseImageLoadingState {
  handleLoad: () => void;
  handleError: (error?: string) => void;
  reset: () => void;
}

// API Client Hook Types
export interface UseApiClientOptions {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

export interface ApiRequestConfig<T = Record<string, unknown>> {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: T;
  timeout?: number;
  retries?: number;
}

// Analytics Hook Types
export interface UseAnalyticsOptions {
  trackPageViews?: boolean;
  trackClicks?: boolean;
  trackFormSubmissions?: boolean;
  sessionId?: string;
}

// Analytics property value types
export type AnalyticsPropertyValue = string | number | boolean | null | undefined | Date | AnalyticsPropertyValue[] | { [key: string]: AnalyticsPropertyValue };

export interface UseAnalyticsReturn {
  track: (event: string, properties?: Record<string, AnalyticsPropertyValue>) => void;
  identify: (userId: string, traits?: Record<string, AnalyticsPropertyValue>) => void;
  page: (name?: string, properties?: Record<string, AnalyticsPropertyValue>) => void;
  reset: () => void;
}

// Web Vitals Hook Types
export interface UseWebVitalsOptions {
  reportAllChanges?: boolean;
  endpoint?: string;
  enabledMetrics?: Array<'CLS' | 'FCP' | 'FID' | 'LCP' | 'TTFB' | 'INP'>;
}

export interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  id: string;
  navigationType: string;
  delta?: number;
}

// Touch Interactions Hook Types
export interface TouchGesture {
  type: 'tap' | 'swipe' | 'pinch' | 'rotate';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
  velocity?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export interface UseTouchInteractionsOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  swipeThreshold?: number;
  longPressDelay?: number;
}

// Realtime Hook Types
export interface UseRealtimeOptions<T = Record<string, unknown>> {
  channel: string;
  event?: string;
  schema?: string;
  filter?: string;
  onInsert?: (payload: T) => void;
  onUpdate?: (payload: T) => void;
  onDelete?: (payload: T) => void;
}

export interface UseRealtimeReturn<T = Record<string, unknown>> {
  data: T[];
  loading: boolean;
  error: string | null;
  subscribe: () => void;
  unsubscribe: () => void;
}

// Local Storage Hook Types
export interface UseLocalStorageOptions<T> {
  defaultValue?: T;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
}

export interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  removeValue: () => void;
}

// Debounce Hook Types
export interface UseDebounceOptions {
  delay: number;
  immediate?: boolean;
}

// Function type for debounce/throttle
export type DebouncableFunction = (...args: (string | number | boolean | object)[]) => string | number | boolean | void;

export interface UseDebounceReturn<T extends DebouncableFunction> {
  debouncedFunction: T;
  cancel: () => void;
  flush: () => void;
  pending: boolean;
}

// Throttle Hook Types
export interface UseThrottleOptions {
  delay: number;
  leading?: boolean;
  trailing?: boolean;
}

export interface UseThrottleReturn<T extends DebouncableFunction> {
  throttledFunction: T;
  cancel: () => void;
  flush: () => void;
}