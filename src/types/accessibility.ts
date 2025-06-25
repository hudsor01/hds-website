// Accessibility-related type definitions

export interface A11yConfig {
  enableSkipLinks: boolean
  enableFocusManagement: boolean
  enableLiveRegions: boolean
  enableKeyboardNavigation: boolean
  respectReducedMotion: boolean
}

export interface LiveRegionConfig {
  politeRegionId: string
  assertiveRegionId: string
  timeout: number
}

export type LiveRegionPriority = 'polite' | 'assertive'

export interface FocusTarget {
  element: HTMLElement | null
  selector?: string
  fallback?: HTMLElement | null
}

export interface KeyboardNavigationConfig {
  enableEscapeHandling: boolean
  enableArrowNavigation: boolean
  enableTabTrap: boolean
  focusIndicatorStyle: string
}

export interface ContrastCheckResult {
  foreground: string
  background: string
  ratio: number
  level: 'AAA' | 'AA' | 'A' | 'fail'
  normal: boolean
  large: boolean
}

export interface SkipLinkConfig {
  text: string
  target: string
  position: {
    top: string
    left: string
  }
  styles: {
    focused: Record<string, string>
    hidden: Record<string, string>
  }
}