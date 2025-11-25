/**
 * Google Analytics gtag.js type declarations
 */

interface Window {
  gtag?: (
    command: 'config' | 'event' | 'js' | 'set',
    targetId: string,
    config?: Record<string, unknown>
  ) => void;
}
