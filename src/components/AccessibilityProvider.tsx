"use client";
import { useEffect } from 'react';
import { initAccessibilityFeatures, announceMessage } from '@/utils/accessibility';

export default function AccessibilityProvider() {
  useEffect(() => {
    // Initialize accessibility features when component mounts
    initAccessibilityFeatures();
    
    // Announce page load for screen readers
    announceMessage('Page loaded successfully', 'polite');
    
    // Listen for route changes (for Next.js SPA navigation)
    const handleRouteChange = () => {
      // Small delay to ensure content has loaded
      setTimeout(() => {
        announceMessage('Page content updated', 'polite');
      }, 100);
    };

    // Listen for navigation events
    window.addEventListener('popstate', handleRouteChange);
    
    // Listen for programmatic navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      handleRouteChange();
    };
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      handleRouteChange();
    };

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  return null; // This component doesn't render anything
}