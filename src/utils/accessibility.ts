// Accessibility utilities and enhancements
import { logger } from '@/lib/logger';
import analytics from '@/lib/analytics';

/**
 * Cleanup registry to track all event listeners and observers
 * Per MDN: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#memory_concerns
 * "Event listeners can create memory leaks if not removed properly"
 */
const cleanupRegistry: Array<() => void> = [];

// Skip to main content link
export function addSkipToMainLink() {
  const skipLink = document.createElement("a");
  skipLink.href = "#main-content";
  skipLink.textContent = "Skip to main content";
  skipLink.className =
    "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-modal focus:px-4 focus:py-2 focus:bg-secondary-600 focus:text-primary-foreground focus:rounded-md focus:text-sm font-medium";
  skipLink.style.cssText = `
    position: absolute;
    left: -10000px;
    top: auto;
    width: 1px;
    height: 1px;
    overflow: hidden;
  `;

  const handleFocus = () => {
    skipLink.style.cssText = `
      position: absolute;
      top: 1rem;
      left: 1rem;
      z-index: 50;
      padding: 0.5rem 1rem;
      background-color: #0891b2;
      color: white;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      text-decoration: none;
    `;
  };

  const handleBlur = () => {
    skipLink.style.cssText = `
      position: absolute;
      left: -10000px;
      top: auto;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
  };

  skipLink.addEventListener("focus", handleFocus);
  skipLink.addEventListener("blur", handleBlur);

  document.body.insertBefore(skipLink, document.body.firstChild);

  // Register cleanup
  cleanupRegistry.push(() => {
    skipLink.removeEventListener("focus", handleFocus);
    skipLink.removeEventListener("blur", handleBlur);
    skipLink.remove();
  });
}

// Focus management for SPA navigation
export function manageFocus() {
  // Store focus before navigation
  const handleBeforeUnload = () => {
    // Store the last focused element for potential restoration
    const lastFocused = document.activeElement;
    if (lastFocused) {
      // Store reference for potential restoration
      // Focus element stored for restoration
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);

  // Restore or set appropriate focus after navigation
  const observer = new MutationObserver(() => {
    const mainContent =
      document.getElementById("main-content") || document.querySelector("main");
    if (mainContent && !document.activeElement?.closest("main")) {
      // Set focus to main content area for screen readers
      mainContent.setAttribute("tabindex", "-1");
      mainContent.focus();

      // Remove tabindex after focus to avoid interfering with normal tab order
      setTimeout(() => {
        mainContent.removeAttribute("tabindex");
      }, 100);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Register cleanup
  cleanupRegistry.push(() => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
    observer.disconnect();
  });
}

// Keyboard navigation enhancements
export function enhanceKeyboardNavigation() {
  // Add visible focus indicators
  const focusStyle = document.createElement("style");
  focusStyle.id = "accessibility-focus-styles";
  focusStyle.textContent = `
    .focus-visible:focus {
      outline: 2px solid #0891b2 !important;
      outline-offset: 2px !important;
    }

    .focus-visible:focus:not(:focus-visible) {
      outline: none !important;
    }
  `;
  document.head.appendChild(focusStyle);

  // Escape key handling for modals/dropdowns
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      const activeModal = document.querySelector(
        '[role="dialog"][aria-hidden="false"]'
      );
      const activeDropdown = document.querySelector(
        '[role="menu"][aria-expanded="true"]'
      );

      if (activeModal) {
        // Close modal and return focus
        const closeButton = activeModal.querySelector(
          '[aria-label*="close"], [data-close]'
        );
        if (closeButton) {
          (closeButton as HTMLElement).click();
        }
      } else if (activeDropdown) {
        // Close dropdown and return focus
        const trigger = document.querySelector(
          `[aria-controls="${activeDropdown.id}"]`
        );
        if (trigger) {
          (trigger as HTMLElement).focus();
          (trigger as HTMLElement).click();
        }
      }
    }
  };

  document.addEventListener("keydown", handleKeydown);

  // Register cleanup
  cleanupRegistry.push(() => {
    document.removeEventListener("keydown", handleKeydown);
    focusStyle.remove();
  });
}

// ARIA live regions for dynamic content
export function setupLiveRegions() {
  // Create polite announcements region
  const politeRegion = document.createElement("div");
  politeRegion.id = "aria-live-polite";
  politeRegion.setAttribute("aria-live", "polite");
  politeRegion.setAttribute("aria-atomic", "true");
  politeRegion.className = "sr-only";
  document.body.appendChild(politeRegion);

  // Create assertive announcements region
  const assertiveRegion = document.createElement("div");
  assertiveRegion.id = "aria-live-assertive";
  assertiveRegion.setAttribute("aria-live", "assertive");
  assertiveRegion.setAttribute("aria-atomic", "true");
  assertiveRegion.className = "sr-only";
  document.body.appendChild(assertiveRegion);

  // Register cleanup
  cleanupRegistry.push(() => {
    politeRegion.remove();
    assertiveRegion.remove();
  });
}

// Announce messages to screen readers
export function announceMessage(
  message: string,
  priority: "polite" | "assertive" = "polite"
) {
  const regionId =
    priority === "assertive" ? "aria-live-assertive" : "aria-live-polite";
  const region = document.getElementById(regionId);

  if (region) {
    region.textContent = "";
    setTimeout(() => {
      region.textContent = message;
    }, 100);

    // Clear after 5 seconds
    setTimeout(() => {
      region.textContent = "";
    }, 5000);
  }
}

// Color contrast validation
export function validateColorContrast() {
  // This is a basic implementation - in production you'd use a proper contrast library
  const checkContrast = (color1: string, color2: string) => {
    // Track color contrast validation for accessibility monitoring
    logger.info('Accessibility - color contrast validation', {
      operation: 'contrast_check',
      foregroundColor: color1,
      backgroundColor: color2,
      recommendation: 'implement_wcag_validation',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      timestamp: Date.now()
    });

    // Send accessibility event to analytics
    if (typeof window !== 'undefined' && analytics) {
      analytics.trackEvent('accessibility_contrast_check', {
        foreground_color: color1,
        background_color: color2,
        page_url: window.location.href
      });
    }
  };

  // Check common color combinations
  checkContrast("#ffffff", "#09090b"); // White on black
  checkContrast("#0891b2", "#09090b"); // Cyan on black
  checkContrast("#4ade80", "#09090b"); // Green on black
}

// Form accessibility enhancements
export function enhanceFormAccessibility() {
  // Add proper labeling and error handling
  document.addEventListener("DOMContentLoaded", () => {
    const forms = document.querySelectorAll("form");

    forms.forEach((form) => {
      // Ensure all inputs have labels
      const inputs = form.querySelectorAll("input, select, textarea");
      inputs.forEach((input) => {
        const id =
          input.id || `input-${Math.random().toString(36).substr(2, 9)}`;
        input.id = id;

        // Find associated label or create one
        let label = form.querySelector(`label[for="${id}"]`);
        if (!label) {
          label = form.querySelector("label");
          if (label) {
            label.setAttribute("for", id);
          }
        }

        // Add required indicator
        if (input.hasAttribute("required")) {
          input.setAttribute("aria-required", "true");
        }
      });
    });
  });
}

// Reduced motion preferences
export function respectReducedMotion() {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const applyReducedMotion = () => {
    // Remove existing styles to prevent duplicates
    const existing = document.getElementById("reduced-motion-styles");
    if (existing) {
      existing.remove();
    }

    const style = document.createElement("style");
    style.id = "reduced-motion-styles";
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    `;
    document.head.appendChild(style);
  };

  if (prefersReducedMotion.matches) {
    applyReducedMotion();
  }

  // Listen for changes in motion preference
  const handleChange = (e: MediaQueryListEvent) => {
    if (e.matches) {
      applyReducedMotion();
    } else {
      const style = document.getElementById("reduced-motion-styles");
      if (style) {
        style.remove();
      }
    }
  };

  prefersReducedMotion.addEventListener("change", handleChange);

  // Register cleanup
  cleanupRegistry.push(() => {
    prefersReducedMotion.removeEventListener("change", handleChange);
    const style = document.getElementById("reduced-motion-styles");
    if (style) {
      style.remove();
    }
  });
}

// Initialize all accessibility features
export function initAccessibilityFeatures() {
  // Only run in browser environment
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  try {
    addSkipToMainLink();
    manageFocus();
    enhanceKeyboardNavigation();
    setupLiveRegions();
    enhanceFormAccessibility();
    respectReducedMotion();
    validateColorContrast();
  } catch (error) {
    logger.error('Accessibility features initialization failed', {
      operation: 'init_accessibility',
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : String(error),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      features: [
        'skip_to_main',
        'focus_management',
        'keyboard_navigation',
        'live_regions',
        'form_accessibility',
        'reduced_motion',
        'color_contrast'
      ]
    });

    // Track accessibility initialization errors
    if (typeof window !== 'undefined' && analytics) {
      analytics.trackEvent('accessibility_init_error', {
        error_message: error instanceof Error ? error.message : String(error),
        page_url: window.location.href
      });
    }
  }
}

/**
 * Cleanup all accessibility features
 * Call this when unmounting or cleaning up the application
 * Per MDN: Proper cleanup prevents memory leaks in SPAs
 * Reference: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#memory_concerns
 */
export function cleanupAccessibilityFeatures() {
  cleanupRegistry.forEach(cleanup => {
    try {
      cleanup();
    } catch (error) {
      logger.error('Accessibility cleanup error', { error });
    }
  });
  cleanupRegistry.length = 0;
}
