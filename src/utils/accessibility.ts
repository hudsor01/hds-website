// Basic accessibility helpers used on the client

export function initAccessibilityFeatures() {
  // Placeholder for any client-side accessibility setup (e.g., focus outlines)
  if (typeof document !== 'undefined') {
    document.documentElement.classList.add('a11y-ready');
  }
}

export function cleanupAccessibilityFeatures() {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('a11y-ready');
  }
}
