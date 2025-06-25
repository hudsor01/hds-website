// Performance monitoring type definitions

export interface WebVitalMetric {
  name: 'CLS' | 'FCP' | 'FID' | 'LCP' | 'TTFB'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta?: number
  id?: string
}

export interface PerformanceConfig {
  enableAnalytics: boolean
  trackingId?: string
  debugMode: boolean
  sampleRate: number
}

export interface ResourceHintConfig {
  domains: string[]
  criticalFonts: string[]
  enablePreload: boolean
  enablePrefetch: boolean
}

// Extended PerformanceEntry types for Web Vitals
export interface LCPEntry extends PerformanceEntry {
  size: number
  loadTime: number
  renderTime: number
  url?: string
}

export interface FIDEntry extends PerformanceEntry {
  processingStart: number
  processingEnd: number
  duration: number
}

export interface CLSEntry extends PerformanceEntry {
  value: number
  hadRecentInput: boolean
  sources: Array<{
    node?: Node
    currentRect: DOMRectReadOnly
    previousRect: DOMRectReadOnly
  }>
}

export interface NavigationTimingMetrics {
  dns: number
  tcp: number
  request: number
  response: number
  processing: number
  load: number
  total: number
}
