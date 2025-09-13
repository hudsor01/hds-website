/**
 * Test-related Type Definitions
 * Types for E2E tests, performance monitoring, and test utilities
 */

// Playwright types imported for re-export
export type { Page, Request, Response, ConsoleMessage } from '@playwright/test';

// Performance Monitoring Types
export interface NetworkRequest {
  url: string;
  method: string;
  status?: number;
  startTime: number;
  endTime?: number;
  duration?: number;
  resourceType?: string;
  size?: number;
  failure?: string;
}

export interface PerformanceMetrics {
  LCP?: number;
  FID?: number;
  CLS?: number;
  FCP?: number;
  TTFB?: number;
  domContentLoaded?: number;
  load?: number;
}

export interface ResourceMetrics {
  url: string;
  type: string;
  size: number;
  duration: number;
  startTime: number;
}

// Accessibility Types
export interface AccessibilityViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: AccessibilityNode[];
}

export interface AccessibilityNode {
  html: string;
  target: string;
  failureSummary: string;
}

// Test Data Types
export interface TestMetrics {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  passRate: number;
  failedTests: TestResult[];
  slowTests: TestResult[];
  timestamp: string;
}

export interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  file?: string;
}

// Enhanced Reporter Types
export interface PerformanceData {
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  totalDuration: number;
  slowTests: TestResult[];
  fastestTests: TestResult[];
}

export interface HistoricalComparison {
  current: TestMetrics;
  previous: TestMetrics;
  trend: 'improved' | 'degraded' | 'stable';
  passRateDelta: number;
  durationDelta: number;
}

// Test Utility Types
export interface MockDatabaseResponse<T = unknown> {
  endpoint: string;
  response: T;
  status?: number;
  headers?: Record<string, string>;
}

// Tailwind Plugin Types
// Tailwind plugin configuration options
export interface TailwindPluginOptions {
  respectPrefix?: boolean;
  respectImportant?: boolean;
  modifiers?: string[];
}

export type TailwindThemeValue = string | number | boolean | null | undefined | TailwindThemeValue[] | { [key: string]: TailwindThemeValue };

export interface TailwindPluginAPI {
  addUtilities: (utilities: Record<string, Record<string, string | number>>, options?: TailwindPluginOptions) => void;
  addComponents: (components: Record<string, Record<string, string | number>>, options?: TailwindPluginOptions) => void;
  addBase: (base: Record<string, Record<string, string | number>>) => void;
  addVariant: (name: string, variant: string | string[]) => void;
  e: (selector: string) => string;
  prefix: (selector: string) => string;
  theme: <T = TailwindThemeValue>(path: string, defaultValue?: T) => T;
  variants: (path: string, defaultValue?: string[]) => string[];
  config: <T = TailwindThemeValue>(path: string, defaultValue?: T) => T;
  corePlugins: (plugin: string) => boolean;
  matchUtilities: <T = TailwindThemeValue>(utilities: Record<string, (value: T) => Record<string, string | number>>, options?: TailwindPluginOptions & { values?: Record<string, T> }) => void;
  matchComponents: <T = TailwindThemeValue>(components: Record<string, (value: T) => Record<string, string | number>>, options?: TailwindPluginOptions & { values?: Record<string, T> }) => void;
}

// Axe Accessibility Results
export interface AxeResults {
  violations: AxeViolation[];
  passes: AxeCheck[];
  incomplete: AxeCheck[];
  inapplicable: AxeCheck[];
}

export interface AxeViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: AxeNode[];
}

export interface AxeNode {
  html: string;
  target: string[];
  failureSummary: string;
}

export interface AxeCheck {
  id: string;
  impact: string | null;
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: AxeNode[];
}

// PostHog Event Types
export type PostHogPropertyValue = string | number | boolean | null | undefined | Date | PostHogPropertyValue[] | { [key: string]: PostHogPropertyValue };

export interface PostHogEvent {
  event: string;
  properties: Record<string, PostHogPropertyValue>;
  timestamp?: string;
  distinct_id?: string;
}

// Contact Form Test Types
export interface ContactFormTestData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  service?: string;
  budget?: string;
  timeline?: string;
  message: string;
}

// Rate Limiting Test Types
export interface RateLimitTestResponse<T = unknown> {
  status: number;
  headers: Record<string, string>;
  body?: T;
  timestamp: number;
}